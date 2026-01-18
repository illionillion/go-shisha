package repositories

import (
	"errors"

	"go-shisha-backend/internal/models"
)

var (
	// ErrEmailAlreadyExists はメールアドレスが既に登録されている場合のエラー
	ErrEmailAlreadyExists = errors.New("email already exists")
)

// AuthUserRepository はユーザー認証に必要なリポジトリインターフェース
type AuthUserRepository interface {
	GetByEmail(email string) (*models.User, error)
	Create(user *models.User) error
	GetByID(id int) (*models.User, error)
}
