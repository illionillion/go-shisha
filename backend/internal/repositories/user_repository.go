package repositories

import "go-shisha-backend/internal/models"

/**
 * UserRepository defines the interface for user data access
 */
type UserRepository interface {
	// GetAll returns all users
	GetAll() ([]models.User, error)

	// GetByID returns a user by ID
	GetByID(id int) (*models.User, error)
}
