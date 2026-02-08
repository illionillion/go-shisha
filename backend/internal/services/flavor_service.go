package services

import (
	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"
)

/**
 * FlavorService handles flavor-related business logic
 */
type FlavorService struct {
	flavorRepo repositories.FlavorRepository
}

/**
 * NewFlavorService creates a new flavor service
 */
func NewFlavorService(flavorRepo repositories.FlavorRepository) *FlavorService {
	return &FlavorService{
		flavorRepo: flavorRepo,
	}
}

/**
 * GetAllFlavors returns all flavors
 */
func (s *FlavorService) GetAllFlavors() ([]models.Flavor, error) {
	return s.flavorRepo.GetAll()
}
