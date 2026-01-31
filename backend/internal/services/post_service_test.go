package services

import (
	"errors"
	"reflect"
	"testing"
	"time"

	"go-shisha-backend/internal/models"
)

type mockPostRepo struct{}

func (m *mockPostRepo) GetAll() ([]models.Post, error) { return []models.Post{{ID: 1}}, nil }
func (m *mockPostRepo) GetByID(id int) (*models.Post, error) {
	p := &models.Post{ID: id, Likes: 0}
	return p, nil
}
func (m *mockPostRepo) GetByUserID(userID int) ([]models.Post, error) {
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

func (m *mockUploadRepo) Create(upload *models.UploadDB) error { return nil }
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
func (m *mockUploadRepo) UpdateStatus(id int, status string) error { return nil }
func (m *mockUploadRepo) MarkAsUsed(filePath string) error { return nil }
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
	postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})
	liked, err := postSvc.LikePost(2)
	if err != nil {
		t.Fatalf("unexpected error like: %v", err)
	}
	if !liked.IsLiked || liked.Likes != 1 {
		t.Fatalf("expected liked post with Likes=1 IsLiked=true, got %+v", liked)
	}

	unliked, err := postSvc.UnlikePost(2)
	if err != nil {
		t.Fatalf("unexpected error unlike: %v", err)
	}
	if unliked.IsLiked || unliked.Likes != 0 {
		t.Fatalf("expected unliked post with Likes=0 IsLiked=false, got %+v", unliked)
	}
}

func TestGetAllPosts(t *testing.T) {
	postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})
	posts, err := postSvc.GetAllPosts()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !reflect.DeepEqual(posts, []models.Post{{ID: 1}}) {
		t.Fatalf("unexpected posts: %+v", posts)
	}
}

// Error cases for PostService
type mockPostRepoError struct{}

func (m *mockPostRepoError) GetAll() ([]models.Post, error)       { return nil, errors.New("db error") }
func (m *mockPostRepoError) GetByID(id int) (*models.Post, error) { return nil, errors.New("db error") }
func (m *mockPostRepoError) GetByUserID(userID int) ([]models.Post, error) {
	return nil, errors.New("db error")
}
func (m *mockPostRepoError) Create(post *models.Post) error { return errors.New("db error") }
func (m *mockPostRepoError) IncrementLikes(id int) (*models.Post, error) {
	return nil, errors.New("db error")
}
func (m *mockPostRepoError) DecrementLikes(id int) (*models.Post, error) {
	return nil, errors.New("db error")
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
	_, err := postSvc.LikePost(1)
	if err == nil {
		t.Fatalf("expected error when IncrementLikes fails, got nil")
	}
}

func TestUnlikePost_Error(t *testing.T) {
	postSvc := NewPostService(&mockPostRepoError{}, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})
	_, err := postSvc.UnlikePost(1)
	if err == nil {
		t.Fatalf("expected error when DecrementLikes fails, got nil")
	}
}
