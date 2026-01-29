package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/pkg/validation"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	"github.com/stretchr/testify/assert"
)

func init() {
	// テスト用にカスタムバリデータを登録
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		_ = v.RegisterValidation("imageurl", validation.ValidateImageURL)
	}
}

// mockPostService はテスト用のPostServiceモック
type mockPostService struct {
	createPostFunc func(userID int, input *models.CreatePostInput) (*models.Post, error)
	likePostFunc   func(id int) (*models.Post, error)
	unlikePostFunc func(id int) (*models.Post, error)
}

func (m *mockPostService) GetAllPosts() ([]models.Post, error) {
	return nil, nil
}

func (m *mockPostService) GetPostByID(id int) (*models.Post, error) {
	return nil, nil
}

func (m *mockPostService) CreatePost(userID int, input *models.CreatePostInput) (*models.Post, error) {
	if m.createPostFunc != nil {
		return m.createPostFunc(userID, input)
	}
	return nil, nil
}

func (m *mockPostService) LikePost(id int) (*models.Post, error) {
	if m.likePostFunc != nil {
		return m.likePostFunc(id)
	}
	return nil, nil
}

func (m *mockPostService) UnlikePost(id int) (*models.Post, error) {
	if m.unlikePostFunc != nil {
		return m.unlikePostFunc(id)
	}
	return nil, nil
}

func TestCreatePost_NoAuth(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts", handler.CreatePost)

	reqBody := map[string]interface{}{
		"slides": []map[string]interface{}{
			{
				"image_url": "/images/test.jpg",
				"text":      "test",
			},
		},
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/posts", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

func TestCreatePost_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		createPostFunc: func(userID int, input *models.CreatePostInput) (*models.Post, error) {
			return &models.Post{
				ID:     1,
				UserID: userID,
				Slides: []models.Slide{
					{
						ImageURL: input.Slides[0].ImageURL,
						Text:     input.Slides[0].Text,
					},
				},
				Likes:     0,
				CreatedAt: time.Now(),
			}, nil
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts", func(c *gin.Context) {
		// AuthMiddlewareのモック: user_idをセット
		c.Set("user_id", 1)
		handler.CreatePost(c)
	})

	reqBody := map[string]interface{}{
		"slides": []map[string]interface{}{
			{
				"image_url": "/images/test.jpg",
				"text":      "test post",
			},
		},
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/posts", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusCreated, rec.Code)

	var response models.Post
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, 1, response.ID)
	assert.Equal(t, 1, response.UserID)
	assert.Equal(t, 1, len(response.Slides))
}

func TestCreatePost_InvalidBody(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.CreatePost(c)
	})

	// slidesが空のリクエスト
	reqBody := map[string]interface{}{
		"slides": []map[string]interface{}{},
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/posts", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func TestCreatePost_UserNotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		createPostFunc: func(userID int, input *models.CreatePostInput) (*models.Post, error) {
			return nil, errors.New("user not found: id=999")
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts", func(c *gin.Context) {
		c.Set("user_id", 999)
		handler.CreatePost(c)
	})

	reqBody := map[string]interface{}{
		"slides": []map[string]interface{}{
			{
				"image_url": "/images/test.jpg",
				"text":      "test",
			},
		},
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/posts", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	// ユーザーが見つからない場合は401を返す
	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

func TestCreatePost_InvalidUserIDType(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts", func(c *gin.Context) {
		// 意図的に間違った型をセット
		c.Set("user_id", "invalid")
		handler.CreatePost(c)
	})

	reqBody := map[string]interface{}{
		"slides": []map[string]interface{}{
			{
				"image_url": "/images/test.jpg",
				"text":      "test",
			},
		},
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/posts", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusInternalServerError, rec.Code)
}
