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
func (s *PostService) CreatePost(input *models.CreatePostInput) (*models.Post, error) {
       // Verify user exists and get user information
       user, err := s.userRepo.GetByID(input.UserID)
       if err != nil {
	       return nil, err
       }

       post := &models.Post{
	       UserID:  input.UserID,
	       Message: input.Message,
	       Slides:  input.Slides,
	       User:    *user,
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
	return s.postRepo.IncrementLikes(id)
}
