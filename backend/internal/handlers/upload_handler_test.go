package handlers

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/textproto"
	"os"
	"testing"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestUploadHandler_UploadImages(t *testing.T) {
	gin.SetMode(gin.TestMode)
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	uploadService := services.NewUploadService(logger)
	handler := NewUploadHandler(uploadService, logger)

	// テスト後のクリーンアップ
	defer func() {
		os.RemoveAll("public/images")
	}()

	t.Run("正常系_画像アップロード成功", func(t *testing.T) {
		// テストデータ準備
		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)

		// テスト画像を追加（正しいContent-Typeヘッダーを設定）
		h := make(textproto.MIMEHeader)
		h.Set("Content-Disposition", `form-data; name="images"; filename="test1.jpg"`)
		h.Set("Content-Type", "image/jpeg")
		part1, _ := writer.CreatePart(h)
		part1.Write([]byte("fake jpeg data"))

		h2 := make(textproto.MIMEHeader)
		h2.Set("Content-Disposition", `form-data; name="images"; filename="test2.png"`)
		h2.Set("Content-Type", "image/png")
		part2, _ := writer.CreatePart(h2)
		part2.Write([]byte("fake png data"))

		writer.Close()

		// リクエスト作成
		req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/images", body)
		req.Header.Set("Content-Type", writer.FormDataContentType())

		// Ginコンテキスト準備
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = req

		// 認証情報をセット（ミドルウェアの代わり）
		c.Set("user_id", uint(1))

		// ハンドラー実行
		handler.UploadImages(c)

		// レスポンス検証
		assert.Equal(t, http.StatusOK, w.Code)

		var response models.UploadImagesResponse
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Len(t, response.URLs, 2)
		for _, url := range response.URLs {
			assert.Contains(t, url, "/images/")
		}
	})

	t.Run("異常系_未認証", func(t *testing.T) {
		// リクエスト作成
		req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/images", nil)

		// Ginコンテキスト準備（認証情報なし）
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = req

		// ハンドラー実行
		handler.UploadImages(c)

		// レスポンス検証
		assert.Equal(t, http.StatusUnauthorized, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "認証が必要です")
	})

	t.Run("異常系_ファイルなし", func(t *testing.T) {
		// 空のmultipart/form-data
		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)
		writer.Close()

		// リクエスト作成
		req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/images", body)
		req.Header.Set("Content-Type", writer.FormDataContentType())

		// Ginコンテキスト準備
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = req
		c.Set("user_id", uint(1))

		// ハンドラー実行
		handler.UploadImages(c)

		// レスポンス検証
		assert.Equal(t, http.StatusBadRequest, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "ファイルが指定されていません")
	})

	t.Run("異常系_フォームデータ取得失敗", func(t *testing.T) {
		// 不正なContent-Type
		req := httptest.NewRequest(http.MethodPost, "/api/v1/uploads/images", bytes.NewReader([]byte("invalid data")))
		req.Header.Set("Content-Type", "application/json")

		// Ginコンテキスト準備
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = req
		c.Set("user_id", uint(1))

		// ハンドラー実行
		handler.UploadImages(c)

		// レスポンス検証
		assert.Equal(t, http.StatusBadRequest, w.Code)

		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Contains(t, response["error"], "フォームデータの取得に失敗しました")
	})
}
