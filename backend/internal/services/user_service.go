package services

import (
	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"
)

/**
 * UserService handles user-related business logic
 */
type UserService struct {
	userRepo repositories.UserRepository
	postRepo repositories.PostRepository
}

/**
 * NewUserService creates a new user service
 */
func NewUserService(userRepo repositories.UserRepository, postRepo repositories.PostRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
		postRepo: postRepo,
	}
}

/**
 * GetAllUsers returns all users
 */
func (s *UserService) GetAllUsers() ([]models.User, error) {
	return s.userRepo.GetAll()
}

/**
 * GetUserByID returns a user by ID
 */
func (s *UserService) GetUserByID(id int) (*models.User, error) {
	return s.userRepo.GetByID(id)
}

/**
 * GetUserPosts returns all posts by a specific user
 */
func (s *UserService) GetUserPosts(userID int) ([]models.Post, error) {
	// Verify user exists
	_, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}

	// Get posts by user ID
	return s.postRepo.GetByUserID(userID)
}
