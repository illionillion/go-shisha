package handlers

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/illionillion/go-shisha/internal/models"
	"github.com/illionillion/go-shisha/internal/services"
)

// UploadHandler 画像アップロードハンドラー
type UploadHandler struct {
	uploadService *services.UploadService
	logger        *slog.Logger
}

// NewUploadHandler UploadHandlerのコンストラクタ
func NewUploadHandler(uploadService *services.UploadService, logger *slog.Logger) *UploadHandler {
	return &UploadHandler{
		uploadService: uploadService,
		logger:        logger,
	}
}

// UploadImages 画像アップロードエンドポイント
// @Summary 画像アップロード
// @Description 複数の画像を一括アップロードし、保存されたURLの配列を返却します
// @Tags uploads
// @Accept multipart/form-data
// @Produce json
// @Param images formData file true "アップロードする画像（複数可）"
// @Success 200 {object} go-shisha-backend_internal_models.UploadImagesResponse
// @Failure 400 {object} map[string]interface{} "バリデーションエラー"
// @Failure 401 {object} map[string]interface{} "認証エラー"
// @Failure 413 {object} map[string]interface{} "ファイルサイズ超過"
// @Failure 500 {object} map[string]interface{} "サーバーエラー"
// @Security BearerAuth
// @Router /uploads/images [post]
func (h *UploadHandler) UploadImages(c *gin.Context) {
	// 認証確認
	userID, exists := c.Get("user_id")
	if !exists {
		h.logger.Warn("未認証のアップロードリクエスト")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "認証が必要です"})
		return
	}

	h.logger.Info("画像アップロードリクエスト受信", "user_id", userID)

	// multipart/form-dataからファイル取得
	form, err := c.MultipartForm()
	if err != nil {
		h.logger.Error("フォーム取得失敗", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "フォームデータの取得に失敗しました"})
		return
	}

	files := form.File["images"]
	if len(files) == 0 {
		h.logger.Warn("ファイルが指定されていない")
		c.JSON(http.StatusBadRequest, gin.H{"error": "ファイルが指定されていません"})
		return
	}

	// サービス層でアップロード処理
	urls, err := h.uploadService.UploadImages(files)
	if err != nil {
		// エラーメッセージに応じてステータスコードを変更
		statusCode := http.StatusInternalServerError
		if err.Error() == "ファイルが指定されていません" {
			statusCode = http.StatusBadRequest
		} else if err.Error()[:8] == "ファイルサイズ" {
			statusCode = http.StatusRequestEntityTooLarge
		} else if err.Error()[:8] == "サポートさ" {
			statusCode = http.StatusBadRequest
		}

		h.logger.Error("画像アップロード失敗",
			"error", err,
			"user_id", userID,
			"file_count", len(files))
		c.JSON(statusCode, gin.H{"error": err.Error()})
		return
	}

	h.logger.Info("画像アップロード成功",
		"user_id", userID,
		"file_count", len(files),
		"urls", urls)

	c.JSON(http.StatusOK, models.UploadImagesResponse{
		URLs: urls,
	})
}
