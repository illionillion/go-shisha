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
func (m *mockPostRepo) DeletePost(userID, postID int) error { return nil }
func (m *mockPostRepo) UpdatePost(userID, postID int, slides []models.UpdateSlideInput) (*models.Post, error) {
	return &models.Post{ID: postID}, nil
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
func (s *spyPostRepo) DeletePost(userID, postID int) error { return nil }
func (s *spyPostRepo) UpdatePost(userID, postID int, slides []models.UpdateSlideInput) (*models.Post, error) {
	return &models.Post{ID: postID}, nil
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
	return nil, repositories.ErrFlavorNotFound
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
func (m *mockPostRepoError) DeletePost(userID, postID int) error { return errors.New("db error") }
func (m *mockPostRepoError) UpdatePost(userID, postID int, slides []models.UpdateSlideInput) (*models.Post, error) {
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

// deletePostRepo はDeletePost用のモックリポジトリ
type deletePostRepo struct {
	mockPostRepo
	deleteErr error
}

func (d *deletePostRepo) DeletePost(userID, postID int) error {
	return d.deleteErr
}

func TestDeletePost_Success(t *testing.T) {
	repo := &deletePostRepo{deleteErr: nil}
	postSvc := NewPostService(repo, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})

	if err := postSvc.DeletePost(1, 10); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestDeletePost_NotFound(t *testing.T) {
	repo := &deletePostRepo{deleteErr: repositories.ErrPostNotFound}
	postSvc := NewPostService(repo, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})

	err := postSvc.DeletePost(1, 999)
	if !errors.Is(err, repositories.ErrPostNotFound) {
		t.Fatalf("expected ErrPostNotFound, got %v", err)
	}
}

func TestDeletePost_Forbidden(t *testing.T) {
	repo := &deletePostRepo{deleteErr: repositories.ErrForbidden}
	postSvc := NewPostService(repo, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})

	err := postSvc.DeletePost(1, 2)
	if !errors.Is(err, repositories.ErrForbidden) {
		t.Fatalf("expected ErrForbidden, got %v", err)
	}
}

// updatePostRepo はUpdatePost用のモックリポジトリ
type updatePostRepo struct {
	mockPostRepo
	updateResult  *models.Post
	updateErr     error
	capturedSlides []models.UpdateSlideInput
}

func (u *updatePostRepo) UpdatePost(userID, postID int, slides []models.UpdateSlideInput) (*models.Post, error) {
	u.capturedSlides = slides
	return u.updateResult, u.updateErr
}

func TestUpdatePost_Success(t *testing.T) {
	expected := &models.Post{ID: 10, UserID: 1}
	repo := &updatePostRepo{updateResult: expected}
	postSvc := NewPostService(repo, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})

	input := &models.UpdatePostInput{
		Slides: []models.UpdateSlideInput{{ID: 1, Text: "updated"}},
	}
	post, err := postSvc.UpdatePost(1, 10, input)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if post.ID != 10 {
		t.Fatalf("expected post ID=10, got %d", post.ID)
	}
}

func TestUpdatePost_NotFound(t *testing.T) {
	repo := &updatePostRepo{updateErr: repositories.ErrPostNotFound}
	postSvc := NewPostService(repo, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})

	input := &models.UpdatePostInput{
		Slides: []models.UpdateSlideInput{{ID: 1, Text: "updated"}},
	}
	_, err := postSvc.UpdatePost(1, 999, input)
	if !errors.Is(err, repositories.ErrPostNotFound) {
		t.Fatalf("expected ErrPostNotFound, got %v", err)
	}
}

func TestUpdatePost_Forbidden(t *testing.T) {
	repo := &updatePostRepo{updateErr: repositories.ErrForbidden}
	postSvc := NewPostService(repo, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})

	input := &models.UpdatePostInput{
		Slides: []models.UpdateSlideInput{{ID: 1, Text: "updated"}},
	}
	_, err := postSvc.UpdatePost(2, 10, input)
	if !errors.Is(err, repositories.ErrForbidden) {
		t.Fatalf("expected ErrForbidden, got %v", err)
	}
}

func TestUpdatePost_SlideCountMismatch(t *testing.T) {
	repo := &updatePostRepo{updateErr: repositories.ErrSlideCountMismatch}
	postSvc := NewPostService(repo, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})

	input := &models.UpdatePostInput{
		Slides: []models.UpdateSlideInput{{ID: 1, Text: "a"}, {ID: 2, Text: "b"}},
	}
	_, err := postSvc.UpdatePost(1, 10, input)
	if !errors.Is(err, repositories.ErrSlideCountMismatch) {
		t.Fatalf("expected ErrSlideCountMismatch, got %v", err)
	}
}

func TestUpdatePost_DuplicateSlideID(t *testing.T) {
	repo := &updatePostRepo{updateErr: repositories.ErrDuplicateSlideID}
	postSvc := NewPostService(repo, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})

	input := &models.UpdatePostInput{
		Slides: []models.UpdateSlideInput{{ID: 1, Text: "a"}, {ID: 1, Text: "b"}},
	}
	_, err := postSvc.UpdatePost(1, 10, input)
	if !errors.Is(err, repositories.ErrDuplicateSlideID) {
		t.Fatalf("expected ErrDuplicateSlideID, got %v", err)
	}
}

func TestUpdatePost_SlideNotBelongToPost(t *testing.T) {
	repo := &updatePostRepo{updateErr: repositories.ErrSlideNotBelongToPost}
	postSvc := NewPostService(repo, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})

	input := &models.UpdatePostInput{
		Slides: []models.UpdateSlideInput{{ID: 999, Text: "a"}},
	}
	_, err := postSvc.UpdatePost(1, 10, input)
	if !errors.Is(err, repositories.ErrSlideNotBelongToPost) {
		t.Fatalf("expected ErrSlideNotBelongToPost, got %v", err)
	}
}

// mockFlavorRepoDBError は GetByID でDB障害エラーを返すモック
type mockFlavorRepoDBError struct{}

// GetByID はDB障害エラーを返すモックメソッド
func (m *mockFlavorRepoDBError) GetByID(id int) (*models.Flavor, error) {
	return nil, errors.New("DB接続エラー")
}

// GetAll はnilを返すモックメソッド
func (m *mockFlavorRepoDBError) GetAll() ([]models.Flavor, error) {
	return nil, nil
}

func TestUpdatePost_WithInvalidFlavorID(t *testing.T) {
	// 無効なflavor_idが指定された場合、UpdatePostはエラーにならず
	// 該当スライドのFlavorIDがnilに落とされてrepoに渡ることを確認する
	invalidFlavorID := 999
	repo := &updatePostRepo{updateResult: &models.Post{ID: 10, UserID: 1}}
	postSvc := NewPostService(repo, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})

	input := &models.UpdatePostInput{
		Slides: []models.UpdateSlideInput{
			{ID: 1, Text: "テスト", FlavorID: &invalidFlavorID},
		},
	}
	post, err := postSvc.UpdatePost(1, 10, input)
	if err != nil {
		t.Fatalf("expected no error for invalid flavor_id, got %v", err)
	}
	if post.ID != 10 {
		t.Fatalf("expected post ID=10, got %d", post.ID)
	}
	// 無効なFlavorIDはnilに落とされてrepoへ渡ることを確認
	if len(repo.capturedSlides) != 1 {
		t.Fatalf("expected 1 captured slide, got %d", len(repo.capturedSlides))
	}
	if repo.capturedSlides[0].FlavorID != nil {
		t.Fatalf("expected FlavorID to be nil after invalid flavor_id, got %v", repo.capturedSlides[0].FlavorID)
	}
}

func TestUpdatePost_FlavorRepoDBError(t *testing.T) {
	// flavorRepoがDB障害等の予期しないエラーを返した場合、UpdatePost自体も失敗することを確認する
	flavorID := 1
	repo := &updatePostRepo{updateResult: &models.Post{ID: 10}}
	postSvc := NewPostService(repo, &mockUserRepoForPost{}, &mockFlavorRepoDBError{}, &mockUploadRepo{})

	input := &models.UpdatePostInput{
		Slides: []models.UpdateSlideInput{
			{ID: 1, Text: "テスト", FlavorID: &flavorID},
		},
	}
	_, err := postSvc.UpdatePost(1, 10, input)
	if err == nil {
		t.Fatal("expected error for flavor repo DB error, got nil")
	}
}

func TestUpdatePost_TextOmittedBecomesEmpty(t *testing.T) {
	// 全上書き仕様の確認: text を省略（ゼロ値 ""）した場合、"" のまま repo に渡ることを確認する
	repo := &updatePostRepo{updateResult: &models.Post{ID: 10, UserID: 1}}
	postSvc := NewPostService(repo, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})

	input := &models.UpdatePostInput{
		Slides: []models.UpdateSlideInput{
			{ID: 1}, // Text・FlavorID はゼロ値
		},
	}
	_, err := postSvc.UpdatePost(1, 10, input)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(repo.capturedSlides) != 1 {
		t.Fatalf("expected 1 captured slide, got %d", len(repo.capturedSlides))
	}
	if repo.capturedSlides[0].Text != "" {
		t.Fatalf("expected empty text, got %q", repo.capturedSlides[0].Text)
	}
	if repo.capturedSlides[0].FlavorID != nil {
		t.Fatalf("expected nil FlavorID, got %v", repo.capturedSlides[0].FlavorID)
	}
}

func TestUpdatePost_FlavorIDNilPassThrough(t *testing.T) {
	// 全上書き仕様の確認: flavor_id を明示的に nil で渡すと nil のまま repo に渡ること（フレーバー解除）を確認する
	repo := &updatePostRepo{updateResult: &models.Post{ID: 10, UserID: 1}}
	postSvc := NewPostService(repo, &mockUserRepoForPost{}, &mockFlavorRepo{}, &mockUploadRepo{})

	input := &models.UpdatePostInput{
		Slides: []models.UpdateSlideInput{
			{ID: 1, Text: "テスト", FlavorID: nil},
		},
	}
	_, err := postSvc.UpdatePost(1, 10, input)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(repo.capturedSlides) != 1 {
		t.Fatalf("expected 1 captured slide, got %d", len(repo.capturedSlides))
	}
	if repo.capturedSlides[0].FlavorID != nil {
		t.Fatalf("expected nil FlavorID (flavor removal), got %v", repo.capturedSlides[0].FlavorID)
	}
}
