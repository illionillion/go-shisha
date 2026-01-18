package middleware

import (
	"net/http"
	"strings"

	"go-shisha-backend/pkg/auth"
	"go-shisha-backend/pkg/logging"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware はJWT認証を行うミドルウェア
// Cookie または Authorization Headerから Access Tokenを取得して検証
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenString string

		// 1. Cookieから "access_token" を取得
		cookie, err := c.Cookie("access_token")
		if err == nil && cookie != "" {
			tokenString = cookie
			logging.L.Debug("access token found in cookie",
				"middleware", "AuthMiddleware",
				"path", c.Request.URL.Path)
		} else {
			// 2. Authorization Headerから Bearer Tokenを取得
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
				logging.L.Debug("access token found in authorization header",
					"middleware", "AuthMiddleware",
					"path", c.Request.URL.Path)
			}
		}

		// トークンが見つからない場合
		if tokenString == "" {
			logging.L.Warn("no access token provided",
				"middleware", "AuthMiddleware",
				"path", c.Request.URL.Path)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authorization required"})
			c.Abort()
			return
		}

		// トークンを検証
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

		// ユーザーIDをコンテキストに設定
		c.Set("user_id", int(claims.UserID))
		logging.L.Debug("user authenticated",
			"middleware", "AuthMiddleware",
			"user_id", claims.UserID,
			"path", c.Request.URL.Path)

		c.Next()
	}
}
