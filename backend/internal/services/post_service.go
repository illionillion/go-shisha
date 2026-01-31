package services

import (
	"errors"
	"fmt"
	"strings"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"
	"go-shisha-backend/pkg/logging"
)

/**
 * PostService handles post-related business logic
 */
type PostService struct {
	postRepo   repositories.PostRepository
	userRepo   repositories.UserRepository
	flavorRepo repositories.FlavorRepository
	uploadRepo repositories.UploadRepository
}

/**
 * NewPostService creates a new post service
 */
func NewPostService(postRepo repositories.PostRepository, userRepo repositories.UserRepository, flavorRepo repositories.FlavorRepository, uploadRepo repositories.UploadRepository) *PostService {
	return &PostService{
		postRepo:   postRepo,
		userRepo:   userRepo,
		flavorRepo: flavorRepo,
		uploadRepo: uploadRepo,
	}
}

/**
 * GetAllPosts returns all posts
 */
func (s *PostService) GetAllPosts() ([]models.Post, error) {
	return s.postRepo.GetAll()
}

/**
 * GetPostByID returns a post by ID
 */
func (s *PostService) GetPostByID(id int) (*models.Post, error) {
	return s.postRepo.GetByID(id)
}

/**
 * CreatePost creates a new post
 */
func (s *PostService) CreatePost(userID int, input *models.CreatePostInput) (*models.Post, error) {
	// Verify user exists and get user information
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		// ユーザーが見つからない場合はsentinel errorをそのまま返す
		if errors.Is(err, repositories.ErrUserNotFound) {
			return nil, repositories.ErrUserNotFound
		}
		return nil, err
	}

	// Convert SlideInput to Slide
	slides := make([]models.Slide, len(input.Slides))
	for i, slideInput := range input.Slides {
		// 画像URLの検証
		if err := s.validateImageURL(userID, slideInput.ImageURL); err != nil {
			logging.L.Warn("画像URL検証失敗",
				"user_id", userID,
				"image_url", slideInput.ImageURL,
				"error", err)
			return nil, err
		}

		slide := models.Slide{
			ImageURL: slideInput.ImageURL,
			Text:     slideInput.Text,
		}
		// Get flavor information if flavor_id is provided
		if slideInput.FlavorID != nil {
			flavor, err := s.flavorRepo.GetByID(*slideInput.FlavorID)
			if err != nil {
				// Flavor not found, but we don't want to fail the entire post creation
				// Log the error and continue without flavor data
				logging.L.Warn("flavor not found for slide", "flavor_id", *slideInput.FlavorID, "error", err)
			} else {
				slide.Flavor = flavor
			}
		}
		slides[i] = slide
	}

	post := &models.Post{
		UserID: userID,
		Slides: slides,
		User:   *user,
	}

	err = s.postRepo.Create(post)
	if err != nil {
		return nil, err
	}

	// 使用した画像のステータスを"used"に更新
	for _, slide := range slides {
		if err := s.uploadRepo.MarkAsUsed(slide.ImageURL); err != nil {
			// エラーログを出すが、投稿作成は継続
			logging.L.Warn("画像ステータス更新失敗",
				"image_url", slide.ImageURL,
				"error", err)
		}
	}

	return post, nil
}

// validateImageURL 画像URLの検証（セキュリティ対策）
func (s *PostService) validateImageURL(userID int, imageURL string) error {
	// 1. パストラバーサル対策
	if strings.Contains(imageURL, "..") {
		return fmt.Errorf("不正なパス: %s", imageURL)
	}

	// 2. 許可されたプレフィックスのチェック
	if !strings.HasPrefix(imageURL, "/images/") {
		return fmt.Errorf("許可されていないパス: %s", imageURL)
	}

	// 3. DBでアップロード記録を確認
	upload, err := s.uploadRepo.GetByFilePath(imageURL)
	if err != nil {
		if errors.Is(err, repositories.ErrUploadNotFound) {
			return fmt.Errorf("画像が存在しません: %s", imageURL)
		}
		return fmt.Errorf("画像情報の取得に失敗しました: %w", err)
	}

	// 4. アップロードしたユーザーと投稿者が同じか確認
	if upload.UserID != userID {
		logging.L.Warn("他人の画像を使用しようとした",
			"post_user_id", userID,
			"upload_user_id", upload.UserID,
			"image_url", imageURL)
		return fmt.Errorf("この画像を使用する権限がありません")
	}

	// 5. 既に削除済みでないか確認
	if upload.Status == "deleted" {
		return fmt.Errorf("削除された画像は使用できません: %s", imageURL)
	}

	return nil
}

/**
 * LikePost increments the like count for a post
 */
func (s *PostService) LikePost(id int) (*models.Post, error) {
	post, err := s.postRepo.IncrementLikes(id)
	if err != nil {
		return nil, err
	}
	// mark as liked for the current (mock) user
	post.IsLiked = true
	return post, nil
}

/**
 * UnlikePost decrements the like count for a post and marks it as not liked
 */
func (s *PostService) UnlikePost(id int) (*models.Post, error) {
	post, err := s.postRepo.DecrementLikes(id)
	if err != nil {
		return nil, err
	}
	// mark as not liked for the current (mock) user
	post.IsLiked = false
	return post, nil
}
