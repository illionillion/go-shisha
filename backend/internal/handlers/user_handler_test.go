package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"
	"go-shisha-backend/pkg/validation"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	"github.com/stretchr/testify/assert"
)

func init() {
	// このファイルのテストで使用するカスタムバリデータを登録
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		_ = v.RegisterValidation("imageurl", validation.ValidateImageURL)
		_ = v.RegisterValidation("externalurl", validation.ValidateExternalURL)
	}
}

// mockUserService はテスト用の UserService モック
type mockUserService struct {
	getAllUsersFunc     func() ([]models.User, error)
	getUserByIDFunc     func(id int) (*models.User, error)
	getUserPostsFunc    func(userID int, currentUserID *int) ([]models.Post, error)
	updateMyProfileFunc func(userID int, input models.UpdateUserInput) (*models.User, error)
}

func (m *mockUserService) GetAllUsers() ([]models.User, error) {
	if m.getAllUsersFunc != nil {
		return m.getAllUsersFunc()
	}
	return nil, nil
}

func (m *mockUserService) GetUserByID(id int) (*models.User, error) {
	if m.getUserByIDFunc != nil {
		return m.getUserByIDFunc(id)
	}
	return nil, nil
}

func (m *mockUserService) GetUserPosts(userID int, currentUserID *int) ([]models.Post, error) {
	if m.getUserPostsFunc != nil {
		return m.getUserPostsFunc(userID, currentUserID)
	}
	return nil, nil
}

func (m *mockUserService) UpdateMyProfile(userID int, input models.UpdateUserInput) (*models.User, error) {
	if m.updateMyProfileFunc != nil {
		return m.updateMyProfileFunc(userID, input)
	}
	return nil, nil
}

// --- GetAllUsers ---

func TestGetAllUsers_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{
		getAllUsersFunc: func() ([]models.User, error) {
			return []models.User{
				{ID: 1, DisplayName: "Alice", Email: "alice@example.com"},
				{ID: 2, DisplayName: "Bob", Email: "bob@example.com"},
			}, nil
		},
	}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.GET("/users", handler.GetAllUsers)

	req := httptest.NewRequest(http.MethodGet, "/users", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	var response models.UsersResponse
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, 2, response.Total)
	assert.Len(t, response.Users, 2)
}

func TestGetAllUsers_ServerError(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{
		getAllUsersFunc: func() ([]models.User, error) {
			return nil, assert.AnError
		},
	}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.GET("/users", handler.GetAllUsers)

	req := httptest.NewRequest(http.MethodGet, "/users", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	var response models.ServerError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeInternalServer, response.Error)
}

// --- GetUser ---

func TestGetUser_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{
		getUserByIDFunc: func(id int) (*models.User, error) {
			return &models.User{ID: id, DisplayName: "Alice", Email: "alice@example.com"}, nil
		},
	}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.GET("/users/:id", handler.GetUser)

	req := httptest.NewRequest(http.MethodGet, "/users/1", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	var response models.User
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, 1, response.ID)
}

func TestGetUser_InvalidID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.GET("/users/:id", handler.GetUser)

	req := httptest.NewRequest(http.MethodGet, "/users/abc", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	var response models.ValidationError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeValidationFailed, response.Error)
}

func TestGetUser_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{
		getUserByIDFunc: func(id int) (*models.User, error) {
			return nil, repositories.ErrUserNotFound
		},
	}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.GET("/users/:id", handler.GetUser)

	req := httptest.NewRequest(http.MethodGet, "/users/999", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusNotFound, rec.Code)
	var response models.NotFoundError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeNotFound, response.Error)
}

func TestGetUser_ServerError(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{
		getUserByIDFunc: func(id int) (*models.User, error) {
			return nil, assert.AnError
		},
	}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.GET("/users/:id", handler.GetUser)

	req := httptest.NewRequest(http.MethodGet, "/users/1", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	var response models.ServerError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeInternalServer, response.Error)
}

// --- GetUserPosts ---

func TestGetUserPosts_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{
		getUserPostsFunc: func(userID int, currentUserID *int) ([]models.Post, error) {
			return []models.Post{
				{ID: 1, UserID: userID},
				{ID: 2, UserID: userID},
			}, nil
		},
	}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.GET("/users/:id/posts", handler.GetUserPosts)

	req := httptest.NewRequest(http.MethodGet, "/users/1/posts", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	var response models.PostsResponse
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, 2, response.Total)
	assert.Len(t, response.Posts, 2)
}

func TestGetUserPosts_InvalidID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.GET("/users/:id/posts", handler.GetUserPosts)

	req := httptest.NewRequest(http.MethodGet, "/users/abc/posts", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	var response models.ValidationError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeValidationFailed, response.Error)
}

func TestGetUserPosts_UserNotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{
		getUserPostsFunc: func(userID int, currentUserID *int) ([]models.Post, error) {
			return nil, repositories.ErrUserNotFound
		},
	}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.GET("/users/:id/posts", handler.GetUserPosts)

	req := httptest.NewRequest(http.MethodGet, "/users/999/posts", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusNotFound, rec.Code)
	var response models.NotFoundError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeNotFound, response.Error)
}

func TestGetUserPosts_ServerError(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{
		getUserPostsFunc: func(userID int, currentUserID *int) ([]models.Post, error) {
			return nil, assert.AnError
		},
	}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.GET("/users/:id/posts", handler.GetUserPosts)

	req := httptest.NewRequest(http.MethodGet, "/users/1/posts", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	var response models.ServerError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeInternalServer, response.Error)
}

func TestGetUserPosts_WithAuthContext(t *testing.T) {
	gin.SetMode(gin.TestMode)

	var capturedCurrentUserID *int
	mockService := &mockUserService{
		getUserPostsFunc: func(userID int, currentUserID *int) ([]models.Post, error) {
			capturedCurrentUserID = currentUserID
			return []models.Post{{ID: 1, UserID: userID}}, nil
		},
	}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.GET("/users/:id/posts", func(c *gin.Context) {
		c.Set("user_id", 42)
		handler.GetUserPosts(c)
	})

	req := httptest.NewRequest(http.MethodGet, "/users/1/posts", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.NotNil(t, capturedCurrentUserID)
	assert.Equal(t, 42, *capturedCurrentUserID)
}

// --- UpdateMe ---

func TestUpdateMe_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	name := "New Name"
	desc := "New description"
	mockService := &mockUserService{
		updateMyProfileFunc: func(userID int, input models.UpdateUserInput) (*models.User, error) {
			return &models.User{
				ID:          userID,
				DisplayName: *input.DisplayName,
				Description: *input.Description,
				Email:       "test@example.com",
			}, nil
		},
	}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.PATCH("/users/me", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UpdateMe(c)
	})

	body, _ := json.Marshal(map[string]string{
		"display_name": name,
		"description":  desc,
	})
	req := httptest.NewRequest(http.MethodPatch, "/users/me", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	var response models.User
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, 1, response.ID)
	assert.Equal(t, name, response.DisplayName)
	assert.Equal(t, desc, response.Description)
}

func TestUpdateMe_Unauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.PATCH("/users/me", handler.UpdateMe)

	body, _ := json.Marshal(map[string]string{"display_name": "Name"})
	req := httptest.NewRequest(http.MethodPatch, "/users/me", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)
	var response models.UnauthorizedError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeUnauthorized, response.Error)
}

func TestUpdateMe_InvalidBody(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.PATCH("/users/me", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UpdateMe(c)
	})

	req := httptest.NewRequest(http.MethodPatch, "/users/me", bytes.NewReader([]byte(`invalid json`)))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	var response models.ValidationError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeValidationFailed, response.Error)
}

func TestUpdateMe_ServerError(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{
		updateMyProfileFunc: func(userID int, input models.UpdateUserInput) (*models.User, error) {
			return nil, assert.AnError
		},
	}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.PATCH("/users/me", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UpdateMe(c)
	})

	body, _ := json.Marshal(map[string]string{"display_name": "Name"})
	req := httptest.NewRequest(http.MethodPatch, "/users/me", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	var response models.ServerError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeInternalServer, response.Error)
}

func TestUpdateMe_EmptyBody(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{
		updateMyProfileFunc: func(userID int, input models.UpdateUserInput) (*models.User, error) {
			return &models.User{
				ID:    userID,
				Email: "test@example.com",
			}, nil
		},
	}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.PATCH("/users/me", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UpdateMe(c)
	})

	req := httptest.NewRequest(http.MethodPatch, "/users/me", bytes.NewReader([]byte(`{}`)))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	var response models.User
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, 1, response.ID)
}

func TestUpdateMe_InvalidExternalURL(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.PATCH("/users/me", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UpdateMe(c)
	})

	body, _ := json.Marshal(map[string]string{"external_url": "javascript:alert(1)"})
	req := httptest.NewRequest(http.MethodPatch, "/users/me", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	var response models.ValidationError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeValidationFailed, response.Error)
}

func TestUpdateMe_InvalidIconURL(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockUserService{}
	handler := NewUserHandler(mockService)

	router := gin.New()
	router.PATCH("/users/me", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UpdateMe(c)
	})

	body, _ := json.Marshal(map[string]string{"icon_url": "javascript:evil()"})
	req := httptest.NewRequest(http.MethodPatch, "/users/me", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	var response models.ValidationError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeValidationFailed, response.Error)
}
