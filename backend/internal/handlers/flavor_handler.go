package handlers

import (
	"net/http"

	"go-shisha-backend/internal/services"

	"github.com/gin-gonic/gin"
)

/**
 * FlavorHandler handles flavor-related HTTP requests
 */
type FlavorHandler struct {
	flavorService *services.FlavorService
}

/**
 * NewFlavorHandler creates a new flavor handler
 */
func NewFlavorHandler(flavorService *services.FlavorService) *FlavorHandler {
	return &FlavorHandler{
		flavorService: flavorService,
	}
}

/**
 * GetAllFlavors handles GET /api/v1/flavors
 */
// @Summary フレーバー一覧取得
// @Description 全てのフレーバーの一覧を取得します
// @Tags flavors
// @Accept json
// @Produce json
// @Success 200 {array} go-shisha-backend_internal_models.Flavor "フレーバー一覧"
// @Failure 500 {object} map[string]interface{} "サーバーエラー"
// @Router /flavors [get]
func (h *FlavorHandler) GetAllFlavors(c *gin.Context) {
	flavors, err := h.flavorService.GetAllFlavors()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch flavors"})
		return
	}

	c.JSON(http.StatusOK, flavors)
}
