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
	"go-shisha-backend/internal/middleware"
	"go-shisha-backend/internal/repositories/postgres"
	"go-shisha-backend/internal/services"
	"go-shisha-backend/pkg/db"
	"go-shisha-backend/pkg/logging"
	"go-shisha-backend/pkg/validation"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/go-playground/validator/v10"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"golang.org/x/time/rate"
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
//
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

func main() {
	// Ginのデバッグモードを設定（本番環境ではgin.ReleaseMode）
	gin.SetMode(gin.DebugMode)

	// カスタムバリデータの登録
	if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
		if err := v.RegisterValidation("imageurl", validation.ValidateImageURL); err != nil {
			logging.L.Error("failed to register imageurl validation", "error", err)
		} else {
			logging.L.Info("custom validation registered", "name", "imageurl")
		}
	}

	r := gin.Default()

	// multipart/form-dataのメモリ制限（10MB/ファイル）
	r.MaxMultipartMemory = 10 << 20 // 10MB
	logging.L.Info("max multipart memory set", "size", "10MB")

	// CORS設定
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000" // デフォルト値
	}
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", frontendURL)
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")

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
	logging.L.Info("database connected successfully")

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
	refreshTokenRepo := postgres.NewRefreshTokenRepository(gormDB)
	flavorRepo := postgres.NewFlavorRepository(gormDB)

	// Service層
	userService := services.NewUserService(userRepo, postRepo)
	postService := services.NewPostService(postRepo, userRepo, flavorRepo)
	authService := services.NewAuthService(userRepo, refreshTokenRepo)
	uploadService := services.NewUploadService(logging.L)

	// Handler層
	userHandler := handlers.NewUserHandler(userService)
	postHandler := handlers.NewPostHandler(postService)
	authHandler := handlers.NewAuthHandler(authService)
	uploadHandler := handlers.NewUploadHandler(uploadService, logging.L)

	// レート制限ミドルウェア（認証エンドポイント用）
	// 1分間に5リクエストまで（12秒 × 5 = 60秒）、バースト5リクエスト
	authRateLimiter := middleware.NewIPRateLimiter(rate.Every(12*time.Second), 5)
	// 1時間ごとに古いIPエントリをクリーンアップ
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	authRateLimiter.CleanupOldIPs(ctx, 1*time.Hour)
	logging.L.Info("rate limiter initialized", "rate", "5 req/min", "burst", 5)

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

		// Auth endpoints (認証不要)
		auth := api.Group("/auth")
		{
			// レート制限を適用（ブルートフォース攻撃対策）
			auth.POST("/register", middleware.RateLimitMiddleware(authRateLimiter), authHandler.Register)
			auth.POST("/login", middleware.RateLimitMiddleware(authRateLimiter), authHandler.Login)
			auth.POST("/refresh", middleware.RateLimitMiddleware(authRateLimiter), authHandler.Refresh)
			auth.POST("/logout", middleware.AuthMiddleware(), authHandler.Logout)
			auth.GET("/me", middleware.AuthMiddleware(), authHandler.Me)
		}

		// Posts endpoints
		api.GET("/posts", postHandler.GetAllPosts)
		api.GET("/posts/:id", postHandler.GetPost)
		api.POST("/posts", middleware.AuthMiddleware(), postHandler.CreatePost)
		api.POST("/posts/:id/like", middleware.AuthMiddleware(), postHandler.LikePost)
		api.POST("/posts/:id/unlike", middleware.AuthMiddleware(), postHandler.UnlikePost)

		// Users endpoints
		api.GET("/users", userHandler.GetAllUsers)
		api.GET("/users/:id", userHandler.GetUser)
		api.GET("/users/:id/posts", userHandler.GetUserPosts)

		// Uploads endpoints (認証必須)
		uploads := api.Group("/uploads")
		{
			uploads.POST("/images", middleware.AuthMiddleware(), uploadHandler.UploadImages)
		}
	}

	// サーバーを8080ポートで起動（graceful shutdown 対応）
	srv := &http.Server{
		Addr:    ":8080",
		Handler: r,
	}

	logging.L.Info("server starting", "addr", srv.Addr)
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
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		logging.L.Error("server shutdown error", "error", err)
	}
	logging.L.Info("server exited, cleanup via defer")
}
