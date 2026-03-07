package handlers

import (
	"errors"
	"log/slog"
	"mime/multipart"
	"net/http"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/services"

	"github.com/gin-gonic/gin"
)

// UploadServiceInterface 画像アップロードサービスのインターフェース
type UploadServiceInterface interface {
	UploadImages(userID int, files []*multipart.FileHeader) ([]string, error)
}

// UploadHandler 画像アップロードハンドラー
type UploadHandler struct {
	uploadService UploadServiceInterface
	logger        *slog.Logger
}

// NewUploadHandler UploadHandlerのコンストラクタ
func NewUploadHandler(uploadService UploadServiceInterface, logger *slog.Logger) *UploadHandler {
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
// @Failure 400 {object} models.ValidationError "バリデーションエラー"
// @Failure 401 {object} models.UnauthorizedError "認証エラー"
// @Failure 413 {object} models.PayloadTooLargeError "ファイルサイズ超過"
// @Failure 500 {object} models.ServerError "サーバーエラー"
// @Security BearerAuth
// @Router /uploads/images [post]
func (h *UploadHandler) UploadImages(c *gin.Context) {
	// 認証確認
	userID, exists := c.Get("user_id")
	if !exists {
		h.logger.Warn("未認証のアップロードリクエスト")
		c.JSON(http.StatusUnauthorized, models.UnauthorizedError{Error: models.ErrCodeUnauthorized})
		return
	}

	h.logger.Info("画像アップロードリクエスト受信", "user_id", userID)

	// multipart/form-dataからファイル取得
	form, err := c.MultipartForm()
	if err != nil {
		h.logger.Error("フォーム取得失敗", "error", err)
		c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
		return
	}

	files := form.File["images"]
	if len(files) == 0 {
		h.logger.Warn("ファイルが指定されていない")
		c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
		return
	}

	// user_idを整数型に変換
	uid, ok := userID.(int)
	if !ok {
		h.logger.Error("user_idの型が不正", "user_id", userID)
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	// サービス層でアップロード処理
	urls, err := h.uploadService.UploadImages(uid, files)
	if err != nil {
		h.logger.Error("画像アップロード失敗",
			"error", err,
			"user_id", userID,
			"file_count", len(files))
		// クライアント起因のエラーはバリデーションエラーとして返す
		if errors.Is(err, services.ErrNoFiles) || errors.Is(err, services.ErrTooManyFiles) ||
			errors.Is(err, services.ErrInvalidFileType) || errors.Is(err, services.ErrInvalidExtension) {
			c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
			return
		}
		if errors.Is(err, services.ErrFileTooLarge) {
			c.JSON(http.StatusRequestEntityTooLarge, models.PayloadTooLargeError{Error: models.ErrCodePayloadTooLarge})
			return
		}
		// サーバー起因のエラーは詳細を隠す
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
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
