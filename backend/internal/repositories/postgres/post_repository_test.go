package postgres

import (
	"fmt"
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"go-shisha-backend/internal/models"
)

func setupTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite in-memory: %v", err)
	}

	// AutoMigrate schema for tests
	if err := db.AutoMigrate(&userModel{}, &postModel{}, &slideModel{}, &flavorModel{}); err != nil {
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

	got, err := repo.GetByID(p.ID)
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

	all, err := repo.GetAll()
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

	userPosts, err := repo.GetByUserID(1)
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

	got, err := repo.GetByID(p.ID)
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

	got, err := repo.GetByID(p.ID)
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
