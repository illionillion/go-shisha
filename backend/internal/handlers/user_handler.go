package handlers

import (
	"net/http"
	"strconv"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/services"

	"github.com/gin-gonic/gin"
)

/**
 * UserHandler handles user-related HTTP requests
 */
type UserHandler struct {
	userService *services.UserService
}

/**
 * NewUserHandler creates a new user handler
 */
func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

/**
 * GetAllUsers handles GET /api/v1/users
 */
// @Summary ユーザー一覧取得
// @Description 全てのユーザーの一覧を取得します
// @Tags users
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "ユーザー一覧"
// @Failure 500 {object} map[string]interface{} "サーバーエラー"
// @Router /users [get]
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	users, err := h.userService.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"total": len(users),
	})
}

/**
 * GetUser handles GET /api/v1/users/:id
 */
// @Summary ユーザー詳細取得
// @Description 指定されたIDのユーザー情報を取得します
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "ユーザーID"
// @Success 200 {object} models.User "ユーザー情報"
// @Failure 400 {object} map[string]interface{} "無効なユーザーID"
// @Failure 404 {object} map[string]interface{} "ユーザーが見つかりません"
// @Router /users/{id} [get]
func (h *UserHandler) GetUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	user, err := h.userService.GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

/**
 * GetUserPosts handles GET /api/v1/users/:id/posts
 */
// @Summary ユーザーの投稿一覧取得
// @Description 指定されたユーザーの全ての投稿を取得します
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "ユーザーID"
// @Success 200 {object} map[string]interface{} "投稿一覧"
// @Failure 400 {object} map[string]interface{} "無効なユーザーID"
// @Failure 404 {object} map[string]interface{} "ユーザーが見つかりません"
// @Router /users/{id}/posts [get]
func (h *UserHandler) GetUserPosts(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	posts, err := h.userService.GetUserPosts(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"posts": posts,
		"total": len(posts),
	})
}
