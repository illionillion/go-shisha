package models

import (
	"golang.org/x/crypto/bcrypt"
)

// User represents a user in the system
type User struct {
	ID           int    `json:"id"`
	Email        string `json:"email"`
	PasswordHash string `json:"-" gorm:"column:password_hash"` // JSON出力しない
	DisplayName  string `json:"display_name"`
	Description  string `json:"description"`
	IconURL      string `json:"icon_url"`
	ExternalURL  string `json:"external_url"`
}

// HashPassword はパスワードをbcryptでハッシュ化する
func (u *User) HashPassword(password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.PasswordHash = string(hash)
	return nil
}

// CheckPassword はパスワードの検証を行う
func (u *User) CheckPassword(password string) error {
	return bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
}

// UsersResponse represents the response for user list
type UsersResponse struct {
	Users []User `json:"users"`
	Total int    `json:"total"`
}

// CreateUserInput represents the input for user registration
// パスワードは現行のセキュリティポリシーとして12文字以上を必須とする
type CreateUserInput struct {
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=12"`
	DisplayName string `json:"display_name"`
}

// LoginInput represents the input for user login
type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse represents the response for authentication
type AuthResponse struct {
	User User `json:"user"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}
