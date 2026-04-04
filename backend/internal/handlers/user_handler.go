package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"
	"go-shisha-backend/pkg/logging"

	"github.com/gin-gonic/gin"
)

// UserServiceInterface は UserService のインターフェース（テスト用）
type UserServiceInterface interface {
	GetAllUsers() ([]models.User, error)
	GetUserByID(id int) (*models.User, error)
	GetUserPosts(userID int, currentUserID *int) ([]models.Post, error)
	UpdateMyProfile(userID int, input models.UpdateUserInput) (*models.User, error)
}

// UserHandler はユーザー関連のHTTPリクエストを処理する
type UserHandler struct {
	userService UserServiceInterface
}

// NewUserHandler は新しい UserHandler を作成する
func NewUserHandler(userService UserServiceInterface) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// GetAllUsers は GET /api/v1/users を処理する
// @Summary ユーザー一覧取得
// @Description 全てのユーザーの一覧を取得します（総数付き）
// @Tags users
// @Accept json
// @Produce json
// @Success 200 {object} models.UsersResponse "ユーザー一覧と総数"
// @Failure 500 {object} models.ServerError "サーバーエラー"
// @Router /users [get]
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	users, err := h.userService.GetAllUsers()
	if err != nil {
		logging.L.Error("failed to get all users", "handler", "UserHandler", "method", "GetAllUsers", "error", err)
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	response := models.UsersResponse{
		Users: users,
		Total: len(users),
	}
	c.JSON(http.StatusOK, response)
}

// GetUser は GET /api/v1/users/:id を処理する
// @Summary ユーザー詳細取得
// @Description 指定されたIDのユーザー情報を取得します
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "ユーザーID"
// @Success 200 {object} models.User "ユーザー情報"
// @Failure 400 {object} models.ValidationError "無効なユーザーID"
// @Failure 404 {object} models.NotFoundError "ユーザーが見つかりません"
// @Failure 500 {object} models.ServerError "サーバーエラー"
// @Router /users/{id} [get]
func (h *UserHandler) GetUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
		return
	}

	user, err := h.userService.GetUserByID(id)
	if err != nil {
		if errors.Is(err, repositories.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, models.NotFoundError{Error: models.ErrCodeNotFound})
			return
		}
		logging.L.Error("failed to get user", "handler", "UserHandler", "method", "GetUser", "user_id", id, "error", err)
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GetUserPosts は GET /api/v1/users/:id/posts を処理する
// @Summary ユーザーの投稿一覧取得
// @Description 指定されたユーザーの全ての投稿を取得します（総数付き）
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "ユーザーID"
// @Success 200 {object} models.PostsResponse "投稿一覧と総数"
// @Failure 400 {object} models.ValidationError "無効なユーザーID"
// @Failure 404 {object} models.NotFoundError "ユーザーが見つかりません"
// @Failure 500 {object} models.ServerError "サーバーエラー"
// @Router /users/{id}/posts [get]
func (h *UserHandler) GetUserPosts(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
		return
	}

	var currentUserID *int
	if v, exists := c.Get("user_id"); exists {
		uid, ok := v.(int)
		if !ok {
			logging.L.Error("invalid user_id type in context", "handler", "UserHandler", "method", "GetUserPosts")
			c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
			return
		}
		currentUserID = &uid
	}

	posts, err := h.userService.GetUserPosts(id, currentUserID)
	if err != nil {
		if errors.Is(err, repositories.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, models.NotFoundError{Error: models.ErrCodeNotFound})
			return
		}
		logging.L.Error("failed to get user posts", "handler", "UserHandler", "method", "GetUserPosts", "user_id", id, "error", err)
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	response := models.PostsResponse{
		Posts: posts,
		Total: len(posts),
	}
	c.JSON(http.StatusOK, response)
}

// UpdateMe は PATCH /api/v1/users/me を処理する
// @Summary 自分のプロフィール更新
// @Description 認証ユーザー自身のプロフィール情報を更新します
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.UpdateUserInput true "更新するフィールド（省略可能）"
// @Success 200 {object} models.User "更新後のユーザー情報"
// @Failure 400 {object} models.ValidationError "バリデーションエラー"
// @Failure 401 {object} models.UnauthorizedError "認証エラー"
// @Failure 500 {object} models.ServerError "サーバーエラー"
// @Router /users/me [patch]
func (h *UserHandler) UpdateMe(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.UnauthorizedError{Error: models.ErrCodeUnauthorized})
		return
	}
	userID, ok := userIDVal.(int)
	if !ok {
		logging.L.Error("invalid user_id type in context", "handler", "UserHandler", "method", "UpdateMe")
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	var input models.UpdateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
		return
	}

	user, err := h.userService.UpdateMyProfile(userID, input)
	if err != nil {
		logging.L.Error("failed to update user profile", "handler", "UserHandler", "method", "UpdateMe", "user_id", userID, "error", err)
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	c.JSON(http.StatusOK, user)
}
