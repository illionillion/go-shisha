package services

import (
	"errors"
	"reflect"
	"testing"
	"time"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"
)

type mockPostRepo struct{}

func (m *mockPostRepo) GetAll(userID *int) ([]models.Post, error) {
	return []models.Post{{ID: 1}}, nil
}
func (m *mockPostRepo) GetByID(id int, userID *int) (*models.Post, error) {
	p := &models.Post{ID: id, Likes: 0}
	return p, nil
}
func (m *mockPostRepo) GetByUserID(userID int, currentUserID *int) ([]models.Post, error) {
	return []models.Post{{ID: 1, UserID: userID}}, nil
}
func (m *mockPostRepo) Create(post *models.Post) error {
	post.ID = 10
	post.CreatedAt = time.Now()
	return nil
}
func (m *mockPostRepo) IncrementLikes(id int) (*models.Post, error) {
	return &models.Post{ID: id, Likes: 1}, nil
}
func (m *mockPostRepo) DecrementLikes(id int) (*models.Post, error) {
	return &models.Post{ID: id, Likes: 0}, nil
}
func (m *mockPostRepo) AddLike(userID, postID int) error    { return nil }
func (m *mockPostRepo) RemoveLike(userID, postID int) error { return nil }
func (m *mockPostRepo) HasLiked(userID, postID int) (bool, error) {
	return false, nil
}

// spyPostRepo は AddLike/RemoveLike の呼び出しを記録し、状態を追跡するスパイ
type spyPostRepo struct {
	mockPostRepo
	addLikeCalled    bool
	addLikeUserID    int
	addLikePostID    int
	removeLikeCalled bool
	removeLikeUserID int
	removeLikePostID int
	// GetByID が返す状態（AddLike/RemoveLike 後の実挙動をシミュレート）
	currentLikes   int
	currentIsLiked bool
}

func (s *spyPostRepo) AddLike(userID, postID int) error {
	s.addLikeCalled = true
	s.addLikeUserID = userID
	s.addLikePostID = postID
	s.currentLikes++
	s.currentIsLiked = true
	return nil
}
func (s *spyPostRepo) RemoveLike(userID, postID int) error {
	s.removeLikeCalled = true
	s.removeLikeUserID = userID
	s.removeLikePostID = postID
	if s.currentLikes > 0 {
		s.currentLikes--
	}
	s.currentIsLiked = false
	return nil
}
func (s *spyPostRepo) GetByID(id int, userID *int) (*models.Post, error) {
	return &models.Post{ID: id, Likes: s.currentLikes, IsLiked: s.currentIsLiked}, nil
}

type mockUserRepoForPost struct{}

func (m *mockUserRepoForPost) GetAll() ([]models.User, error) { return nil, nil }
func (m *mockUserRepoForPost) GetByID(id int) (*models.User, error) {
	return &models.User{ID: id, Email: "u@example.com", DisplayName: "U"}, nil
}

type mockFlavorRepo struct{}

func (m *mockFlavorRepo) GetByID(id int) (*models.Flavor, error) {
	flavors := map[int]models.Flavor{
		1: {ID: 1, Name: "ミント", Color: "bg-green-500"},
		2: {ID: 2, Name: "アップル", Color: "bg-red-500"},
		3: {ID: 3, Name: "ベリー", Color: "bg-purple-500"},
	}
	if flavor, ok := flavors[id]; ok {
		return &flavor, nil
	}
	return nil, errors.New("flavor not found")
}

func (m *mockFlavorRepo) GetAll() ([]models.Flavor, error) {
	return []models.Flavor{
		{ID: 1, Name: "ミント", Color: "bg-green-500"},
		{ID: 2, Name: "アップル", Color: "bg-red-500"},
		{ID: 3, Name: "ベリー", Color: "bg-purple-500"},
	}, nil
}

type mockUploadRepo struct{}

func (m *mockUploadRepo) Create(upload *models.UploadDB) error     { return nil }
func (m *mockUploadRepo) GetByID(id int) (*models.UploadDB, error) { return nil, nil }
func (m *mockUploadRepo) GetByFilePath(filePath string) (*models.UploadDB, error) {
	return &models.UploadDB{
		ID:       1,
		UserID:   1,
		FilePath: filePath,
		Status:   "uploaded",
	}, nil
}
func (m *mockUploadRepo) GetByUserID(userID int) ([]models.UploadDB, error) { return nil, nil }
func (m *mockUploadRepo) UpdateStatus(id int, status string) error          { return nil }
func (m *mockUploadRepo) MarkAsUsed(filePath string) error                  { return nil }
func (m *mockUploadRepo) DeleteUnusedOlderThan(duration time.Duration) (int64, error) {
	return 0, nil
}

func TestCreatePost(t *testing.T) {
	postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})
	input := &models.CreatePostInput{Slides: []models.SlideInput{{ImageURL: "/images/test.jpg", Text: "hello"}}}
	p, err := postSvc.CreatePost(1, input)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.ID != 10 {
		t.Fatalf("expected created post ID 10, got %d", p.ID)
	}
	if p.User.ID != 1 {
		t.Fatalf("expected user ID 1 on post, got %v", p.User)
	}
}

func TestCreatePost_WithFlavor(t *testing.T) {
	postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})
	flavorID := 1
	input := &models.CreatePostInput{
		Slides: []models.SlideInput{
			{
				ImageURL: "/images/test.jpg",
				Text:     "ミント味最高！",
				FlavorID: &flavorID,
			},
		},
	}
	p, err := postSvc.CreatePost(1, input)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(p.Slides) != 1 {
		t.Fatalf("expected 1 slide, got %d", len(p.Slides))
	}
	if p.Slides[0].Flavor == nil {
		t.Fatalf("expected flavor to be populated, got nil")
	}
	if p.Slides[0].Flavor.Name != "ミント" {
		t.Fatalf("expected flavor name 'ミント', got '%s'", p.Slides[0].Flavor.Name)
	}
	if p.Slides[0].Flavor.Color != "bg-green-500" {
		t.Fatalf("expected flavor color 'bg-green-500', got '%s'", p.Slides[0].Flavor.Color)
	}
}

func TestCreatePost_WithInvalidFlavorID(t *testing.T) {
	postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})
	invalidFlavorID := 999
	input := &models.CreatePostInput{
		Slides: []models.SlideInput{
			{
				ImageURL: "/images/test.jpg",
				Text:     "無効なFlavor ID",
				FlavorID: &invalidFlavorID,
			},
		},
	}
	p, err := postSvc.CreatePost(1, input)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(p.Slides) != 1 {
		t.Fatalf("expected 1 slide, got %d", len(p.Slides))
	}
	// ImageURLとTextが正しく設定されていることを確認
	if p.Slides[0].ImageURL != "/images/test.jpg" {
		t.Fatalf("expected ImageURL '/images/test.jpg', got '%s'", p.Slides[0].ImageURL)
	}
	if p.Slides[0].Text != "無効なFlavor ID" {
		t.Fatalf("expected Text '無効なFlavor ID', got '%s'", p.Slides[0].Text)
	}
	// 無効なFlavorIDの場合、Flavorはnilになる（投稿作成は失敗しない）
	if p.Slides[0].Flavor != nil {
		t.Fatalf("expected flavor to be nil for invalid flavor_id, got %+v", p.Slides[0].Flavor)
	}
}

func TestLikeUnlikePost(t *testing.T) {
	spy := &spyPostRepo{}
	postSvc := NewPostService(spy, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})
	liked, err := postSvc.LikePost(1, 2)
	if err != nil {
		t.Fatalf("unexpected error like: %v", err)
	}
	// AddLike が userID=1, postID=2 で呼ばれたことを確認
	if !spy.addLikeCalled {
		t.Error("expected AddLike to be called")
	}
	if spy.addLikeUserID != 1 || spy.addLikePostID != 2 {
		t.Errorf("expected AddLike(1, 2), got AddLike(%d, %d)", spy.addLikeUserID, spy.addLikePostID)
	}
	// AddLike 後: Likes=1, IsLiked=true（いいね後の状態が反映されていることを確認）
	if liked.ID != 2 {
		t.Fatalf("expected post ID=2, got %+v", liked)
	}
	if liked.Likes != 1 {
		t.Fatalf("expected Likes=1 after LikePost, got %d", liked.Likes)
	}
	if !liked.IsLiked {
		t.Fatal("expected IsLiked=true after LikePost")
	}

	unliked, err := postSvc.UnlikePost(1, 2)
	if err != nil {
		t.Fatalf("unexpected error unlike: %v", err)
	}
	// RemoveLike が userID=1, postID=2 で呼ばれたことを確認
	if !spy.removeLikeCalled {
		t.Error("expected RemoveLike to be called")
	}
	if spy.removeLikeUserID != 1 || spy.removeLikePostID != 2 {
		t.Errorf("expected RemoveLike(1, 2), got RemoveLike(%d, %d)", spy.removeLikeUserID, spy.removeLikePostID)
	}
	// RemoveLike 後: Likes=0, IsLiked=false（いいね取り消し後の状態が反映されていることを確認）
	if unliked.ID != 2 {
		t.Fatalf("expected post ID=2, got %+v", unliked)
	}
	if unliked.Likes != 0 {
		t.Fatalf("expected Likes=0 after UnlikePost, got %d", unliked.Likes)
	}
	if unliked.IsLiked {
		t.Fatal("expected IsLiked=false after UnlikePost")
	}
}

func TestGetAllPosts(t *testing.T) {
	postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})
	posts, err := postSvc.GetAllPosts(nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !reflect.DeepEqual(posts, []models.Post{{ID: 1}}) {
		t.Fatalf("unexpected posts: %+v", posts)
	}
}

// Error cases for PostService
type mockPostRepoError struct{}

func (m *mockPostRepoError) GetAll(userID *int) ([]models.Post, error) {
	return nil, errors.New("db error")
}
func (m *mockPostRepoError) GetByID(id int, userID *int) (*models.Post, error) {
	return nil, errors.New("db error")
}
func (m *mockPostRepoError) GetByUserID(userID int, currentUserID *int) ([]models.Post, error) {
	return nil, errors.New("db error")
}
func (m *mockPostRepoError) Create(post *models.Post) error { return errors.New("db error") }
func (m *mockPostRepoError) IncrementLikes(id int) (*models.Post, error) {
	return nil, errors.New("db error")
}
func (m *mockPostRepoError) DecrementLikes(id int) (*models.Post, error) {
	return nil, errors.New("db error")
}
func (m *mockPostRepoError) AddLike(userID, postID int) error    { return errors.New("db error") }
func (m *mockPostRepoError) RemoveLike(userID, postID int) error { return errors.New("db error") }
func (m *mockPostRepoError) HasLiked(userID, postID int) (bool, error) {
	return false, errors.New("db error")
}

type mockUserRepoMissing struct{}

func (m *mockUserRepoMissing) GetAll() ([]models.User, error) { return nil, nil }
func (m *mockUserRepoMissing) GetByID(id int) (*models.User, error) {
	return nil, errors.New("user not found")
}

func TestCreatePost_UserMissing(t *testing.T) {
	postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoMissing{}, &mockFlavorRepo{}, &mockUploadRepo{})
	input := &models.CreatePostInput{Slides: []models.SlideInput{{ImageURL: "/images/test.jpg", Text: "hello"}}}
	_, err := postSvc.CreatePost(999, input)
	if err == nil {
		t.Fatalf("expected error when user is missing, got nil")
	}
}

func TestCreatePost_PostCreateError(t *testing.T) {
	postSvc := NewPostService(&mockPostRepoError{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})
	input := &models.CreatePostInput{Slides: []models.SlideInput{{ImageURL: "/images/test.jpg", Text: "hello"}}}
	_, err := postSvc.CreatePost(1, input)
	if err == nil {
		t.Fatalf("expected error when post create fails, got nil")
	}
}

func TestLikePost_Error(t *testing.T) {
	postSvc := NewPostService(&mockPostRepoError{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})
	_, err := postSvc.LikePost(1, 1)
	if err == nil {
		t.Fatalf("expected error when AddLike fails, got nil")
	}
}

func TestUnlikePost_Error(t *testing.T) {
	postSvc := NewPostService(&mockPostRepoError{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})
	_, err := postSvc.UnlikePost(1, 1)
	if err == nil {
		t.Fatalf("expected error when RemoveLike fails, got nil")
	}
}

// 画像URL検証のテスト

// mockUploadRepoInvalidPath は".."を含むパスでエラーを返すモック
type mockUploadRepoInvalidPath struct {
	mockUploadRepo
}

func (m *mockUploadRepoInvalidPath) GetByFilePath(filePath string) (*models.UploadDB, error) {
	// パストラバーサルのケースでは呼ばれない（事前検証で弾かれる）
	return m.mockUploadRepo.GetByFilePath(filePath)
}

func TestCreatePost_ImageValidation_InvalidPath(t *testing.T) {
	postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepoInvalidPath{})
	input := &models.CreatePostInput{
		Slides: []models.SlideInput{{ImageURL: "/images/../etc/passwd", Text: "hack"}},
	}
	_, err := postSvc.CreatePost(1, input)
	if err == nil {
		t.Fatalf("expected error for path traversal, got nil")
	}
	if !errors.Is(err, ErrInvalidImagePath) {
		t.Fatalf("expected ErrInvalidImagePath, got %v", err)
	}
}

// mockUploadRepoNotAllowed は/images/以外のパスでテスト
type mockUploadRepoNotAllowed struct {
	mockUploadRepo
}

func TestCreatePost_ImageValidation_NotAllowed(t *testing.T) {
	postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepoNotAllowed{})
	input := &models.CreatePostInput{
		Slides: []models.SlideInput{{ImageURL: "/uploads/test.jpg", Text: "wrong prefix"}},
	}
	_, err := postSvc.CreatePost(1, input)
	if err == nil {
		t.Fatalf("expected error for disallowed path prefix, got nil")
	}
	if !errors.Is(err, ErrImageNotAllowed) {
		t.Fatalf("expected ErrImageNotAllowed, got %v", err)
	}
}

// mockUploadRepoNotFound はDB未存在でエラーを返すモック
type mockUploadRepoNotFound struct {
	mockUploadRepo
}

func (m *mockUploadRepoNotFound) GetByFilePath(filePath string) (*models.UploadDB, error) {
	return nil, repositories.ErrUploadNotFound
}

func TestCreatePost_ImageValidation_NotFound(t *testing.T) {
	postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepoNotFound{})
	input := &models.CreatePostInput{
		Slides: []models.SlideInput{{ImageURL: "/images/notfound.jpg", Text: "missing"}},
	}
	_, err := postSvc.CreatePost(1, input)
	if err == nil {
		t.Fatalf("expected error for missing image, got nil")
	}
	if !errors.Is(err, ErrImageNotFound) {
		t.Fatalf("expected ErrImageNotFound, got %v", err)
	}
}

// mockUploadRepoWrongUser は他ユーザーの画像を返すモック
type mockUploadRepoWrongUser struct {
	mockUploadRepo
}

func (m *mockUploadRepoWrongUser) GetByFilePath(filePath string) (*models.UploadDB, error) {
	return &models.UploadDB{
		ID:       1,
		UserID:   999, // 異なるユーザーID
		FilePath: filePath,
		Status:   "uploaded",
	}, nil
}

func TestCreatePost_ImageValidation_PermissionDenied(t *testing.T) {
	postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepoWrongUser{})
	input := &models.CreatePostInput{
		Slides: []models.SlideInput{{ImageURL: "/images/others.jpg", Text: "not mine"}},
	}
	_, err := postSvc.CreatePost(1, input) // userID=1だが画像はuserID=999のもの
	if err == nil {
		t.Fatalf("expected error for permission denied, got nil")
	}
	if !errors.Is(err, ErrImagePermissionDenied) {
		t.Fatalf("expected ErrImagePermissionDenied, got %v", err)
	}
}

// mockUploadRepoDeleted は削除済み画像を返すモック
type mockUploadRepoDeleted struct {
	mockUploadRepo
}

func (m *mockUploadRepoDeleted) GetByFilePath(filePath string) (*models.UploadDB, error) {
	return &models.UploadDB{
		ID:       1,
		UserID:   1,
		FilePath: filePath,
		Status:   "deleted", // 削除済み
	}, nil
}

func TestCreatePost_ImageValidation_Deleted(t *testing.T) {
	postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepoDeleted{})
	input := &models.CreatePostInput{
		Slides: []models.SlideInput{{ImageURL: "/images/deleted.jpg", Text: "gone"}},
	}
	_, err := postSvc.CreatePost(1, input)
	if err == nil {
		t.Fatalf("expected error for deleted image, got nil")
	}
	if !errors.Is(err, ErrImageDeleted) {
		t.Fatalf("expected ErrImageDeleted, got %v", err)
	}
}

// いいね重複テスト用モック
type mockPostRepoAlreadyLiked struct {
	mockPostRepo
}

func (m *mockPostRepoAlreadyLiked) AddLike(userID, postID int) error {
	return repositories.ErrAlreadyLiked
}

func TestLikePost_AlreadyLiked(t *testing.T) {
	postSvc := NewPostService(&mockPostRepoAlreadyLiked{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})
	_, err := postSvc.LikePost(1, 2)
	if err == nil {
		t.Fatalf("expected error for already liked, got nil")
	}
	if !errors.Is(err, repositories.ErrAlreadyLiked) {
		t.Fatalf("expected ErrAlreadyLiked, got %v", err)
	}
}

// いいね未実施テスト用モック
type mockPostRepoNotLiked struct {
	mockPostRepo
}

func (m *mockPostRepoNotLiked) RemoveLike(userID, postID int) error {
	return repositories.ErrNotLiked
}

func TestUnlikePost_NotLiked(t *testing.T) {
	postSvc := NewPostService(&mockPostRepoNotLiked{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})
	_, err := postSvc.UnlikePost(1, 2)
	if err == nil {
		t.Fatalf("expected error for not liked, got nil")
	}
	if !errors.Is(err, repositories.ErrNotLiked) {
		t.Fatalf("expected ErrNotLiked, got %v", err)
	}
}

func TestGetAllPosts_WithUserID(t *testing.T) {
	postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})
	userID := 1
	posts, err := postSvc.GetAllPosts(&userID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(posts) == 0 {
		t.Fatalf("expected posts, got empty")
	}
}

func TestGetPostByID_WithUserID(t *testing.T) {
	postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})
	userID := 1
	post, err := postSvc.GetPostByID(1, &userID)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if post.ID != 1 {
		t.Fatalf("expected post ID=1, got %d", post.ID)
	}
}
