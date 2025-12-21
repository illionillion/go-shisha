package repositories

import "go-shisha-backend/internal/models"

/**
 * PostRepository defines the interface for post data access
 */
type PostRepository interface {
	// GetAll returns all posts
	GetAll() ([]models.Post, error)
	
	// GetByID returns a post by ID
	GetByID(id int) (*models.Post, error)
	
	// GetByUserID returns all posts by a specific user
	GetByUserID(userID int) ([]models.Post, error)
	
	// Create creates a new post
	Create(post *models.Post) error
	
	// IncrementLikes increments the like count for a post
	IncrementLikes(id int) (*models.Post, error)

	// DecrementLikes decrements the like count for a post
	DecrementLikes(id int) (*models.Post, error)
}
