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
	"go-shisha-backend/internal/repositories"
	"go-shisha-backend/internal/services"
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
	getAllPostsFunc func(userID *int) ([]models.Post, error)
	getPostByIDFunc func(id int, userID *int) (*models.Post, error)
	createPostFunc  func(userID int, input *models.CreatePostInput) (*models.Post, error)
	likePostFunc    func(userID, postID int) (*models.Post, error)
	unlikePostFunc  func(userID, postID int) (*models.Post, error)
	deletePostFunc  func(userID, postID int) error
	updatePostFunc  func(userID, postID int, input *models.UpdatePostInput) (*models.Post, error)
}

func (m *mockPostService) GetAllPosts(userID *int) ([]models.Post, error) {
	if m.getAllPostsFunc != nil {
		return m.getAllPostsFunc(userID)
	}
	return nil, nil
}

func (m *mockPostService) GetPostByID(id int, userID *int) (*models.Post, error) {
	if m.getPostByIDFunc != nil {
		return m.getPostByIDFunc(id, userID)
	}
	return nil, nil
}

func (m *mockPostService) CreatePost(userID int, input *models.CreatePostInput) (*models.Post, error) {
	if m.createPostFunc != nil {
		return m.createPostFunc(userID, input)
	}
	return nil, nil
}

func (m *mockPostService) LikePost(userID, postID int) (*models.Post, error) {
	if m.likePostFunc != nil {
		return m.likePostFunc(userID, postID)
	}
	return nil, nil
}

func (m *mockPostService) UnlikePost(userID, postID int) (*models.Post, error) {
	if m.unlikePostFunc != nil {
		return m.unlikePostFunc(userID, postID)
	}
	return nil, nil
}

func (m *mockPostService) DeletePost(userID, postID int) error {
	if m.deletePostFunc != nil {
		return m.deletePostFunc(userID, postID)
	}
	return nil
}

func (m *mockPostService) UpdatePost(userID, postID int, input *models.UpdatePostInput) (*models.Post, error) {
	if m.updatePostFunc != nil {
		return m.updatePostFunc(userID, postID, input)
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
	var response models.UnauthorizedError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeUnauthorized, response.Error)
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
	var response models.ValidationError
	errUnmarshal := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, errUnmarshal)
	assert.Equal(t, models.ErrCodeValidationFailed, response.Error)
}

func TestCreatePost_ImageURLValidation(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.CreatePost(c)
	})

	tests := []struct {
		name          string
		imageURL      string
		expectedCode  int
		expectSuccess bool
	}{
		{
			name:          "危険なスキーム: javascript:",
			imageURL:      "javascript:alert(1)",
			expectedCode:  http.StatusBadRequest,
			expectSuccess: false,
		},
		{
			name:          "危険なスキーム: data:",
			imageURL:      "data:text/html,<script>alert(1)</script>",
			expectedCode:  http.StatusBadRequest,
			expectSuccess: false,
		},
		{
			name:          "無効な相対パス",
			imageURL:      "/other/test.jpg",
			expectedCode:  http.StatusBadRequest,
			expectSuccess: false,
		},
		{
			name:          "空白を含むURL",
			imageURL:      " /images/test.jpg",
			expectedCode:  http.StatusBadRequest,
			expectSuccess: false,
		},
		{
			name:          "有効な相対パス",
			imageURL:      "/images/test.jpg",
			expectedCode:  http.StatusCreated,
			expectSuccess: true,
		},
		{
			name:          "有効なHTTPS URL",
			imageURL:      "https://example.com/image.jpg",
			expectedCode:  http.StatusCreated,
			expectSuccess: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.expectSuccess {
				mockService.createPostFunc = func(userID int, input *models.CreatePostInput) (*models.Post, error) {
					return &models.Post{
						ID:     1,
						UserID: userID,
						Slides: []models.Slide{
							{ImageURL: input.Slides[0].ImageURL, Text: input.Slides[0].Text},
						},
					}, nil
				}
			}

			reqBody := map[string]interface{}{
				"slides": []map[string]interface{}{
					{
						"image_url": tt.imageURL,
						"text":      "test",
					},
				},
			}
			body, _ := json.Marshal(reqBody)

			req := httptest.NewRequest(http.MethodPost, "/posts", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()

			router.ServeHTTP(rec, req)

			assert.Equal(t, tt.expectedCode, rec.Code)
		})
	}
}

func TestCreatePost_UserNotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		createPostFunc: func(userID int, input *models.CreatePostInput) (*models.Post, error) {
			return nil, repositories.ErrUserNotFound
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
	var response models.UnauthorizedError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeUnauthorized, response.Error)
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
	var serverResponse models.ServerError
	errUnmarshal := json.Unmarshal(rec.Body.Bytes(), &serverResponse)
	assert.NoError(t, errUnmarshal)
	assert.Equal(t, models.ErrCodeInternalServer, serverResponse.Error)
}

func TestCreatePost_ImagePermissionDenied_403(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		createPostFunc: func(userID int, input *models.CreatePostInput) (*models.Post, error) {
			return nil, services.ErrImagePermissionDenied
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts", func(c *gin.Context) {
		c.Set("user_id", 1)
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

	assert.Equal(t, http.StatusForbidden, rec.Code)
	var response models.ForbiddenError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeForbidden, response.Error)
}

func TestLikePost_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		likePostFunc: func(userID, postID int) (*models.Post, error) {
			return &models.Post{ID: postID, Likes: 1, IsLiked: true}, nil
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts/:id/like", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.LikePost(c)
	})

	req := httptest.NewRequest(http.MethodPost, "/posts/1/like", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	var response models.Post
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, 1, response.Likes)
	assert.True(t, response.IsLiked)
}

func TestLikePost_AlreadyLiked_409(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		likePostFunc: func(userID, postID int) (*models.Post, error) {
			return nil, repositories.ErrAlreadyLiked
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts/:id/like", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.LikePost(c)
	})

	req := httptest.NewRequest(http.MethodPost, "/posts/1/like", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusConflict, rec.Code)
	var response models.ConflictError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeAlreadyLiked, response.Error)
}

func TestLikePost_InvalidID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts/:id/like", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.LikePost(c)
	})

	req := httptest.NewRequest(http.MethodPost, "/posts/abc/like", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	var response models.ValidationError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeValidationFailed, response.Error)
}

func TestLikePost_NotFound_404(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		likePostFunc: func(userID, postID int) (*models.Post, error) {
			return nil, repositories.ErrPostNotFound
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts/:id/like", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.LikePost(c)
	})

	req := httptest.NewRequest(http.MethodPost, "/posts/99/like", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusNotFound, rec.Code)
	var response models.NotFoundError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeNotFound, response.Error)
}

func TestLikePost_InternalError_500(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		likePostFunc: func(userID, postID int) (*models.Post, error) {
			return nil, errors.New("db connection failed")
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts/:id/like", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.LikePost(c)
	})

	req := httptest.NewRequest(http.MethodPost, "/posts/1/like", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	var response models.ServerError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeInternalServer, response.Error)
}

func TestLikePost_UserNotFound_401(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		likePostFunc: func(userID, postID int) (*models.Post, error) {
			return nil, repositories.ErrUserNotFound
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts/:id/like", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.LikePost(c)
	})

	req := httptest.NewRequest(http.MethodPost, "/posts/1/like", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)
	var response models.UnauthorizedError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeUnauthorized, response.Error)
}

func TestUnlikePost_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		unlikePostFunc: func(userID, postID int) (*models.Post, error) {
			return &models.Post{ID: postID, Likes: 0, IsLiked: false}, nil
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts/:id/unlike", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UnlikePost(c)
	})

	req := httptest.NewRequest(http.MethodPost, "/posts/1/unlike", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	var response models.Post
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, 0, response.Likes)
}

func TestUnlikePost_NotLiked_409(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		unlikePostFunc: func(userID, postID int) (*models.Post, error) {
			return nil, repositories.ErrNotLiked
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts/:id/unlike", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UnlikePost(c)
	})

	req := httptest.NewRequest(http.MethodPost, "/posts/1/unlike", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusConflict, rec.Code)
	var response models.ConflictError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeNotLiked, response.Error)
}

func TestUnlikePost_InvalidID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts/:id/unlike", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UnlikePost(c)
	})

	req := httptest.NewRequest(http.MethodPost, "/posts/abc/unlike", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	var response models.ValidationError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeValidationFailed, response.Error)
}

func TestUnlikePost_NotFound_404(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		unlikePostFunc: func(userID, postID int) (*models.Post, error) {
			return nil, repositories.ErrPostNotFound
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts/:id/unlike", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UnlikePost(c)
	})

	req := httptest.NewRequest(http.MethodPost, "/posts/99/unlike", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusNotFound, rec.Code)
	var response models.NotFoundError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeNotFound, response.Error)
}

func TestUnlikePost_UserNotFound_401(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		unlikePostFunc: func(userID, postID int) (*models.Post, error) {
			return nil, repositories.ErrUserNotFound
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts/:id/unlike", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UnlikePost(c)
	})

	req := httptest.NewRequest(http.MethodPost, "/posts/1/unlike", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)
	var response models.UnauthorizedError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeUnauthorized, response.Error)
}

func TestGetAllPosts_WithOptionalAuth(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		getAllPostsFunc: func(userID *int) ([]models.Post, error) {
			posts := []models.Post{{ID: 1, Likes: 3}}
			if userID != nil {
				posts[0].IsLiked = true
			}
			return posts, nil
		},
	}
	handler := NewPostHandler(mockService)

	// 未ログイン状態
	t.Run("未ログイン", func(t *testing.T) {
		router := gin.New()
		router.GET("/posts", handler.GetAllPosts)

		req := httptest.NewRequest(http.MethodGet, "/posts", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		var response models.PostsResponse
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.False(t, response.Posts[0].IsLiked)
	})

	// ログイン済み
	t.Run("ログイン済み", func(t *testing.T) {
		router := gin.New()
		router.GET("/posts", func(c *gin.Context) {
			c.Set("user_id", 1)
			handler.GetAllPosts(c)
		})

		req := httptest.NewRequest(http.MethodGet, "/posts", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		var response models.PostsResponse
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.True(t, response.Posts[0].IsLiked)
	})
}

func TestGetPost_WithOptionalAuth(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		getPostByIDFunc: func(id int, userID *int) (*models.Post, error) {
			post := &models.Post{ID: id, Likes: 5}
			if userID != nil {
				post.IsLiked = true
			}
			return post, nil
		},
	}
	handler := NewPostHandler(mockService)

	// 未ログイン状態
	t.Run("未ログイン", func(t *testing.T) {
		router := gin.New()
		router.GET("/posts/:id", handler.GetPost)

		req := httptest.NewRequest(http.MethodGet, "/posts/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		var response models.Post
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.False(t, response.IsLiked)
	})

	// ログイン済み
	t.Run("ログイン済み", func(t *testing.T) {
		router := gin.New()
		router.GET("/posts/:id", func(c *gin.Context) {
			c.Set("user_id", 1)
			handler.GetPost(c)
		})

		req := httptest.NewRequest(http.MethodGet, "/posts/1", nil)
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, req)

		assert.Equal(t, http.StatusOK, rec.Code)
		var response models.Post
		err := json.Unmarshal(rec.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.True(t, response.IsLiked)
	})
}

func TestGetPost_NotFound_404(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		getPostByIDFunc: func(id int, userID *int) (*models.Post, error) {
			return nil, repositories.ErrPostNotFound
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.GET("/posts/:id", handler.GetPost)

	req := httptest.NewRequest(http.MethodGet, "/posts/99", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusNotFound, rec.Code)
	var response models.NotFoundError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeNotFound, response.Error)
}

func TestGetPost_InternalError_500(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		getPostByIDFunc: func(id int, userID *int) (*models.Post, error) {
			return nil, errors.New("db connection failed")
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.GET("/posts/:id", handler.GetPost)

	req := httptest.NewRequest(http.MethodGet, "/posts/1", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	var response models.ServerError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeInternalServer, response.Error)
}

func TestGetPost_InvalidID_400(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.GET("/posts/:id", handler.GetPost)

	req := httptest.NewRequest(http.MethodGet, "/posts/abc", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	var response models.ValidationError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeValidationFailed, response.Error)
}

func TestGetAllPosts_InternalError_500(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		getAllPostsFunc: func(userID *int) ([]models.Post, error) {
			return nil, errors.New("db connection failed")
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.GET("/posts", handler.GetAllPosts)

	req := httptest.NewRequest(http.MethodGet, "/posts", nil)
	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	var response models.ServerError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeInternalServer, response.Error)
}

func TestCreatePost_ImageNotFound_404(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		createPostFunc: func(userID int, input *models.CreatePostInput) (*models.Post, error) {
			return nil, services.ErrImageNotFound
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.POST("/posts", func(c *gin.Context) {
		c.Set("user_id", 1)
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

	assert.Equal(t, http.StatusNotFound, rec.Code)
	var response models.NotFoundError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeNotFound, response.Error)
}

func TestDeletePost_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		deletePostFunc: func(userID, postID int) error {
			return nil
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.DELETE("/posts/:id", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.DeletePost(c)
	})

	req := httptest.NewRequest(http.MethodDelete, "/posts/1", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusNoContent, rec.Code)
}

func TestDeletePost_NoAuth(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.DELETE("/posts/:id", handler.DeletePost)

	req := httptest.NewRequest(http.MethodDelete, "/posts/1", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)
	var response models.UnauthorizedError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeUnauthorized, response.Error)
}

func TestDeletePost_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		deletePostFunc: func(userID, postID int) error {
			return repositories.ErrPostNotFound
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.DELETE("/posts/:id", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.DeletePost(c)
	})

	req := httptest.NewRequest(http.MethodDelete, "/posts/999", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusNotFound, rec.Code)
	var response models.NotFoundError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeNotFound, response.Error)
}

func TestDeletePost_Forbidden(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		deletePostFunc: func(userID, postID int) error {
			return repositories.ErrForbidden
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.DELETE("/posts/:id", func(c *gin.Context) {
		c.Set("user_id", 2)
		handler.DeletePost(c)
	})

	req := httptest.NewRequest(http.MethodDelete, "/posts/1", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusForbidden, rec.Code)
	var response models.ForbiddenError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeForbidden, response.Error)
}

func TestDeletePost_InvalidID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.DELETE("/posts/:id", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.DeletePost(c)
	})

	req := httptest.NewRequest(http.MethodDelete, "/posts/invalid", nil)
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	var response models.ValidationError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeValidationFailed, response.Error)
}

func TestUpdatePost_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		updatePostFunc: func(userID, postID int, input *models.UpdatePostInput) (*models.Post, error) {
			return &models.Post{ID: postID, UserID: userID}, nil
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.PATCH("/posts/:id", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UpdatePost(c)
	})

	reqBody := map[string]interface{}{
		"slides": []map[string]interface{}{
			{"text": "updated text"},
		},
	}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(http.MethodPatch, "/posts/1", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
}

func TestUpdatePost_NoAuth(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.PATCH("/posts/:id", handler.UpdatePost)

	reqBody := map[string]interface{}{
		"slides": []map[string]interface{}{
			{"text": "updated text"},
		},
	}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(http.MethodPatch, "/posts/1", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusUnauthorized, rec.Code)
}

func TestUpdatePost_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		updatePostFunc: func(userID, postID int, input *models.UpdatePostInput) (*models.Post, error) {
			return nil, repositories.ErrPostNotFound
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.PATCH("/posts/:id", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UpdatePost(c)
	})

	reqBody := map[string]interface{}{
		"slides": []map[string]interface{}{
			{"text": "updated"},
		},
	}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(http.MethodPatch, "/posts/999", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusNotFound, rec.Code)
	var response models.NotFoundError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeNotFound, response.Error)
}

func TestUpdatePost_Forbidden(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		updatePostFunc: func(userID, postID int, input *models.UpdatePostInput) (*models.Post, error) {
			return nil, repositories.ErrForbidden
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.PATCH("/posts/:id", func(c *gin.Context) {
		c.Set("user_id", 2)
		handler.UpdatePost(c)
	})

	reqBody := map[string]interface{}{
		"slides": []map[string]interface{}{
			{"text": "updated"},
		},
	}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(http.MethodPatch, "/posts/1", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusForbidden, rec.Code)
	var response models.ForbiddenError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeForbidden, response.Error)
}

func TestUpdatePost_SlideCountMismatch(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{
		updatePostFunc: func(userID, postID int, input *models.UpdatePostInput) (*models.Post, error) {
			return nil, repositories.ErrSlideCountMismatch
		},
	}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.PATCH("/posts/:id", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UpdatePost(c)
	})

	reqBody := map[string]interface{}{
		"slides": []map[string]interface{}{
			{"text": "a"},
			{"text": "b"},
		},
	}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(http.MethodPatch, "/posts/1", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
	var response models.ValidationError
	err := json.Unmarshal(rec.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeValidationFailed, response.Error)
}

func TestUpdatePost_InvalidID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockPostService{}
	handler := NewPostHandler(mockService)

	router := gin.New()
	router.PATCH("/posts/:id", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UpdatePost(c)
	})

	reqBody := map[string]interface{}{
		"slides": []map[string]interface{}{
			{"text": "updated"},
		},
	}
	body, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(http.MethodPatch, "/posts/invalid", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusBadRequest, rec.Code)
}
