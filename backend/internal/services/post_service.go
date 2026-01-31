package services

import (
	"errors"

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
}

/**
 * NewPostService creates a new post service
 */
func NewPostService(postRepo repositories.PostRepository, userRepo repositories.UserRepository, flavorRepo repositories.FlavorRepository) *PostService {
	return &PostService{
		postRepo:   postRepo,
		userRepo:   userRepo,
		flavorRepo: flavorRepo,
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
		slide := models.Slide{
			ImageURL: slideInput.ImageURL,
			Text:     slideInput.Text,
		}
		// flavor_idが指定されている場合はフレーバー情報を取得
		if slideInput.FlavorID != nil {
			flavor, err := s.flavorRepo.GetByID(*slideInput.FlavorID)
			if err != nil {
				// フレーバーが見つからない場合でも投稿作成全体は失敗させない
				// エラーをログに記録し、フレーバーなしで続行する
				// 注意: 無効なflavor_idは静かに無視され、該当スライドのFlavorはnilになります
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

	return post, nil
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
