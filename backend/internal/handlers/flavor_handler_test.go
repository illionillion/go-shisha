package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/services"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

// Mock FlavorRepository for testing
type mockFlavorRepoForHandler struct{}

func (m *mockFlavorRepoForHandler) GetByID(id int) (*models.Flavor, error) {
	if id == 1 {
		f := models.Flavor{ID: 1, Name: "ミント", Color: "bg-green-500"}
		return &f, nil
	}
	return nil, errors.New("flavor not found")
}

func (m *mockFlavorRepoForHandler) GetAll() ([]models.Flavor, error) {
	return []models.Flavor{
		{ID: 1, Name: "ミント", Color: "bg-green-500"},
		{ID: 2, Name: "アップル", Color: "bg-red-500"},
		{ID: 3, Name: "ベリー", Color: "bg-purple-500"},
	}, nil
}

type mockFlavorRepoErrorForHandler struct{}

func (m *mockFlavorRepoErrorForHandler) GetByID(id int) (*models.Flavor, error) {
	return nil, errors.New("db error")
}

func (m *mockFlavorRepoErrorForHandler) GetAll() ([]models.Flavor, error) {
	return nil, errors.New("db error")
}

func TestFlavorHandler_GetAllFlavors_Success(t *testing.T) {
	// Setup
	flavorService := services.NewFlavorService(&mockFlavorRepoForHandler{})
	flavorHandler := NewFlavorHandler(flavorService)

	router := gin.Default()
	router.GET("/flavors", flavorHandler.GetAllFlavors)

	// Request
	req, _ := http.NewRequest("GET", "/flavors", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assert
	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}

	var flavors []models.Flavor
	if err := json.Unmarshal(w.Body.Bytes(), &flavors); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	if len(flavors) != 3 {
		t.Fatalf("expected 3 flavors, got %d", len(flavors))
	}

	if flavors[0].Name != "ミント" {
		t.Fatalf("expected first flavor to be 'ミント', got %s", flavors[0].Name)
	}
}

func TestFlavorHandler_GetAllFlavors_DBError(t *testing.T) {
	// Setup
	flavorService := services.NewFlavorService(&mockFlavorRepoErrorForHandler{})
	flavorHandler := NewFlavorHandler(flavorService)

	router := gin.Default()
	router.GET("/flavors", flavorHandler.GetAllFlavors)

	// Request
	req, _ := http.NewRequest("GET", "/flavors", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Assert
	if w.Code != http.StatusInternalServerError {
		t.Fatalf("expected status 500, got %d", w.Code)
	}

	var response map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	if response["error"] != "Failed to fetch flavors" {
		t.Fatalf("expected error message 'Failed to fetch flavors', got %v", response["error"])
	}
}
