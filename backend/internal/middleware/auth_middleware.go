package middleware

import (
	"net/http"
	"strings"

	"go-shisha-backend/pkg/auth"
	"go-shisha-backend/pkg/logging"

	"github.com/gin-gonic/gin"
)

// extractAccessTokenFromRequest はCookieまたはAuthorization Headerからアクセストークンを取得する。
// Cookie("access_token")を優先し、存在しない場合はAuthorization: Bearer <token>を参照する。
func extractAccessTokenFromRequest(c *gin.Context) string {
	// 1. Cookieから "access_token" を取得
	cookie, err := c.Cookie("access_token")
	if err == nil && cookie != "" {
		return cookie
	}
	// 2. Authorization Headerから Bearer Tokenを取得
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
		return strings.TrimPrefix(authHeader, "Bearer ")
	}
	return ""
}

// AuthMiddleware はJWT認証を行うミドルウェア
// Cookie または Authorization Headerから Access Tokenを取得して検証
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := extractAccessTokenFromRequest(c)
		if tokenString == "" {
			logging.L.Warn("no access token provided",
				"middleware", "AuthMiddleware",
				"path", c.Request.URL.Path)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization required"})
			c.Abort()
			return
		}

		claims, err := auth.ValidateToken(tokenString)
		if err != nil {
			logging.L.Warn("invalid access token",
				"middleware", "AuthMiddleware",
				"path", c.Request.URL.Path,
				"error", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			c.Abort()
			return
		}

		c.Set("user_id", int(claims.UserID))
		logging.L.Debug("user authenticated",
			"middleware", "AuthMiddleware",
			"user_id", claims.UserID,
			"path", c.Request.URL.Path)

		c.Next()
	}
}

// OptionalAuthMiddleware はJWTがあれば検証してuser_idをコンテキストにセットする。
// トークンがない・無効でもリクエストを通過させる（認証必須ではない）。
func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := extractAccessTokenFromRequest(c)

		// トークンがない場合はそのまま通過
		if tokenString == "" {
			c.Next()
			return
		}

		// トークンを検証（無効でもエラーを返さずに通過）
		claims, err := auth.ValidateToken(tokenString)
		if err != nil {
			logging.L.Debug("optional auth: invalid token, proceeding without auth",
				"middleware", "OptionalAuthMiddleware",
				"path", c.Request.URL.Path)
			c.Next()
			return
		}

		c.Set("user_id", int(claims.UserID))
		logging.L.Debug("optional auth: user authenticated",
			"middleware", "OptionalAuthMiddleware",
			"user_id", claims.UserID,
			"path", c.Request.URL.Path)

		c.Next()
	}
}
