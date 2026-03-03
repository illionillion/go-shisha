package postgres

import (
	"errors"
	"fmt"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"
)

func setupTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{
		TranslateError: true, // gorm.ErrDuplicatedKey 等への変換を有効化
	})
	if err != nil {
		t.Fatalf("failed to open sqlite in-memory: %v", err)
	}

	// PRAGMA foreign_keys = ON はコネクション単位で有効なため、単一コネクションに固定して
	// 全クエリで確実に外部キー制約が効くようにする
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("failed to get sql.DB: %v", err)
	}
	sqlDB.SetMaxOpenConns(1)
	sqlDB.SetMaxIdleConns(1)

	// SQLite はデフォルトで外部キー制約が無効なため明示的に有効化
	// これにより post_likes の user_id/post_id 参照整合性が Postgres に近い形で検証される
	if err := db.Exec("PRAGMA foreign_keys = ON").Error; err != nil {
		t.Fatalf("failed to enable foreign keys: %v", err)
	}

	// AutoMigrate schema for tests
	if err := db.AutoMigrate(&userModel{}, &postModel{}, &slideModel{}, &flavorModel{}, &postLikeModel{}); err != nil {
		t.Fatalf("failed to migrate schema: %v", err)
	}
	return db
}

func TestCreateAndGetPostWithSlides(t *testing.T) {
	db := setupTestDB(t)

	// prepare repository
	repo := NewPostRepository(db)

	// create user and flavor
	if err := db.Create(&userModel{ID: 1, Email: "u1@example.com", DisplayName: "u1"}).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}
	if err := db.Create(&flavorModel{ID: 1, Name: "Mint", Color: "#00FF"}).Error; err != nil {
		t.Fatalf("failed to create flavor: %v", err)
	}

	// create post domain
	p := &models.Post{
		UserID: 1,
		Slides: []models.Slide{
			{ImageURL: "/img1.jpg", Text: "s1", Flavor: &models.Flavor{ID: 1}},
			{ImageURL: "/img2.jpg", Text: "s2", Flavor: &models.Flavor{ID: 1}},
		},
		Likes: 0,
	}

	if err := repo.Create(p); err != nil {
		t.Fatalf("Create failed: %v", err)
	}

	if p.ID == 0 {
		t.Fatalf("expected post ID to be set")
	}

	got, err := repo.GetByID(p.ID, nil)
	if err != nil {
		t.Fatalf("GetByID failed: %v", err)
	}

	if len(got.Slides) != 2 {
		t.Fatalf("expected 2 slides, got %d", len(got.Slides))
	}

	if got.Slides[0].ImageURL != "/img1.jpg" || got.Slides[1].ImageURL != "/img2.jpg" {
		t.Fatalf("slides order or data mismatch: %+v", got.Slides)
	}
}

func TestGetAllAndGetByUserIDOrdering(t *testing.T) {
	db := setupTestDB(t)
	repo := NewPostRepository(db)

	// create user
	if err := db.Create(&userModel{ID: 1, Email: "u1@example.com", DisplayName: "u1"}).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	// create two posts
	p1 := &models.Post{UserID: 1, Slides: []models.Slide{{ImageURL: "/a.jpg", Text: "a"}}}
	if err := repo.Create(p1); err != nil {
		t.Fatalf("Create p1 failed: %v", err)
	}
	p2 := &models.Post{UserID: 1, Slides: []models.Slide{{ImageURL: "/b.jpg", Text: "b"}}}
	if err := repo.Create(p2); err != nil {
		t.Fatalf("Create p2 failed: %v", err)
	}

	all, err := repo.GetAll(nil)
	if err != nil {
		t.Fatalf("GetAll failed: %v", err)
	}
	if len(all) < 2 {
		t.Fatalf("expected at least 2 posts, got %d", len(all))
	}
	// newest first
	if all[0].ID != p2.ID {
		t.Fatalf("expected newest post first: got %d want %d", all[0].ID, p2.ID)
	}

	userPosts, err := repo.GetByUserID(1, nil)
	if err != nil {
		t.Fatalf("GetByUserID failed: %v", err)
	}
	if len(userPosts) < 2 {
		t.Fatalf("expected at least 2 user posts, got %d", len(userPosts))
	}
}

func TestCreatePostWithNoSlides(t *testing.T) {
	db := setupTestDB(t)
	repo := NewPostRepository(db)

	// create user
	if err := db.Create(&userModel{ID: 1, Email: "u1@example.com", DisplayName: "u1"}).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	// create post with empty slides
	p := &models.Post{UserID: 1, Slides: []models.Slide{}}
	if err := repo.Create(p); err != nil {
		t.Fatalf("Create with no slides failed: %v", err)
	}

	got, err := repo.GetByID(p.ID, nil)
	if err != nil {
		t.Fatalf("GetByID failed: %v", err)
	}

	if len(got.Slides) != 0 {
		t.Fatalf("expected 0 slides, got %d", len(got.Slides))
	}
}

func TestSlideFlavorAssociation(t *testing.T) {
	db := setupTestDB(t)
	repo := NewPostRepository(db)

	// create user and flavor
	if err := db.Create(&userModel{ID: 1, Email: "u1@example.com", DisplayName: "u1"}).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}
	if err := db.Create(&flavorModel{ID: 2, Name: "Berry", Color: "#FF00"}).Error; err != nil {
		t.Fatalf("failed to create flavor: %v", err)
	}

	// create post with a slide that references the flavor
	p := &models.Post{
		UserID: 1,
		Slides: []models.Slide{{ImageURL: "/f1.jpg", Text: "flavored", Flavor: &models.Flavor{ID: 2}}},
	}

	if err := repo.Create(p); err != nil {
		t.Fatalf("Create with flavor slide failed: %v", err)
	}

	got, err := repo.GetByID(p.ID, nil)
	if err != nil {
		t.Fatalf("GetByID failed: %v", err)
	}

	if len(got.Slides) != 1 {
		t.Fatalf("expected 1 slide, got %d", len(got.Slides))
	}
	if got.Slides[0].Flavor == nil || got.Slides[0].Flavor.ID != 2 {
		t.Fatalf("expected slide flavor ID 2, got %+v", got.Slides[0].Flavor)
	}
}

// --- post_likes 関連テスト ---

// setupPostAndUser は共通のユーザー・投稿セットアップヘルパー
func setupPostAndUser(t *testing.T, db *gorm.DB) (userID int, postID int) {
	t.Helper()
	if err := db.Create(&userModel{ID: 1, Email: "u1@example.com", DisplayName: "u1"}).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}
	repo := NewPostRepository(db)
	p := &models.Post{UserID: 1, Slides: []models.Slide{{ImageURL: "/img.jpg", Text: "t"}}}
	if err := repo.Create(p); err != nil {
		t.Fatalf("failed to create post: %v", err)
	}
	return 1, p.ID
}

func TestHasLiked_NotLiked(t *testing.T) {
	db := setupTestDB(t)
	repo := NewPostRepository(db)
	userID, postID := setupPostAndUser(t, db)

	liked, err := repo.HasLiked(userID, postID)
	if err != nil {
		t.Fatalf("HasLiked failed: %v", err)
	}
	if liked {
		t.Fatalf("expected HasLiked=false before any like")
	}
}

func TestAddLike(t *testing.T) {
	db := setupTestDB(t)
	repo := NewPostRepository(db)
	userID, postID := setupPostAndUser(t, db)

	if err := repo.AddLike(userID, postID); err != nil {
		t.Fatalf("AddLike failed: %v", err)
	}

	liked, err := repo.HasLiked(userID, postID)
	if err != nil {
		t.Fatalf("HasLiked after AddLike failed: %v", err)
	}
	if !liked {
		t.Fatalf("expected HasLiked=true after AddLike")
	}

	// likes カラムが +1 されていること
	got, err := repo.GetByID(postID, nil)
	if err != nil {
		t.Fatalf("GetByID failed: %v", err)
	}
	if got.Likes != 1 {
		t.Fatalf("expected likes=1 after AddLike, got %d", got.Likes)
	}
}

func TestAddLike_Duplicate(t *testing.T) {
	db := setupTestDB(t)
	repo := NewPostRepository(db)
	userID, postID := setupPostAndUser(t, db)

	if err := repo.AddLike(userID, postID); err != nil {
		t.Fatalf("first AddLike failed: %v", err)
	}

	err := repo.AddLike(userID, postID)
	if !errors.Is(err, repositories.ErrAlreadyLiked) {
		t.Fatalf("expected ErrAlreadyLiked on duplicate like, got %v", err)
	}
}

func TestRemoveLike(t *testing.T) {
	db := setupTestDB(t)
	repo := NewPostRepository(db)
	userID, postID := setupPostAndUser(t, db)

	if err := repo.AddLike(userID, postID); err != nil {
		t.Fatalf("AddLike failed: %v", err)
	}
	if err := repo.RemoveLike(userID, postID); err != nil {
		t.Fatalf("RemoveLike failed: %v", err)
	}

	liked, err := repo.HasLiked(userID, postID)
	if err != nil {
		t.Fatalf("HasLiked after RemoveLike failed: %v", err)
	}
	if liked {
		t.Fatalf("expected HasLiked=false after RemoveLike")
	}

	// likes カラムが 0 に戻っていること
	got, err := repo.GetByID(postID, nil)
	if err != nil {
		t.Fatalf("GetByID failed: %v", err)
	}
	if got.Likes != 0 {
		t.Fatalf("expected likes=0 after RemoveLike, got %d", got.Likes)
	}
}

func TestRemoveLike_NotLiked(t *testing.T) {
	db := setupTestDB(t)
	repo := NewPostRepository(db)
	userID, postID := setupPostAndUser(t, db)

	err := repo.RemoveLike(userID, postID)
	if !errors.Is(err, repositories.ErrNotLiked) {
		t.Fatalf("expected ErrNotLiked on unlike without prior like, got %v", err)
	}
}

func TestGetAll_IsLiked(t *testing.T) {
	db := setupTestDB(t)
	repo := NewPostRepository(db)
	userID, postID := setupPostAndUser(t, db)

	// いいね前は is_liked=false
	postsBeforeLike, err := repo.GetAll(&userID)
	if err != nil {
		t.Fatalf("GetAll failed: %v", err)
	}
	var found bool
	for _, p := range postsBeforeLike {
		if p.ID == postID {
			found = true
			if p.IsLiked {
				t.Fatalf("expected is_liked=false before like")
			}
		}
	}
	if !found {
		t.Fatalf("post %d not found in GetAll", postID)
	}

	// いいね後は is_liked=true
	if err := repo.AddLike(userID, postID); err != nil {
		t.Fatalf("AddLike failed: %v", err)
	}
	postsAfterLike, err := repo.GetAll(&userID)
	if err != nil {
		t.Fatalf("GetAll after like failed: %v", err)
	}
	for _, p := range postsAfterLike {
		if p.ID == postID && !p.IsLiked {
			t.Fatalf("expected is_liked=true after AddLike in GetAll")
		}
	}

	// userID=nil のとき is_liked=false
	postsNoUser, err := repo.GetAll(nil)
	if err != nil {
		t.Fatalf("GetAll(nil) failed: %v", err)
	}
	for _, p := range postsNoUser {
		if p.ID == postID && p.IsLiked {
			t.Fatalf("expected is_liked=false when userID=nil")
		}
	}
}

func TestGetByID_IsLiked(t *testing.T) {
	db := setupTestDB(t)
	repo := NewPostRepository(db)
	userID, postID := setupPostAndUser(t, db)

	// いいね前は is_liked=false
	postBefore, err := repo.GetByID(postID, &userID)
	if err != nil {
		t.Fatalf("GetByID failed: %v", err)
	}
	if postBefore.IsLiked {
		t.Fatalf("expected is_liked=false before like")
	}

	// いいね後は is_liked=true
	if err := repo.AddLike(userID, postID); err != nil {
		t.Fatalf("AddLike failed: %v", err)
	}
	postAfter, err := repo.GetByID(postID, &userID)
	if err != nil {
		t.Fatalf("GetByID after like failed: %v", err)
	}
	if !postAfter.IsLiked {
		t.Fatalf("expected is_liked=true after AddLike in GetByID")
	}

	// userID=nil のとき is_liked=false
	postNoUser, err := repo.GetByID(postID, nil)
	if err != nil {
		t.Fatalf("GetByID(nil) failed: %v", err)
	}
	if postNoUser.IsLiked {
		t.Fatalf("expected is_liked=false when userID=nil")
	}
}

func TestGetByUserID_IsLiked(t *testing.T) {
	db := setupTestDB(t)
	repo := NewPostRepository(db)
	userID, postID := setupPostAndUser(t, db)

	// (1) いいね前は is_liked=false
	postsBeforeLike, err := repo.GetByUserID(userID, &userID)
	if err != nil {
		t.Fatalf("GetByUserID failed: %v", err)
	}
	var found bool
	for _, p := range postsBeforeLike {
		if p.ID == postID {
			found = true
			if p.IsLiked {
				t.Fatalf("expected is_liked=false before like")
			}
		}
	}
	if !found {
		t.Fatalf("post %d not found in GetByUserID", postID)
	}

	// (2) いいね後は is_liked=true
	if err := repo.AddLike(userID, postID); err != nil {
		t.Fatalf("AddLike failed: %v", err)
	}
	postsAfterLike, err := repo.GetByUserID(userID, &userID)
	if err != nil {
		t.Fatalf("GetByUserID after like failed: %v", err)
	}
	for _, p := range postsAfterLike {
		if p.ID == postID && !p.IsLiked {
			t.Fatalf("expected is_liked=true after AddLike in GetByUserID")
		}
	}

	// (3) currentUserID=nil のとき is_liked=false
	postsNoUser, err := repo.GetByUserID(userID, nil)
	if err != nil {
		t.Fatalf("GetByUserID(nil) failed: %v", err)
	}
	for _, p := range postsNoUser {
		if p.ID == postID && p.IsLiked {
			t.Fatalf("expected is_liked=false when currentUserID=nil")
		}
	}
}
