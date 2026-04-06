package postgres

import (
	"errors"
	"fmt"

	"gorm.io/gorm"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"
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
			return nil, repositories.ErrUserNotFound
		}
		logging.L.Error("failed to query user", "repository", "UserRepository", "method", "GetByID", "user_id", id, "error", err)
		return nil, fmt.Errorf("failed to query user by id=%d: %w", id, err)
	}
	user := r.toDomain(&um)
	logging.L.Debug("user found", "repository", "UserRepository", "method", "GetByID", "user_id", id)
	return &user, nil
}

// GetByEmail はメールアドレスでユーザーを検索
func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	logging.L.Debug("querying user by email", "repository", "UserRepository", "method", "GetByEmail", "email", email)
	var um userModel
	if err := r.db.First(&um, "email = ?", email).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logging.L.Debug("user not found", "repository", "UserRepository", "method", "GetByEmail", "email", email)
			return nil, repositories.ErrUserNotFound
		}
		logging.L.Error("failed to query user", "repository", "UserRepository", "method", "GetByEmail", "email", email, "error", err)
		return nil, fmt.Errorf("failed to query user by email=%s: %w", email, err)
	}

	// パスワードハッシュも含めて返す（認証用）
	user := models.User{
		ID:           int(um.ID),
		Email:        um.Email,
		PasswordHash: um.PasswordHash,
		DisplayName:  um.DisplayName,
		Description:  um.Description,
		IconURL:      um.IconURL,
		ExternalURL:  um.ExternalURL,
	}
	logging.L.Debug("user found", "repository", "UserRepository", "method", "GetByEmail", "user_id", um.ID)
	return &user, nil
}

// Create は新しいユーザーを作成
func (r *UserRepository) Create(user *models.User) error {
	um := &userModel{
		Email:        user.Email,
		PasswordHash: user.PasswordHash,
		DisplayName:  user.DisplayName,
		Description:  user.Description,
		IconURL:      user.IconURL,
		ExternalURL:  user.ExternalURL,
	}

	if err := r.db.Create(um).Error; err != nil {
		// GORM の UNIQUE 制約違反エラーを検出
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			logging.L.Warn("duplicate email detected",
				"repository", "UserRepository",
				"method", "Create",
				"email", user.Email)
			return repositories.ErrEmailAlreadyExists
		}
		logging.L.Error("failed to create user",
			"repository", "UserRepository",
			"method", "Create",
			"email", user.Email,
			"error", err)
		return fmt.Errorf("failed to create user: %w", err)
	}

	user.ID = int(um.ID)
	logging.L.Info("user created",
		"repository", "UserRepository",
		"method", "Create",
		"user_id", um.ID,
		"email", user.Email)
	return nil
}

// Update は指定ユーザーのプロフィール情報を更新して最新のユーザーを返す
func (r *UserRepository) Update(id int, input models.UpdateUserInput) (*models.User, error) {
	logging.L.Debug("updating user profile", "repository", "UserRepository", "method", "Update", "user_id", id)

	updates := map[string]interface{}{}
	if input.DisplayName != nil {
		updates["display_name"] = *input.DisplayName
	}
	if input.Description != nil {
		updates["description"] = *input.Description
	}
	if input.ExternalURL != nil {
		updates["external_url"] = *input.ExternalURL
	}
	if input.IconURL != nil {
		updates["icon_url"] = *input.IconURL
	}

	if len(updates) > 0 {
		result := r.db.Model(&userModel{}).Where("id = ?", id).Updates(updates)
		if result.Error != nil {
			logging.L.Error("failed to update user", "repository", "UserRepository", "method", "Update", "user_id", id, "error", result.Error)
			return nil, fmt.Errorf("failed to update user id=%d: %w", id, result.Error)
		}
		if result.RowsAffected == 0 {
			logging.L.Debug("user not found for update", "repository", "UserRepository", "method", "Update", "user_id", id)
			return nil, repositories.ErrUserNotFound
		}
		logging.L.Info("user profile updated", "repository", "UserRepository", "method", "Update", "user_id", id)
	}

	user, err := r.GetByID(id)
	if err != nil {
		logging.L.Error("failed to fetch user after update", "repository", "UserRepository", "method", "Update", "user_id", id, "error", err)
		return nil, fmt.Errorf("failed to fetch user after update id=%d: %w", id, err)
	}
	return user, nil
}
