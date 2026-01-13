package auth

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	// ErrInvalidToken はトークンが無効な場合のエラー
	ErrInvalidToken = errors.New("invalid token")
	// ErrExpiredToken はトークンが期限切れの場合のエラー
	ErrExpiredToken = errors.New("token has expired")
)

// Claims はJWTのクレーム情報を保持する構造体
type Claims struct {
	UserID int64 `json:"uid"`
	jwt.RegisteredClaims
}

// GenerateAccessToken はAccess Tokenを生成する（15分有効）
func GenerateAccessToken(userID int64) (string, error) {
	claims := Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := getJWTSecret()
	return token.SignedString([]byte(secret))
}

// GenerateRefreshToken はRefresh Tokenを生成する（7日有効）
func GenerateRefreshToken(userID int64) (string, error) {
	claims := Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := getJWTSecret()
	return token.SignedString([]byte(secret))
}

// ValidateToken はトークンを検証し、クレームを返す
func ValidateToken(tokenString string) (*Claims, error) {
	secret := getJWTSecret()

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		// 署名方法の検証
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return []byte(secret), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// getJWTSecret は環境変数からJWT_SECRETを取得する
func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		// デフォルト値（開発環境用、本番では必ず設定すること）
		return "default-secret-key-please-change-in-production"
	}
	return secret
}
