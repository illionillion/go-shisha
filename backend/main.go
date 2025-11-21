package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// User represents a user in the system
type User struct {
	ID          int    `json:"id"`
	Email       string `json:"email"`
	DisplayName string `json:"display_name"`
	Description string `json:"description"`
	IconURL     string `json:"icon_url"`
	ExternalURL string `json:"external_url"`
}

// Post represents a shisha post
type Post struct {
	ID       int    `json:"id"`
	UserID   int    `json:"user_id"`
	Message  string `json:"message"`
	ImageURL string `json:"image_url"`
	Likes    int    `json:"likes"`
	User     User   `json:"user"`
}

// Temporary in-memory storage
var users = []User{
	{ID: 1, Email: "test@example.com", DisplayName: "テストユーザー", Description: "シーシャ大好き！", IconURL: "", ExternalURL: ""},
	{ID: 2, Email: "shisha@example.com", DisplayName: "シーシャマスター", Description: "毎日シーシャ吸ってます", IconURL: "", ExternalURL: "https://twitter.com/shishamaster"},
}

var posts = []Post{
	{ID: 1, UserID: 1, Message: "今日のシーシャは最高でした！ミント系のフレーバーが爽やかで最高", ImageURL: "https://via.placeholder.com/400x600", Likes: 12, User: users[0]},
	{ID: 2, UserID: 2, Message: "新しいお店を発見！雰囲気も良くて味も抜群でした", ImageURL: "https://via.placeholder.com/400x600", Likes: 8, User: users[1]},
}

func main() {
	// Ginのデバッグモードを設定（本番環境ではgin.ReleaseMode）
	gin.SetMode(gin.DebugMode)

	r := gin.Default()

	// CORS設定（開発環境用）
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	// API routes
	api := r.Group("/api/v1")
	{
		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status":  "ok",
				"message": "Go-Shisha API is running",
			})
		})

		// Posts endpoints
		api.GET("/posts", getPosts)
		api.GET("/posts/:id", getPost)
		api.POST("/posts", createPost)
		api.POST("/posts/:id/like", likePost)

		// Users endpoints
		api.GET("/users", getUsers)
		api.GET("/users/:id", getUser)
		api.GET("/users/:id/posts", getUserPosts)
	}

	// サーバーを8081ポートで起動
	r.Run(":8081")
}

// GET /api/v1/posts - Get all posts
func getPosts(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"posts": posts,
		"total": len(posts),
	})
}

// GET /api/v1/posts/:id - Get specific post
func getPost(c *gin.Context) {
	id := c.Param("id")
	
	for _, post := range posts {
		if post.ID == parseID(id) {
			c.JSON(http.StatusOK, post)
			return
		}
	}
	
	c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
}

// POST /api/v1/posts - Create new post
func createPost(c *gin.Context) {
	var newPost struct {
		UserID   int    `json:"user_id" binding:"required"`
		Message  string `json:"message" binding:"required,max=100"`
		ImageURL string `json:"image_url" binding:"required"`
	}

	if err := c.ShouldBindJSON(&newPost); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user
	var user User
	userFound := false
	for _, u := range users {
		if u.ID == newPost.UserID {
			user = u
			userFound = true
			break
		}
	}

	if !userFound {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}

	// Create new post
	post := Post{
		ID:       len(posts) + 1,
		UserID:   newPost.UserID,
		Message:  newPost.Message,
		ImageURL: newPost.ImageURL,
		Likes:    0,
		User:     user,
	}

	posts = append(posts, post)

	c.JSON(http.StatusCreated, post)
}

// POST /api/v1/posts/:id/like - Like a post
func likePost(c *gin.Context) {
	id := parseID(c.Param("id"))
	
	for i := range posts {
		if posts[i].ID == id {
			posts[i].Likes++
			c.JSON(http.StatusOK, posts[i])
			return
		}
	}
	
	c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
}

// GET /api/v1/users - Get all users
func getUsers(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"total": len(users),
	})
}

// GET /api/v1/users/:id - Get specific user
func getUser(c *gin.Context) {
	id := parseID(c.Param("id"))
	
	for _, user := range users {
		if user.ID == id {
			c.JSON(http.StatusOK, user)
			return
		}
	}
	
	c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
}

// GET /api/v1/users/:id/posts - Get posts by specific user
func getUserPosts(c *gin.Context) {
	id := parseID(c.Param("id"))
	
	var userPosts []Post
	for _, post := range posts {
		if post.UserID == id {
			userPosts = append(userPosts, post)
		}
	}
	
	c.JSON(http.StatusOK, gin.H{
		"posts": userPosts,
		"total": len(userPosts),
	})
}

// Helper function to parse string ID to int
func parseID(idStr string) int {
	// Simple implementation - in production, use strconv.Atoi with error handling
	switch idStr {
	case "1":
		return 1
	case "2":
		return 2
	default:
		return 0
	}
}