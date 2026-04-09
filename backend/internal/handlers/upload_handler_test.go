package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/services"
	"go-shisha-backend/pkg/logging"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	return gin.Default()
}

func TestUploadHandler_UploadImages_Unauthorized(t *testing.T) {
	handler := &UploadHandler{
		uploadService: &services.UploadService{},
		logger:        logging.L,
	}

	// リクエストボディ作成
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("images", "test.jpg")
	_, _ = io.WriteString(part, "fake image content")
	_ = writer.Close()

	// リクエスト作成（user_idなし）
	req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router := setupTestRouter()
	router.POST("/api/v1/uploads/images", func(c *gin.Context) {
		// user_idをセットしない
		handler.UploadImages(c)
	})

	router.ServeHTTP(w, req)

	// アサーション
	assert.Equal(t, http.StatusUnauthorized, w.Code)

	var response models.UnauthorizedError
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeUnauthorized, response.Error)
}

func TestUploadHandler_UploadImages_NoFiles(t *testing.T) {
	handler := &UploadHandler{
		uploadService: &services.UploadService{},
		logger:        logging.L,
	}

	// 空のリクエストボディ
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	_ = writer.Close()

	// リクエスト作成
	req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router := setupTestRouter()
	router.POST("/api/v1/uploads/images", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UploadImages(c)
	})

	router.ServeHTTP(w, req)

	// アサーション
	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response models.ValidationError
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeValidationFailed, response.Error)
}

func TestUploadHandler_UploadImages_Success(t *testing.T) {
	// テスト用ディレクトリ作成
	_ = os.MkdirAll("public/images", 0755)
	defer func() { _ = os.RemoveAll("public/images") }()

	// モックUploadServiceを作成
	mockService := &mockUploadService{}
	handler := &UploadHandler{
		uploadService: mockService,
		logger:        logging.L,
	}

	// リクエストボディ作成（正常な画像ファイル）
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("images", "test.jpg")
	// JPEGのマジックバイト
	_, _ = part.Write([]byte{0xFF, 0xD8, 0xFF, 0xE0})
	_, _ = io.WriteString(part, "fake jpeg content")
	_ = writer.Close()

	// リクエスト作成
	req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router := setupTestRouter()
	router.POST("/api/v1/uploads/images", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UploadImages(c)
	})

	router.ServeHTTP(w, req)

	// アサーション
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "urls")
}

func TestUploadHandler_UploadImages_FileTooLarge(t *testing.T) {
	mockService := &mockUploadServiceFileTooLarge{}
	handler := &UploadHandler{
		uploadService: mockService,
		logger:        logging.L,
	}

	// リクエストボディ作成（大きすぎるファイル）
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("images", "large.jpg")
	// JPEGのマジックバイト
	_, _ = part.Write([]byte{0xFF, 0xD8, 0xFF, 0xE0})
	// 6MB相当のダミーデータ
	largeData := make([]byte, 6*1024*1024)
	_, _ = part.Write(largeData)
	_ = writer.Close()

	// リクエスト作成
	req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router := setupTestRouter()
	router.POST("/api/v1/uploads/images", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UploadImages(c)
	})

	router.ServeHTTP(w, req)

	// アサーション
	assert.Equal(t, http.StatusRequestEntityTooLarge, w.Code)

	var response models.PayloadTooLargeError
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodePayloadTooLarge, response.Error)
}

func TestUploadHandler_UploadImages_InvalidUserIDType(t *testing.T) {
	mockService := &mockUploadService{}
	handler := &UploadHandler{
		uploadService: mockService,
		logger:        logging.L,
	}

	// リクエストボディ作成
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("images", "test.jpg")
	_, _ = part.Write([]byte{0xFF, 0xD8, 0xFF, 0xE0})
	_ = writer.Close()

	// リクエスト作成
	req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router := setupTestRouter()
	router.POST("/api/v1/uploads/images", func(c *gin.Context) {
		// user_idをstring型でセット（不正な型）
		c.Set("user_id", "not-an-int")
		handler.UploadImages(c)
	})

	router.ServeHTTP(w, req)

	// アサーション
	assert.Equal(t, http.StatusInternalServerError, w.Code)

	var response models.ServerError
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeInternalServer, response.Error)
}

// モック実装
type mockUploadService struct{}

func (m *mockUploadService) UploadImages(userID int, files []*multipart.FileHeader) ([]string, error) {
	return []string{"/images/test.jpg"}, nil
}

func (m *mockUploadService) UploadProfileImage(userID int, file *multipart.FileHeader) (string, error) {
	return "/images/profiles/profile.jpg", nil
}

type mockUploadServiceFileTooLarge struct{}

func (m *mockUploadServiceFileTooLarge) UploadImages(userID int, files []*multipart.FileHeader) ([]string, error) {
	return nil, services.ErrFileTooLarge
}

func (m *mockUploadServiceFileTooLarge) UploadProfileImage(userID int, file *multipart.FileHeader) (string, error) {
	return "", services.ErrFileTooLarge
}

func TestUploadHandler_UploadProfileImage_Unauthorized(t *testing.T) {
	handler := &UploadHandler{
		uploadService: &mockUploadService{},
		logger:        logging.L,
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("image", "profile.jpg")
	_, _ = io.WriteString(part, "fake image content")
	_ = writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/profile-images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router := setupTestRouter()
	router.POST("/api/v1/uploads/profile-images", func(c *gin.Context) {
		handler.UploadProfileImage(c)
	})

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)

	var response models.UnauthorizedError
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeUnauthorized, response.Error)
}

func TestUploadHandler_UploadProfileImage_NoFiles(t *testing.T) {
	handler := &UploadHandler{
		uploadService: &mockUploadService{},
		logger:        logging.L,
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	_ = writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/profile-images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router := setupTestRouter()
	router.POST("/api/v1/uploads/profile-images", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UploadProfileImage(c)
	})

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response models.ValidationError
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeValidationFailed, response.Error)
}

func TestUploadHandler_UploadProfileImage_TooManyFiles(t *testing.T) {
	handler := &UploadHandler{
		uploadService: &mockUploadService{},
		logger:        logging.L,
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	for i := 0; i < 2; i++ {
		part, _ := writer.CreateFormFile("image", "profile.jpg")
		_, _ = part.Write([]byte{0xFF, 0xD8, 0xFF, 0xE0})
	}
	_ = writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/profile-images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router := setupTestRouter()
	router.POST("/api/v1/uploads/profile-images", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UploadProfileImage(c)
	})

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)

	var response models.ValidationError
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeValidationFailed, response.Error)
}

func TestUploadHandler_UploadProfileImage_Success(t *testing.T) {
	_ = os.MkdirAll("public/images/profiles", 0755)
	defer func() { _ = os.RemoveAll("public/images") }()

	handler := &UploadHandler{
		uploadService: &mockUploadService{},
		logger:        logging.L,
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("image", "profile.jpg")
	_, _ = part.Write([]byte{0xFF, 0xD8, 0xFF, 0xE0})
	_, _ = io.WriteString(part, "fake jpeg content")
	_ = writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/profile-images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router := setupTestRouter()
	router.POST("/api/v1/uploads/profile-images", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UploadProfileImage(c)
	})

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response models.UploadProfileImageResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "/images/profiles/profile.jpg", response.URL)
}

func TestUploadHandler_UploadProfileImage_FileTooLarge(t *testing.T) {
	handler := &UploadHandler{
		uploadService: &mockUploadServiceFileTooLarge{},
		logger:        logging.L,
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("image", "large.jpg")
	_, _ = part.Write([]byte{0xFF, 0xD8, 0xFF, 0xE0})
	largeData := make([]byte, 6*1024*1024)
	_, _ = part.Write(largeData)
	_ = writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/profile-images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router := setupTestRouter()
	router.POST("/api/v1/uploads/profile-images", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UploadProfileImage(c)
	})

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusRequestEntityTooLarge, w.Code)

	var response models.PayloadTooLargeError
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodePayloadTooLarge, response.Error)
}

func TestUploadHandler_UploadProfileImage_InvalidUserIDType(t *testing.T) {
	handler := &UploadHandler{
		uploadService: &mockUploadService{},
		logger:        logging.L,
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("image", "profile.jpg")
	_, _ = part.Write([]byte{0xFF, 0xD8, 0xFF, 0xE0})
	_ = writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/profile-images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	router := setupTestRouter()
	router.POST("/api/v1/uploads/profile-images", func(c *gin.Context) {
		c.Set("user_id", "not-an-int")
		handler.UploadProfileImage(c)
	})

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)

	var response models.ServerError
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodeInternalServer, response.Error)
}

// TestUploadHandler_UploadImages_MultipartFormMaxBytesError は
// c.MultipartForm() が *http.MaxBytesError を返した場合に 413 が返ることを確認する
func TestUploadHandler_UploadImages_MultipartFormMaxBytesError(t *testing.T) {
	handler := &UploadHandler{
		uploadService: &mockUploadService{},
		logger:        logging.L,
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("images", "test.jpg")
	_, _ = part.Write(make([]byte, 100))
	_ = writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	// 1バイトに制限して MultipartForm が MaxBytesError を返すようにする
	req.Body = http.MaxBytesReader(w, req.Body, 1)

	router := setupTestRouter()
	router.POST("/api/v1/uploads/images", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UploadImages(c)
	})

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusRequestEntityTooLarge, w.Code)

	var response models.PayloadTooLargeError
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodePayloadTooLarge, response.Error)
}

// TestUploadHandler_UploadProfileImage_MultipartFormMaxBytesError は
// c.MultipartForm() が *http.MaxBytesError を返した場合に 413 が返ることを確認する
func TestUploadHandler_UploadProfileImage_MultipartFormMaxBytesError(t *testing.T) {
	handler := &UploadHandler{
		uploadService: &mockUploadService{},
		logger:        logging.L,
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile("image", "profile.jpg")
	_, _ = part.Write(make([]byte, 100))
	_ = writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/profile-images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	w := httptest.NewRecorder()
	// 1バイトに制限して MultipartForm が MaxBytesError を返すようにする
	req.Body = http.MaxBytesReader(w, req.Body, 1)

	router := setupTestRouter()
	router.POST("/api/v1/uploads/profile-images", func(c *gin.Context) {
		c.Set("user_id", 1)
		handler.UploadProfileImage(c)
	})

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusRequestEntityTooLarge, w.Code)

	var response models.PayloadTooLargeError
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, models.ErrCodePayloadTooLarge, response.Error)
}

// クリーンアップ
func TestMain(m *testing.M) {
	code := m.Run()
	_ = os.RemoveAll("public/images")
	os.Exit(code)
}