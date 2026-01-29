package repositories

import (
	"errors"

	"go-shisha-backend/internal/models"
)

var (
	// ErrEmailAlreadyExists はメールアドレスが既に存在する場合のエラー
	ErrEmailAlreadyExists = errors.New("email already exists")
	// ErrUserNotFound はユーザーが見つからない場合のエラー
	ErrUserNotFound = errors.New("user not found")
)

/**
 * UserRepository defines the interface for user data access
 */
type UserRepository interface {
	// GetAll returns all users
	GetAll() ([]models.User, error)

	// GetByID returns a user by ID
	GetByID(id int) (*models.User, error)
}
