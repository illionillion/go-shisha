package handlers

import (
	"errors"
	"net/http"
	"os"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/services"
	"go-shisha-backend/pkg/logging"

	"github.com/gin-gonic/gin"
)

// AuthHandler は認証関連のハンドラー
type AuthHandler struct {
	authService *services.AuthService
	isSecure    bool // Cookie Secureフラグ（本番環境でtrue）
}

// NewAuthHandler はAuthHandlerの新しいインスタンスを作成
func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	// APP_ENVがproductionの場合はSecure=true
	isSecure := os.Getenv("APP_ENV") == "production"
	return &AuthHandler{
		authService: authService,
		isSecure:    isSecure,
	}
}

// Register godoc
// @Summary ユーザー登録
// @Description 新しいユーザーを登録する
// @Tags auth
// @Accept json
// @Produce json
// @Param input body models.CreateUserInput true "ユーザー登録情報"
// @Success 201 {object} models.AuthResponse "登録成功"
// @Failure 400 {object} models.ErrorResponse "バリデーションエラー"
// @Failure 409 {object} models.ErrorResponse "メールアドレス重複"
// @Failure 500 {object} models.ErrorResponse "サーバーエラー"
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var input models.CreateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		logging.L.Warn("invalid request body",
			"handler", "AuthHandler",
			"method", "Register",
			"error", err)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	user, err := h.authService.Register(&input)
	if err != nil {
		// メールアドレス重複エラーの場合は 409 Conflict を返す
		if errors.Is(err, services.ErrEmailAlreadyExists) {
			logging.L.Warn("registration failed: email already exists",
				"handler", "AuthHandler",
				"method", "Register",
				"email", input.Email)
			c.JSON(http.StatusConflict, models.ErrorResponse{Error: "email already exists"})
			return
		}
		logging.L.Error("failed to register user",
			"handler", "AuthHandler",
			"method", "Register",
			"email", input.Email,
			"error", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, models.AuthResponse{User: *user})
}

// Login godoc
// @Summary ログイン
// @Description メールアドレスとパスワードでログインし、JWT（Cookie）を発行する
// @Tags auth
// @Accept json
// @Produce json
// @Param input body models.LoginInput true "ログイン情報"
// @Success 200 {object} models.AuthResponse "ログイン成功"
// @Failure 400 {object} models.ErrorResponse "バリデーションエラー"
// @Failure 401 {object} models.ErrorResponse "認証失敗"
// @Failure 500 {object} models.ErrorResponse "サーバーエラー"
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var input models.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		logging.L.Warn("invalid request body",
			"handler", "AuthHandler",
			"method", "Login",
			"error", err)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: err.Error()})
		return
	}

	user, accessToken, refreshToken, err := h.authService.Login(&input)
	if err != nil {
		logging.L.Warn("login failed",
			"handler", "AuthHandler",
			"method", "Login",
			"email", input.Email,
			"error", err)
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: err.Error()})
		return
	}

	// Access Token を Cookie に設定（15分有効）
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Path:     "/",
		MaxAge:   15 * 60,
		Secure:   h.isSecure, // 本番環境（APP_ENV=production）でtrue
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode, // CSRF対策
	})

	// Refresh Token を Cookie に設定（7日有効）
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/",
		MaxAge:   7 * 24 * 60 * 60,
		Secure:   h.isSecure, // 本番環境（APP_ENV=production）でtrue
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode, // CSRF対策
	})

	logging.L.Info("user logged in",
		"handler", "AuthHandler",
		"method", "Login",
		"user_id", user.ID)

	c.JSON(http.StatusOK, models.AuthResponse{User: *user})
}

// Refresh godoc
// @Summary アクセストークンのリフレッシュ
// @Description Refresh Tokenを使って新しいAccess Tokenを発行する
// @Tags auth
// @Produce json
// @Success 200 {object} map[string]string "リフレッシュ成功"
// @Failure 401 {object} models.ErrorResponse "認証失敗"
// @Failure 500 {object} models.ErrorResponse "サーバーエラー"
// @Router /auth/refresh [post]
func (h *AuthHandler) Refresh(c *gin.Context) {
	// Cookieから Refresh Token を取得
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil || refreshToken == "" {
		logging.L.Warn("no refresh token",
			"handler", "AuthHandler",
			"method", "Refresh")
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "refresh token required"})
		return
	}

	newAccessToken, err := h.authService.Refresh(refreshToken)
	if err != nil {
		logging.L.Warn("refresh failed",
			"handler", "AuthHandler",
			"method", "Refresh",
			"error", err)
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: err.Error()})
		return
	}

	// 新しい Access Token を Cookie に設定
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "access_token",
		Value:    newAccessToken,
		Path:     "/",
		MaxAge:   15 * 60,
		Secure:   h.isSecure, // 本番環境（APP_ENV=production）でtrue
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode, // CSRF対策
	})

	logging.L.Info("access token refreshed",
		"handler", "AuthHandler",
		"method", "Refresh")

	c.JSON(http.StatusOK, gin.H{"message": "token refreshed"})
}

// Logout godoc
// @Summary ログアウト
// @Description Cookieを削除し、Refresh Tokenを無効化する
// @Tags auth
// @Produce json
// @Success 200 {object} map[string]string "ログアウト成功"
// @Failure 401 {object} models.ErrorResponse "認証失敗"
// @Failure 500 {object} models.ErrorResponse "サーバーエラー"
// @Security BearerAuth
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	// ミドルウェアでセットされたuser_idを取得
	userID, exists := c.Get("user_id")
	if !exists {
		logging.L.Warn("user_id not found in context",
			"handler", "AuthHandler",
			"method", "Logout")
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "unauthorized"})
		return
	}

	if err := h.authService.Logout(int64(userID.(int))); err != nil {
		logging.L.Error("logout failed",
			"handler", "AuthHandler",
			"method", "Logout",
			"user_id", userID,
			"error", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: err.Error()})
		return
	}

	// Cookieを削除（MaxAge=-1で即座に削除）
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		Secure:   h.isSecure,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		Secure:   h.isSecure,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	logging.L.Info("user logged out",
		"handler", "AuthHandler",
		"method", "Logout",
		"user_id", userID)

	c.JSON(http.StatusOK, gin.H{"message": "logged out"})
}

// Me godoc
// @Summary 現在のユーザー情報取得
// @Description 認証されたユーザーの情報を取得する
// @Tags auth
// @Produce json
// @Success 200 {object} models.AuthResponse "ユーザー情報"
// @Failure 401 {object} models.ErrorResponse "認証失敗"
// @Failure 500 {object} models.ErrorResponse "サーバーエラー"
// @Security BearerAuth
// @Router /auth/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	// ミドルウェアでセットされたuser_idを取得
	userID, exists := c.Get("user_id")
	if !exists {
		logging.L.Warn("user_id not found in context",
			"handler", "AuthHandler",
			"method", "Me")
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "unauthorized"})
		return
	}

	user, err := h.authService.GetCurrentUser(int64(userID.(int)))
	if err != nil {
		logging.L.Error("failed to get current user",
			"handler", "AuthHandler",
			"method", "Me",
			"user_id", userID,
			"error", err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{User: *user})
}
