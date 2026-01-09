package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "go-shisha-backend/docs" // Swagger docs
	"go-shisha-backend/internal/handlers"
	"go-shisha-backend/internal/repositories/postgres"
	"go-shisha-backend/internal/services"
	"go-shisha-backend/pkg/db"
	"go-shisha-backend/pkg/logging"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Go-Shisha API
// @version 1.0
// @description シーシャSNSアプリケーションのバックエンドAPI
// @description このAPIはシーシャの投稿、ユーザー管理を行います
//
// @contact.name API Support
// @contact.url https://github.com/illionillion/go-shisha
//
// @host localhost:8080
// @BasePath /api/v1
// @schemes http

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

	// 静的ファイル配信（画像）
	r.Static("/images", "./public/images")
	logging.L.Info("static images served", "path", "/images", "url", "http://localhost:8080/images/")

	// Dependency Injection
	// DB接続と Repository（GORM）
	gormDB, err := db.NewDBFromEnv()
	if err != nil {
		logging.L.Error("failed to connect to DB", "error", err)
		return
	}

	// DB接続のクリーンアップ処理を登録
	sqlDB, err := gormDB.DB()
	if err == nil {
		defer func() {
			if err := sqlDB.Close(); err != nil {
				logging.L.Error("failed to close database connection", "error", err)
			} else {
				logging.L.Info("database connection closed")
			}
		}()
	}

	postRepo := postgres.NewPostRepository(gormDB)
	userRepo := postgres.NewUserRepository(gormDB)

	// Service層
	userService := services.NewUserService(userRepo, postRepo)
	postService := services.NewPostService(postRepo, userRepo)

	// Handler層
	userHandler := handlers.NewUserHandler(userService)
	postHandler := handlers.NewPostHandler(postService)

	// Swagger UI
	// Note: gin-swaggerは/swagger/index.htmlでのアクセスのみサポート
	// /swagger/でのリダイレクトは未サポート (関連Issue: https://github.com/swaggo/gin-swagger/issues/323)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, ginSwagger.URL("/swagger/doc.json")))
	logging.L.Info("swagger UI available", "url", "http://localhost:8080/swagger/index.html")

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
		api.GET("/posts", postHandler.GetAllPosts)
		api.GET("/posts/:id", postHandler.GetPost)
		api.POST("/posts", postHandler.CreatePost)
		api.POST("/posts/:id/like", postHandler.LikePost)
		api.POST("/posts/:id/unlike", postHandler.UnlikePost)

		// Users endpoints
		api.GET("/users", userHandler.GetAllUsers)
		api.GET("/users/:id", userHandler.GetUser)
		api.GET("/users/:id/posts", userHandler.GetUserPosts)
	}

	// サーバーを8080ポートで起動（graceful shutdown 対応）
	srv := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logging.L.Error("server error", "error", err)
		}
	}()

	// シグナル待ち（CTRL+C, SIGTERM）
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	logging.L.Info("shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logging.L.Error("server shutdown error", "error", err)
	}
	logging.L.Info("server exited, cleanup via defer")
}
