package handlers

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

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
	assert.Contains(t, w.Body.String(), "unauthorized")
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
	assert.Contains(t, w.Body.String(), "ファイルが指定されていません")
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
}

// モック実装
type mockUploadService struct{}

func (m *mockUploadService) UploadImages(userID int, files []*multipart.FileHeader) ([]string, error) {
	return []string{"/images/test.jpg"}, nil
}

type mockUploadServiceFileTooLarge struct{}

func (m *mockUploadServiceFileTooLarge) UploadImages(userID int, files []*multipart.FileHeader) ([]string, error) {
	return nil, services.ErrFileTooLarge
}

// クリーンアップ
func TestMain(m *testing.M) {
	code := m.Run()
	_ = os.RemoveAll("public/images")
	os.Exit(code)
}
