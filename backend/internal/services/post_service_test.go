package services

import (
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

func TestCreatePost(t *testing.T) {
    postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{})
    input := &models.CreatePostInput{UserID: 1, Slides: []models.Slide{{ImageURL: "i.jpg", Text: "hello"}}}
    p, err := postSvc.CreatePost(input)
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

func TestLikeUnlikePost(t *testing.T) {
    postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{})
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
    postSvc := NewPostService(&mockPostRepo{}, &mockUserRepoForPost{})
    posts, err := postSvc.GetAllPosts()
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if !reflect.DeepEqual(posts, []models.Post{{ID: 1}}) {
        t.Fatalf("unexpected posts: %+v", posts)
    }
}
