package handlers

import (
	"net/http"

	"go-shisha-backend/internal/models"

	"github.com/gin-gonic/gin"
)

// FlavorServiceInterface フレーバーサービスのインターフェース
type FlavorServiceInterface interface {
	GetAllFlavors() ([]models.Flavor, error)
}

// FlavorHandler handles flavor-related HTTP requests
type FlavorHandler struct {
	flavorService FlavorServiceInterface
}

// NewFlavorHandler creates a new flavor handler
func NewFlavorHandler(flavorService FlavorServiceInterface) *FlavorHandler {
	return &FlavorHandler{
		flavorService: flavorService,
	}
}

// GetAllFlavors handles GET /api/v1/flavors
// @Summary フレーバー一覧取得
// @Description 全てのフレーバーの一覧を取得します
// @Tags flavors
// @Accept json
// @Produce json
// @Success 200 {array} go-shisha-backend_internal_models.Flavor "フレーバー一覧"
// @Failure 500 {object} models.ServerError "サーバーエラー"
// @Router /flavors [get]
func (h *FlavorHandler) GetAllFlavors(c *gin.Context) {
	flavors, err := h.flavorService.GetAllFlavors()
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	c.JSON(http.StatusOK, flavors)
}
