package repositories

import "go-shisha-backend/internal/models"

/**
 * FlavorRepository defines the interface for flavor data access
 */
type FlavorRepository interface {
	// GetByID returns a flavor by ID
	GetByID(id int) (*models.Flavor, error)

	// GetAll returns all flavors
	GetAll() ([]models.Flavor, error)
}
