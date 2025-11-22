package mock

import (
	"errors"
	"go-shisha-backend/internal/models"
)

/**
 * UserRepositoryMock is an in-memory mock implementation of UserRepository
 */
type UserRepositoryMock struct {
	users []models.User
}

/**
 * NewUserRepositoryMock creates a new mock user repository with sample data
 */
func NewUserRepositoryMock() *UserRepositoryMock {
	return &UserRepositoryMock{
		users: []models.User{
			{ID: 1, Email: "test@example.com", DisplayName: "テストユーザー", Description: "シーシャ大好き！", IconURL: "", ExternalURL: ""},
			{ID: 2, Email: "shisha@example.com", DisplayName: "シーシャマスター", Description: "毎日シーシャ吸ってます", IconURL: "", ExternalURL: "https://twitter.com/shishamaster"},
		},
	}
}

/**
 * GetAll returns all users
 */
func (r *UserRepositoryMock) GetAll() ([]models.User, error) {
	return r.users, nil
}

/**
 * GetByID returns a user by ID
 */
func (r *UserRepositoryMock) GetByID(id int) (*models.User, error) {
	for _, user := range r.users {
		if user.ID == id {
			return &user, nil
		}
	}
	return nil, errors.New("user not found")
}

/**
 * GetPostsByUserID returns all posts by a specific user
 */
func (r *UserRepositoryMock) GetPostsByUserID(userID int) ([]models.Post, error) {
	// This will be handled by PostRepository in the service layer
	return nil, errors.New("not implemented in user repository")
}
