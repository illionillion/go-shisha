package services

import (
	"testing"

	"go-shisha-backend/internal/models"
)

type mockUserRepo struct{}

func (m *mockUserRepo) GetAll() ([]models.User, error) {
	return []models.User{
		{ID: 1, Email: "a@example.com", DisplayName: "A"},
		{ID: 2, Email: "b@example.com", DisplayName: "B"},
	}, nil
}

func (m *mockUserRepo) GetByID(id int) (*models.User, error) {
	if id == 1 {
		u := models.User{ID: 1, Email: "a@example.com", DisplayName: "A"}
		return &u, nil
	}
	return nil, nil
}

type noopPostRepo struct{}

func (n *noopPostRepo) GetAll() ([]models.Post, error)                { return nil, nil }
func (n *noopPostRepo) GetByID(id int) (*models.Post, error)          { return nil, nil }
func (n *noopPostRepo) GetByUserID(userID int) ([]models.Post, error) { return nil, nil }
func (n *noopPostRepo) Create(post *models.Post) error                { return nil }
func (n *noopPostRepo) IncrementLikes(id int) (*models.Post, error)   { return nil, nil }
func (n *noopPostRepo) DecrementLikes(id int) (*models.Post, error)   { return nil, nil }

func TestGetAllUsers(t *testing.T) {
	svc := NewUserService(&mockUserRepo{}, &noopPostRepo{})
	users, err := svc.GetAllUsers()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(users) != 2 {
		t.Fatalf("expected 2 users, got %d", len(users))
	}
}

func TestGetUserByID(t *testing.T) {
	svc := NewUserService(&mockUserRepo{}, &noopPostRepo{})
	u, err := svc.GetUserByID(1)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if u == nil || u.ID != 1 {
		t.Fatalf("expected user ID 1, got %+v", u)
	}
	// non-existent ID should return nil (service passes through repo error/nil)
	u2, _ := svc.GetUserByID(99)
	if u2 != nil {
		t.Fatalf("expected nil for missing user, got %+v", u2)
	}
}
