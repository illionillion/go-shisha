package postgres

import (
	"errors"
	"fmt"

	"gorm.io/gorm"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/pkg/logging"
)

type FlavorRepository struct {
	db *gorm.DB
}

func NewFlavorRepository(db *gorm.DB) *FlavorRepository {
	return &FlavorRepository{db: db}
}

func (r *FlavorRepository) toDomain(fm *flavorModel) models.Flavor {
	if fm == nil {
		return models.Flavor{}
	}
	return models.Flavor{
		ID:    int(fm.ID),
		Name:  fm.Name,
		Color: fm.Color,
	}
}

func (r *FlavorRepository) GetByID(id int) (*models.Flavor, error) {
	logging.L.Debug("querying flavor by ID", "repository", "FlavorRepository", "method", "GetByID", "flavor_id", id)
	var fm flavorModel
	if err := r.db.First(&fm, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logging.L.Debug("flavor not found", "repository", "FlavorRepository", "method", "GetByID", "flavor_id", id)
			return nil, fmt.Errorf("flavor not found: id=%d", id)
		}
		logging.L.Error("failed to query flavor", "repository", "FlavorRepository", "method", "GetByID", "flavor_id", id, "error", err)
		return nil, fmt.Errorf("failed to query flavor by id=%d: %w", id, err)
	}
	flavor := r.toDomain(&fm)
	logging.L.Debug("flavor found", "repository", "FlavorRepository", "method", "GetByID", "flavor_id", id, "name", flavor.Name)
	return &flavor, nil
}

func (r *FlavorRepository) GetAll() ([]models.Flavor, error) {
	logging.L.Debug("querying flavors from DB", "repository", "FlavorRepository", "method", "GetAll")
	var fms []flavorModel
	if err := r.db.Order("id").Find(&fms).Error; err != nil {
		logging.L.Error("failed to query flavors", "repository", "FlavorRepository", "method", "GetAll", "error", err)
		return nil, fmt.Errorf("failed to query all flavors: %w", err)
	}
	logging.L.Debug("fetched flavors", "repository", "FlavorRepository", "method", "GetAll", "count", len(fms))
	var flavors []models.Flavor
	for i := range fms {
		flavors = append(flavors, r.toDomain(&fms[i]))
	}
	return flavors, nil
}
