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

// PostServiceInterface はPostServiceのインターフェース（テスト用）
type PostServiceInterface interface {
	GetAllPosts(userID *int) ([]models.Post, error)
	GetPostByID(id int, userID *int) (*models.Post, error)
	CreatePost(userID int, input *models.CreatePostInput) (*models.Post, error)
	LikePost(userID, postID int) (*models.Post, error)
	UnlikePost(userID, postID int) (*models.Post, error)
	DeletePost(userID, postID int) error
	UpdatePost(userID, postID int, input *models.UpdatePostInput) (*models.Post, error)
}

// PostHandler は投稿関連のHTTPリクエストを処理する
type PostHandler struct {
	postService PostServiceInterface
}

// NewPostHandler は新しいPostHandlerを作成する
func NewPostHandler(postService PostServiceInterface) *PostHandler {
	return &PostHandler{
		postService: postService,
	}
}

// GetAllPosts は GET /api/v1/posts を処理する
// @Summary 投稿一覧取得
// @Description 全ての投稿の一覧を取得します（総数付き）。認証済みの場合、各投稿のいいね状態（is_liked）を含みます
// @Tags posts
// @Accept json
// @Produce json
// @Success 200 {object} models.PostsResponse "投稿一覧と総数"
// @Failure 500 {object} models.ServerError "サーバーエラー"
// @Router /posts [get]
func (h *PostHandler) GetAllPosts(c *gin.Context) {
	var userID *int
	if v, exists := c.Get("user_id"); exists {
		uid, ok := v.(int)
		if !ok {
			logging.L.Error("invalid user_id type in context", "handler", "PostHandler", "method", "GetAllPosts")
			c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
			return
		}
		userID = &uid
	}

	posts, err := h.postService.GetAllPosts(userID)
	if err != nil {
		logging.L.Error("failed to get all posts", "handler", "PostHandler", "method", "GetAllPosts", "error", err)
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	response := models.PostsResponse{
		Posts: posts,
		Total: len(posts),
	}
	c.JSON(http.StatusOK, response)
}

// GetPost は GET /api/v1/posts/:id を処理する
// @Summary 投稿詳細取得
// @Description 指定されたIDの投稿情報を取得します。認証済みの場合、いいね状態（is_liked）を含みます
// @Tags posts
// @Accept json
// @Produce json
// @Param id path int true "投稿ID"
// @Success 200 {object} models.Post "投稿情報"
// @Failure 400 {object} models.ValidationError "無効な投稿ID"
// @Failure 404 {object} models.NotFoundError "投稿が見つかりません"
// @Failure 500 {object} models.ServerError "サーバーエラー"
// @Router /posts/{id} [get]
func (h *PostHandler) GetPost(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
		return
	}

	var userID *int
	if v, exists := c.Get("user_id"); exists {
		uid, ok := v.(int)
		if !ok {
			logging.L.Error("invalid user_id type in context", "handler", "PostHandler", "method", "GetPost")
			c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
			return
		}
		userID = &uid
	}

	post, err := h.postService.GetPostByID(id, userID)
	if err != nil {
		if errors.Is(err, repositories.ErrPostNotFound) {
			c.JSON(http.StatusNotFound, models.NotFoundError{Error: models.ErrCodeNotFound})
			return
		}
		logging.L.Error("failed to get post", "handler", "PostHandler", "method", "GetPost", "post_id", id, "error", err)
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	c.JSON(http.StatusOK, post)
}

// CreatePost は POST /api/v1/posts を処理する
// @Summary 投稿作成
// @Description 新しい投稿を作成します（認証必須）。注意: slides内のflavor_idが無効な場合、そのスライドはFlavorなしで作成されます（エラーにはなりません）
// @Tags posts
// @Accept json
// @Produce json
// @Param post body models.CreatePostInput true "投稿情報"
// @Success 201 {object} models.Post "作成された投稿"
// @Failure 400 {object} models.ValidationError "バリデーションエラー"
// @Failure 401 {object} models.UnauthorizedError "認証エラー"
// @Failure 403 {object} models.ForbiddenError "権限エラー"
// @Failure 404 {object} models.NotFoundError "リソースが見つからない"
// @Failure 500 {object} models.ServerError "サーバーエラー"
// @Security BearerAuth
// @Router /posts [post]
func (h *PostHandler) CreatePost(c *gin.Context) {
	// Get user_id from authentication middleware
	userIDValue, exists := c.Get("user_id")
	if !exists {
		logging.L.Warn("user_id not found in context", "handler", "PostHandler", "method", "CreatePost")
		c.JSON(http.StatusUnauthorized, models.UnauthorizedError{Error: models.ErrCodeUnauthorized})
		return
	}

	userID, ok := userIDValue.(int)
	if !ok {
		logging.L.Error("invalid user_id type in context", "handler", "PostHandler", "method", "CreatePost")
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	var input models.CreatePostInput
	if err := c.ShouldBindJSON(&input); err != nil {
		logging.L.Warn("invalid request body", "handler", "PostHandler", "method", "CreatePost", "user_id", userID, "error", err)
		c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
		return
	}

	// Create post with authenticated user's ID
	post, err := h.postService.CreatePost(userID, &input)
	if err != nil {
		// ユーザーが見つからない場合は認証エラーとして扱う
		if errors.Is(err, repositories.ErrUserNotFound) {
			logging.L.Warn("user not found for post creation", "handler", "PostHandler", "method", "CreatePost", "user_id", userID)
			c.JSON(http.StatusUnauthorized, models.UnauthorizedError{Error: models.ErrCodeUnauthorized})
			return
		}
		// 画像関連エラーのハンドリング
		if errors.Is(err, services.ErrInvalidImagePath) || errors.Is(err, services.ErrImageNotAllowed) ||
			errors.Is(err, services.ErrImageDeleted) {
			logging.L.Warn("invalid image URL", "handler", "PostHandler", "method", "CreatePost", "user_id", userID, "error", err)
			c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
			return
		}
		if errors.Is(err, services.ErrImagePermissionDenied) {
			logging.L.Warn("image permission denied", "handler", "PostHandler", "method", "CreatePost", "user_id", userID, "error", err)
			c.JSON(http.StatusForbidden, models.ForbiddenError{Error: models.ErrCodeForbidden})
			return
		}
		if errors.Is(err, services.ErrImageNotFound) {
			logging.L.Warn("image not found", "handler", "PostHandler", "method", "CreatePost", "user_id", userID, "error", err)
			c.JSON(http.StatusNotFound, models.NotFoundError{Error: models.ErrCodeNotFound})
			return
		}
		logging.L.Error("failed to create post", "handler", "PostHandler", "method", "CreatePost", "user_id", userID, "error", err)
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	logging.L.Info("post created", "handler", "PostHandler", "method", "CreatePost", "user_id", userID, "post_id", post.ID)
	c.JSON(http.StatusCreated, post)
}

// LikePost は POST /api/v1/posts/:id/like を処理する
// @Summary 投稿にいいね
// @Description 指定された投稿にいいねを追加します（認証必須）
// @Tags posts
// @Accept json
// @Produce json
// @Param id path int true "投稿ID"
// @Success 200 {object} models.Post "いいねが追加された投稿"
// @Failure 400 {object} models.ValidationError "無効な投稿ID"
// @Failure 401 {object} models.UnauthorizedError "認証エラー"
// @Failure 404 {object} models.NotFoundError "投稿が見つかりません"
// @Failure 409 {object} models.ConflictError "既にいいね済み"
// @Failure 500 {object} models.ServerError "サーバーエラー"
// @Security BearerAuth
// @Router /posts/{id}/like [post]
func (h *PostHandler) LikePost(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
		return
	}

	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.UnauthorizedError{Error: models.ErrCodeUnauthorized})
		return
	}
	userID, ok := userIDValue.(int)
	if !ok {
		logging.L.Error("invalid user_id type in context", "handler", "PostHandler", "method", "LikePost")
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	post, err := h.postService.LikePost(userID, id)
	if err != nil {
		if errors.Is(err, repositories.ErrAlreadyLiked) {
			c.JSON(http.StatusConflict, models.ConflictError{Error: models.ErrCodeAlreadyLiked})
			return
		}
		if errors.Is(err, repositories.ErrPostNotFound) {
			c.JSON(http.StatusNotFound, models.NotFoundError{Error: models.ErrCodeNotFound})
			return
		}
		if errors.Is(err, repositories.ErrUserNotFound) {
			c.JSON(http.StatusUnauthorized, models.UnauthorizedError{Error: models.ErrCodeUnauthorized})
			return
		}
		logging.L.Error("failed to like post", "handler", "PostHandler", "method", "LikePost", "user_id", userID, "post_id", id, "error", err)
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	c.JSON(http.StatusOK, post)
}

// DeletePost は DELETE /api/v1/posts/:id を処理する
// @Summary 投稿削除
// @Description 指定された投稿を論理削除します（認証必須・投稿所有者のみ）
// @Tags posts
// @Accept json
// @Produce json
// @Param id path int true "投稿ID"
// @Success 204 "削除成功"
// @Failure 400 {object} models.ValidationError "無効な投稿ID"
// @Failure 401 {object} models.UnauthorizedError "認証エラー"
// @Failure 403 {object} models.ForbiddenError "権限エラー（投稿所有者でない）"
// @Failure 404 {object} models.NotFoundError "投稿が見つかりません"
// @Failure 500 {object} models.ServerError "サーバーエラー"
// @Security BearerAuth
// @Router /posts/{id} [delete]
func (h *PostHandler) DeletePost(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
		return
	}

	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.UnauthorizedError{Error: models.ErrCodeUnauthorized})
		return
	}
	userID, ok := userIDValue.(int)
	if !ok {
		logging.L.Error("invalid user_id type in context", "handler", "PostHandler", "method", "DeletePost")
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	if err := h.postService.DeletePost(userID, id); err != nil {
		if errors.Is(err, repositories.ErrPostNotFound) {
			c.JSON(http.StatusNotFound, models.NotFoundError{Error: models.ErrCodeNotFound})
			return
		}
		if errors.Is(err, repositories.ErrForbidden) {
			c.JSON(http.StatusForbidden, models.ForbiddenError{Error: models.ErrCodeForbidden})
			return
		}
		logging.L.Error("failed to delete post", "handler", "PostHandler", "method", "DeletePost", "user_id", userID, "post_id", id, "error", err)
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	logging.L.Info("post deleted", "handler", "PostHandler", "method", "DeletePost", "user_id", userID, "post_id", id)
	c.Status(http.StatusNoContent)
}

// UnlikePost は POST /api/v1/posts/:id/unlike を処理する
// @Summary 投稿のいいねを取り消す
// @Description 指定された投稿のいいねを取り消します（認証必須）
// @Tags posts
// @Accept json
// @Produce json
// @Param id path int true "投稿ID"
// @Success 200 {object} models.Post "いいねが取り消された投稿"
// @Failure 400 {object} models.ValidationError "無効な投稿ID"
// @Failure 401 {object} models.UnauthorizedError "認証エラー"
// @Failure 404 {object} models.NotFoundError "投稿が見つかりません"
// @Failure 409 {object} models.ConflictError "いいねしていない投稿"
// @Failure 500 {object} models.ServerError "サーバーエラー"
// @Security BearerAuth
// @Router /posts/{id}/unlike [post]
func (h *PostHandler) UnlikePost(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
		return
	}

	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.UnauthorizedError{Error: models.ErrCodeUnauthorized})
		return
	}
	userID, ok := userIDValue.(int)
	if !ok {
		logging.L.Error("invalid user_id type in context", "handler", "PostHandler", "method", "UnlikePost")
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	post, err := h.postService.UnlikePost(userID, id)
	if err != nil {
		if errors.Is(err, repositories.ErrNotLiked) {
			c.JSON(http.StatusConflict, models.ConflictError{Error: models.ErrCodeNotLiked})
			return
		}
		if errors.Is(err, repositories.ErrPostNotFound) {
			c.JSON(http.StatusNotFound, models.NotFoundError{Error: models.ErrCodeNotFound})
			return
		}
		if errors.Is(err, repositories.ErrUserNotFound) {
			c.JSON(http.StatusUnauthorized, models.UnauthorizedError{Error: models.ErrCodeUnauthorized})
			return
		}
		logging.L.Error("failed to unlike post", "handler", "PostHandler", "method", "UnlikePost", "user_id", userID, "post_id", id, "error", err)
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	c.JSON(http.StatusOK, post)
}

// UpdatePost は PATCH /api/v1/posts/:id を処理する
// @Summary 投稿編集
// @Description 指定された投稿のスライドのテキスト・フレーバーを更新します（認証必須・投稿所有者のみ）。各スライドは id で更新対象を指定します。全上書き型のため、全スライドの全フィールドを送信してください。text を省略すると空文字、flavor_id を省略または null で渡すとフレーバーが解除されます。
// @Tags posts
// @Accept json
// @Produce json
// @Param id path int true "投稿ID"
// @Param post body models.UpdatePostInput true "更新内容"
// @Success 200 {object} models.Post "更新された投稿"
// @Failure 400 {object} models.ValidationError "バリデーションエラー"
// @Failure 401 {object} models.UnauthorizedError "認証エラー"
// @Failure 403 {object} models.ForbiddenError "権限エラー（投稿所有者でない）"
// @Failure 404 {object} models.NotFoundError "投稿が見つかりません"
// @Failure 500 {object} models.ServerError "サーバーエラー"
// @Security BearerAuth
// @Router /posts/{id} [patch]
func (h *PostHandler) UpdatePost(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
		return
	}

	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.UnauthorizedError{Error: models.ErrCodeUnauthorized})
		return
	}
	userID, ok := userIDValue.(int)
	if !ok {
		logging.L.Error("invalid user_id type in context", "handler", "PostHandler", "method", "UpdatePost")
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	var input models.UpdatePostInput
	if err := c.ShouldBindJSON(&input); err != nil {
		logging.L.Warn("invalid request body", "handler", "PostHandler", "method", "UpdatePost", "user_id", userID, "error", err)
		c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
		return
	}

	post, err := h.postService.UpdatePost(userID, id, &input)
	if err != nil {
		if errors.Is(err, repositories.ErrPostNotFound) {
			c.JSON(http.StatusNotFound, models.NotFoundError{Error: models.ErrCodeNotFound})
			return
		}
		if errors.Is(err, repositories.ErrForbidden) {
			c.JSON(http.StatusForbidden, models.ForbiddenError{Error: models.ErrCodeForbidden})
			return
		}
		if errors.Is(err, repositories.ErrSlideCountMismatch) {
			c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
			return
		}
		if errors.Is(err, repositories.ErrDuplicateSlideID) {
			c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
			return
		}
		if errors.Is(err, repositories.ErrSlideNotBelongToPost) {
			c.JSON(http.StatusBadRequest, models.ValidationError{Error: models.ErrCodeValidationFailed})
			return
		}
		logging.L.Error("failed to update post", "handler", "PostHandler", "method", "UpdatePost", "user_id", userID, "post_id", id, "error", err)
		c.JSON(http.StatusInternalServerError, models.ServerError{Error: models.ErrCodeInternalServer})
		return
	}

	logging.L.Info("post updated", "handler", "PostHandler", "method", "UpdatePost", "user_id", userID, "post_id", id)
	c.JSON(http.StatusOK, post)
}
