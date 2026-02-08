package services

import (
	"errors"
	"testing"

	"go-shisha-backend/internal/models"

	"github.com/stretchr/testify/assert"
)

type mockFlavorRepoForService struct{}

func (m *mockFlavorRepoForService) GetByID(id int) (*models.Flavor, error) {
	if id == 1 {
		f := models.Flavor{ID: 1, Name: "ミント", Color: "bg-green-500"}
		return &f, nil
	}
	return nil, nil
}

func (m *mockFlavorRepoForService) GetAll() ([]models.Flavor, error) {
	return []models.Flavor{
		{ID: 1, Name: "ミント", Color: "bg-green-500"},
		{ID: 2, Name: "アップル", Color: "bg-red-500"},
		{ID: 3, Name: "ベリー", Color: "bg-purple-500"},
	}, nil
}

type mockFlavorRepoErrorForService struct{}

func (m *mockFlavorRepoErrorForService) GetByID(id int) (*models.Flavor, error) {
	return nil, errors.New("db error")
}

func (m *mockFlavorRepoErrorForService) GetAll() ([]models.Flavor, error) {
	return nil, errors.New("db error")
}

func TestGetAllFlavors(t *testing.T) {
	svc := NewFlavorService(&mockFlavorRepoForService{})
	flavors, err := svc.GetAllFlavors()

	assert.NoError(t, err)
	assert.Len(t, flavors, 3)
	assert.Equal(t, "ミント", flavors[0].Name)
}

func TestGetAllFlavors_Error(t *testing.T) {
	svc := NewFlavorService(&mockFlavorRepoErrorForService{})
	_, err := svc.GetAllFlavors()

	assert.Error(t, err)
}
