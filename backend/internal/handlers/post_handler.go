package handlers

import (
	"net/http"
	"strconv"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/services"

	"github.com/gin-gonic/gin"
)

/**
 * PostHandler handles post-related HTTP requests
 */
type PostHandler struct {
	postService *services.PostService
}

/**
 * NewPostHandler creates a new post handler
 */
func NewPostHandler(postService *services.PostService) *PostHandler {
	return &PostHandler{
		postService: postService,
	}
}

/**
 * GetAllPosts handles GET /api/v1/posts
 */
// @Summary 投稿一覧取得
// @Description 全ての投稿の一覧を取得します（総数付き）
// @Tags posts
// @Accept json
// @Produce json
// @Success 200 {object} models.PostsResponse "投稿一覧と総数"
// @Failure 500 {object} map[string]interface{} "サーバーエラー"
// @Router /posts [get]
func (h *PostHandler) GetAllPosts(c *gin.Context) {
	posts, err := h.postService.GetAllPosts()
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

/**
 * GetPost handles GET /api/v1/posts/:id
 */
// @Summary 投稿詳細取得
// @Description 指定されたIDの投稿情報を取得します
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

	post, err := h.postService.GetPostByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(http.StatusOK, post)
}

/**
 * CreatePost handles POST /api/v1/posts
 */
// @Summary 投稿作成
// @Description 新しい投稿を作成します（認証必須）
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
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var input models.CreatePostInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create post with authenticated user's ID
	post, err := h.postService.CreatePost(userID.(int), &input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, post)
}

/**
 * LikePost handles POST /api/v1/posts/:id/like
 */
// @Summary 投稿にいいね
// @Description 指定された投稿にいいねを追加します
// @Tags posts
// @Accept json
// @Produce json
// @Param id path int true "投稿ID"
// @Success 200 {object} models.Post "いいねが追加された投稿"
// @Failure 400 {object} map[string]interface{} "無効な投稿ID"
// @Failure 404 {object} map[string]interface{} "投稿が見つかりません"
// @Router /posts/{id}/like [post]
func (h *PostHandler) LikePost(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	post, err := h.postService.LikePost(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(http.StatusOK, post)
}

/**
 * UnlikePost handles POST /api/v1/posts/:id/unlike
 */
// @Summary 投稿のいいねを取り消す
// @Description 指定された投稿のいいねを取り消します
// @Tags posts
// @Accept json
// @Produce json
// @Param id path int true "投稿ID"
// @Success 200 {object} models.Post "いいねが取り消された投稿"
// @Failure 400 {object} map[string]interface{} "無効な投稿ID"
// @Failure 404 {object} map[string]interface{} "投稿が見つかりません"
// @Router /posts/{id}/unlike [post]
func (h *PostHandler) UnlikePost(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	post, err := h.postService.UnlikePost(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	c.JSON(http.StatusOK, post)
}
