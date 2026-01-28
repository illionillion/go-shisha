package services

import (
	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"
)

/**
 * PostService handles post-related business logic
 */
type PostService struct {
	postRepo repositories.PostRepository
	userRepo repositories.UserRepository
}

/**
 * NewPostService creates a new post service
 */
func NewPostService(postRepo repositories.PostRepository, userRepo repositories.UserRepository) *PostService {
	return &PostService{
		postRepo: postRepo,
		userRepo: userRepo,
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
		return nil, err
	}

	// Convert SlideInput to Slide
	slides := make([]models.Slide, len(input.Slides))
	for i, slideInput := range input.Slides {
		slide := models.Slide{
			ImageURL: slideInput.ImageURL,
			Text:     slideInput.Text,
		}
		// Get flavor information if flavor_id is provided
		if slideInput.FlavorID != nil {
			// TODO: Get flavor from repository when flavor service is implemented
			slide.Flavor = &models.Flavor{
				ID:   *slideInput.FlavorID,
				Name: "", // Will be populated from DB
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
