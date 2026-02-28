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
// @Failure 500 {object} map[string]interface{} "サーバーエラー"
// @Router /posts [get]
func (h *PostHandler) GetAllPosts(c *gin.Context) {
	var userID *int
	if v, exists := c.Get("user_id"); exists {
		uid, ok := v.(int)
		if ok {
			userID = &uid
		}
	}

	posts, err := h.postService.GetAllPosts(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
// @Failure 400 {object} map[string]interface{} "無効な投稿ID"
// @Failure 404 {object} map[string]interface{} "投稿が見つかりません"
// @Router /posts/{id} [get]
func (h *PostHandler) GetPost(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var userID *int
	if v, exists := c.Get("user_id"); exists {
		uid, ok := v.(int)
		if ok {
			userID = &uid
		}
	}

	post, err := h.postService.GetPostByID(id, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
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
// @Failure 400 {object} map[string]interface{} "バリデーションエラー"
// @Failure 401 {object} map[string]interface{} "認証エラー"
// @Failure 500 {object} map[string]interface{} "サーバーエラー"
// @Security BearerAuth
// @Router /posts [post]
func (h *PostHandler) CreatePost(c *gin.Context) {
	// Get user_id from authentication middleware
	userIDValue, exists := c.Get("user_id")
	if !exists {
		logging.L.Warn("user_id not found in context", "handler", "PostHandler", "method", "CreatePost")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, ok := userIDValue.(int)
	if !ok {
		logging.L.Error("invalid user_id type", "handler", "PostHandler", "method", "CreatePost", "type", "%T", userIDValue)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user_id type"})
		return
	}

	var input models.CreatePostInput
	if err := c.ShouldBindJSON(&input); err != nil {
		logging.L.Warn("invalid request body", "handler", "PostHandler", "method", "CreatePost", "user_id", userID, "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create post with authenticated user's ID
	post, err := h.postService.CreatePost(userID, &input)
	if err != nil {
		// ユーザーが見つからない場合は認証エラーとして扱う
		if errors.Is(err, repositories.ErrUserNotFound) {
			logging.L.Warn("user not found for post creation", "handler", "PostHandler", "method", "CreatePost", "user_id", userID)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
			return
		}
		// 画像関連エラーのハンドリング
		if errors.Is(err, services.ErrInvalidImagePath) || errors.Is(err, services.ErrImageNotAllowed) ||
			errors.Is(err, services.ErrImageDeleted) {
			logging.L.Warn("invalid image URL", "handler", "PostHandler", "method", "CreatePost", "user_id", userID, "error", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if errors.Is(err, services.ErrImagePermissionDenied) {
			logging.L.Warn("image permission denied", "handler", "PostHandler", "method", "CreatePost", "user_id", userID, "error", err)
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		if errors.Is(err, services.ErrImageNotFound) {
			logging.L.Warn("image not found", "handler", "PostHandler", "method", "CreatePost", "user_id", userID, "error", err)
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		logging.L.Error("failed to create post", "handler", "PostHandler", "method", "CreatePost", "user_id", userID, "error", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
// @Failure 400 {object} map[string]interface{} "無効な投稿ID"
// @Failure 401 {object} map[string]interface{} "認証エラー"
// @Failure 404 {object} map[string]interface{} "投稿が見つかりません"
// @Failure 409 {object} map[string]interface{} "既にいいね済み"
// @Security BearerAuth
// @Router /posts/{id}/like [post]
func (h *PostHandler) LikePost(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID, ok := userIDValue.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user_id type"})
		return
	}

	post, err := h.postService.LikePost(userID, id)
	if err != nil {
		if errors.Is(err, repositories.ErrAlreadyLiked) {
			c.JSON(http.StatusConflict, gin.H{"error": "already liked"})
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(http.StatusOK, post)
}

// UnlikePost は POST /api/v1/posts/:id/unlike を処理する
// @Summary 投稿のいいねを取り消す
// @Description 指定された投稿のいいねを取り消します（認証必須）
// @Tags posts
// @Accept json
// @Produce json
// @Param id path int true "投稿ID"
// @Success 200 {object} models.Post "いいねが取り消された投稿"
// @Failure 400 {object} map[string]interface{} "無効な投稿ID"
// @Failure 401 {object} map[string]interface{} "認証エラー"
// @Failure 404 {object} map[string]interface{} "投稿が見つかりません"
// @Failure 409 {object} map[string]interface{} "いいねしていない投稿"
// @Security BearerAuth
// @Router /posts/{id}/unlike [post]
func (h *PostHandler) UnlikePost(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	userIDValue, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID, ok := userIDValue.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user_id type"})
		return
	}

	post, err := h.postService.UnlikePost(userID, id)
	if err != nil {
		if errors.Is(err, repositories.ErrNotLiked) {
			c.JSON(http.StatusConflict, gin.H{"error": "not liked"})
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(http.StatusOK, post)
}
