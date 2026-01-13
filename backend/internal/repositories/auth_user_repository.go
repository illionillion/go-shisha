package repositories

import "go-shisha-backend/internal/models"

// AuthUserRepository はユーザー認証に必要なリポジトリインターフェース
type AuthUserRepository interface {
	GetByEmail(email string) (*models.User, error)
	Create(user *models.User) error
	GetByID(id int) (*models.User, error)
}
