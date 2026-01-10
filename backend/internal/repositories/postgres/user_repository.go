package postgres

import (
	"errors"
	"fmt"

	"gorm.io/gorm"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/pkg/logging"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) toDomain(um *userModel) models.User {
	if um == nil {
		return models.User{}
	}
	return models.User{
		ID:          int(um.ID),
		Email:       um.Email,
		DisplayName: um.DisplayName,
		Description: um.Description,
		IconURL:     um.IconURL,
		ExternalURL: um.ExternalURL,
	}
}

func (r *UserRepository) GetAll() ([]models.User, error) {
	logging.L.Debug("querying users from DB", "repository", "UserRepository", "method", "GetAll")
	var ums []userModel
	if err := r.db.Order("id").Find(&ums).Error; err != nil {
		logging.L.Error("failed to query users", "repository", "UserRepository", "method", "GetAll", "error", err)
		return nil, fmt.Errorf("failed to query all users: %w", err)
	}
	logging.L.Debug("fetched users", "repository", "UserRepository", "method", "GetAll", "count", len(ums))
	var users []models.User
	for i := range ums {
		users = append(users, r.toDomain(&ums[i]))
	}
	return users, nil
}

func (r *UserRepository) GetByID(id int) (*models.User, error) {
	logging.L.Debug("querying user by ID", "repository", "UserRepository", "method", "GetByID", "user_id", id)
	var um userModel
	if err := r.db.First(&um, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logging.L.Debug("user not found", "repository", "UserRepository", "method", "GetByID", "user_id", id)
			return nil, fmt.Errorf("user not found: id=%d", id)
		}
		logging.L.Error("failed to query user", "repository", "UserRepository", "method", "GetByID", "user_id", id, "error", err)
		return nil, fmt.Errorf("failed to query user by id=%d: %w", id, err)
	}
	user := r.toDomain(&um)
	logging.L.Debug("user found", "repository", "UserRepository", "method", "GetByID", "user_id", id)
	return &user, nil
}
