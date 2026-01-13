package services

import (
	"errors"
	"fmt"
	"time"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"
	"go-shisha-backend/internal/repositories/postgres"
	"go-shisha-backend/pkg/auth"
	"go-shisha-backend/pkg/logging"

	"gorm.io/gorm"
)

// AuthService は認証サービスのインターフェース
type AuthService struct {
	userRepo         repositories.AuthUserRepository
	refreshTokenRepo postgres.RefreshTokenRepository
}

// NewAuthService はAuthServiceの新しいインスタンスを作成
func NewAuthService(userRepo repositories.AuthUserRepository, refreshTokenRepo postgres.RefreshTokenRepository) *AuthService {
	return &AuthService{
		userRepo:         userRepo,
		refreshTokenRepo: refreshTokenRepo,
	}
}

// Register は新しいユーザーを登録
func (s *AuthService) Register(input *models.CreateUserInput) (*models.User, error) {
	logging.L.Info("registering new user",
		"service", "AuthService",
		"method", "Register",
		"email", input.Email)

	// メールアドレスの重複チェック
	existingUser, _ := s.userRepo.GetByEmail(input.Email)
	if existingUser != nil {
		logging.L.Warn("email already exists",
			"service", "AuthService",
			"method", "Register",
			"email", input.Email)
		return nil, errors.New("email already exists")
	}

	// ユーザーの作成
	user := &models.User{
		Email:       input.Email,
		DisplayName: input.DisplayName,
	}

	// パスワードをハッシュ化
	if err := user.HashPassword(input.Password); err != nil {
		logging.L.Error("failed to hash password",
			"service", "AuthService",
			"method", "Register",
			"error", err)
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// DBに保存
	if err := s.userRepo.Create(user); err != nil {
		logging.L.Error("failed to create user",
			"service", "AuthService",
			"method", "Register",
			"email", input.Email,
			"error", err)
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	logging.L.Info("user registered successfully",
		"service", "AuthService",
		"method", "Register",
		"user_id", user.ID,
		"email", user.Email)

	return user, nil
}

// Login はユーザーのログイン処理を行い、トークンを生成
func (s *AuthService) Login(input *models.LoginInput) (*models.User, string, string, error) {
	logging.L.Info("user login attempt",
		"service", "AuthService",
		"method", "Login",
		"email", input.Email)

	// ユーザーを検索
	user, err := s.userRepo.GetByEmail(input.Email)
	if err != nil {
		logging.L.Warn("user not found",
			"service", "AuthService",
			"method", "Login",
			"email", input.Email)
		return nil, "", "", errors.New("invalid email or password")
	}

	// パスワードを検証
	if err := user.CheckPassword(input.Password); err != nil {
		logging.L.Warn("invalid password",
			"service", "AuthService",
			"method", "Login",
			"user_id", user.ID)
		return nil, "", "", errors.New("invalid email or password")
	}

	// Access Tokenを生成
	accessToken, err := auth.GenerateAccessToken(int64(user.ID))
	if err != nil {
		logging.L.Error("failed to generate access token",
			"service", "AuthService",
			"method", "Login",
			"user_id", user.ID,
			"error", err)
		return nil, "", "", fmt.Errorf("failed to generate access token: %w", err)
	}

	// Refresh Tokenを生成
	refreshToken, err := auth.GenerateRefreshToken(int64(user.ID))
	if err != nil {
		logging.L.Error("failed to generate refresh token",
			"service", "AuthService",
			"method", "Login",
			"user_id", user.ID,
			"error", err)
		return nil, "", "", fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Refresh TokenをDBに保存
	tokenModel := &models.RefreshToken{
		UserID:    int64(user.ID),
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	}
	if err := s.refreshTokenRepo.Create(tokenModel, refreshToken); err != nil {
		logging.L.Error("failed to save refresh token",
			"service", "AuthService",
			"method", "Login",
			"user_id", user.ID,
			"error", err)
		return nil, "", "", fmt.Errorf("failed to save refresh token: %w", err)
	}

	logging.L.Info("user logged in successfully",
		"service", "AuthService",
		"method", "Login",
		"user_id", user.ID)

	return user, accessToken, refreshToken, nil
}

// Refresh はRefresh Tokenを使ってAccess Tokenを再発行
func (s *AuthService) Refresh(refreshToken string) (string, error) {
	logging.L.Info("refreshing access token",
		"service", "AuthService",
		"method", "Refresh")

	// Refresh Tokenを検証
	claims, err := auth.ValidateToken(refreshToken)
	if err != nil {
		logging.L.Warn("invalid refresh token",
			"service", "AuthService",
			"method", "Refresh",
			"error", err)
		return "", errors.New("invalid refresh token")
	}

	// DBからRefresh Tokenを検索
	tokenModel, err := s.refreshTokenRepo.FindByTokenHash(refreshToken)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logging.L.Warn("refresh token not found in database",
				"service", "AuthService",
				"method", "Refresh")
			return "", errors.New("invalid refresh token")
		}
		logging.L.Error("failed to query refresh token",
			"service", "AuthService",
			"method", "Refresh",
			"error", err)
		return "", fmt.Errorf("failed to query refresh token: %w", err)
	}

	// 有効期限をチェック
	if tokenModel.ExpiresAt.Before(time.Now()) {
		logging.L.Warn("refresh token expired",
			"service", "AuthService",
			"method", "Refresh",
			"token_id", tokenModel.ID)
		return "", errors.New("refresh token expired")
	}

	// 新しいAccess Tokenを生成
	newAccessToken, err := auth.GenerateAccessToken(claims.UserID)
	if err != nil {
		logging.L.Error("failed to generate new access token",
			"service", "AuthService",
			"method", "Refresh",
			"user_id", claims.UserID,
			"error", err)
		return "", fmt.Errorf("failed to generate access token: %w", err)
	}

	// 最終使用時刻を更新
	if err := s.refreshTokenRepo.UpdateLastUsed(tokenModel.ID); err != nil {
		logging.L.Error("failed to update last_used_at",
			"service", "AuthService",
			"method", "Refresh",
			"token_id", tokenModel.ID,
			"error", err)
		// エラーでもAccess Tokenは返す（ログのみ）
	}

	logging.L.Info("access token refreshed",
		"service", "AuthService",
		"method", "Refresh",
		"user_id", claims.UserID)

	return newAccessToken, nil
}

// Logout はログアウト処理を行う（Refresh Tokenを削除）
func (s *AuthService) Logout(userID int64) error {
	logging.L.Info("user logout",
		"service", "AuthService",
		"method", "Logout",
		"user_id", userID)

	if err := s.refreshTokenRepo.DeleteByUserID(userID); err != nil {
		logging.L.Error("failed to delete refresh tokens",
			"service", "AuthService",
			"method", "Logout",
			"user_id", userID,
			"error", err)
		return fmt.Errorf("failed to logout: %w", err)
	}

	logging.L.Info("user logged out successfully",
		"service", "AuthService",
		"method", "Logout",
		"user_id", userID)

	return nil
}

// GetCurrentUser は現在のユーザー情報を取得
func (s *AuthService) GetCurrentUser(userID int) (*models.User, error) {
	logging.L.Debug("getting current user",
		"service", "AuthService",
		"method", "GetCurrentUser",
		"user_id", userID)

	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		logging.L.Error("failed to get user",
			"service", "AuthService",
			"method", "GetCurrentUser",
			"user_id", userID,
			"error", err)
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return user, nil
}
