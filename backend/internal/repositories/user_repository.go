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
	// ErrFlavorNotFound はフレーバーが見つからない場合のエラー
	ErrFlavorNotFound = errors.New("flavor not found")
)

// UserRepository はユーザーデータアクセスのインターフェース
type UserRepository interface {
	// GetAll は全ユーザーを返す
	GetAll() ([]models.User, error)

	// GetByID は指定IDのユーザーを返す
	GetByID(id int) (*models.User, error)

	// Update は指定ユーザーのプロフィール情報を更新して最新のユーザーを返す
	Update(id int, input models.UpdateUserInput) (*models.User, error)
}
