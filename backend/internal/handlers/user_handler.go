package handlers

import (
	"net/http"
	"strconv"

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
