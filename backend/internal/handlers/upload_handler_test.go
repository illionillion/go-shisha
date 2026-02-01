package handlers

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"net/httptest"
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
	io.WriteString(part, "fake image content")
	writer.Close()

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
	writer.Close()

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

// クリーンアップ
func TestMain(m *testing.M) {
	code := m.Run()
	os.RemoveAll("public/images")
	os.Exit(code)
}
