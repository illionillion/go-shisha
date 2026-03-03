package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"
	"go-shisha-backend/internal/services"
	"go-shisha-backend/pkg/logging"

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
// @Description 全てのユーザーの一覧を取得します（総数付き）
// @Tags users
// @Accept json
// @Produce json
// @Success 200 {object} models.UsersResponse "ユーザー一覧と総数"
// @Failure 500 {object} map[string]interface{} "サーバーエラー"
// @Router /users [get]
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	users, err := h.userService.GetAllUsers()
	if err != nil {
		logging.L.Error("failed to get all users", "handler", "UserHandler", "method", "GetAllUsers", "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	response := models.UsersResponse{
		Users: users,
		Total: len(users),
	}
	c.JSON(http.StatusOK, response)
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
		if errors.Is(err, repositories.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		logging.L.Error("failed to get user", "handler", "UserHandler", "method", "GetUser", "user_id", id, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, user)
}

/**
 * GetUserPosts handles GET /api/v1/users/:id/posts
 */
// @Summary ユーザーの投稿一覧取得
// @Description 指定されたユーザーの全ての投稿を取得します（総数付き）
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "ユーザーID"
// @Success 200 {object} models.PostsResponse "投稿一覧と総数"
// @Failure 400 {object} map[string]interface{} "無効なユーザーID"
// @Failure 404 {object} map[string]interface{} "ユーザーが見つかりません"
// @Router /users/{id}/posts [get]
func (h *UserHandler) GetUserPosts(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var currentUserID *int
	if v, exists := c.Get("user_id"); exists {
		uid, ok := v.(int)
		if !ok {
			logging.L.Error("invalid user_id type in context", "handler", "UserHandler", "method", "GetUserPosts")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			return
		}
		currentUserID = &uid
	}

	posts, err := h.userService.GetUserPosts(id, currentUserID)
	if err != nil {
		if errors.Is(err, repositories.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		logging.L.Error("failed to get user posts", "handler", "UserHandler", "method", "GetUserPosts", "user_id", id, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	response := models.PostsResponse{
		Posts: posts,
		Total: len(posts),
	}
	c.JSON(http.StatusOK, response)
}
