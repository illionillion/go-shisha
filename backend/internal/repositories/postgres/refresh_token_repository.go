package postgres

import (
	"crypto/sha256"
	"encoding/hex"
	"go-shisha-backend/internal/models"
	"go-shisha-backend/pkg/logging"
	"time"

	"gorm.io/gorm"
)

// RefreshTokenRepository はRefreshTokenのリポジトリインターフェース
type RefreshTokenRepository interface {
	Create(token *models.RefreshToken, rawToken string) error
	FindByTokenHash(tokenHash string) (*models.RefreshToken, error)
	UpdateLastUsed(id int64) error
	DeleteByUserID(userID int64) error
	DeleteExpired() error
}

type refreshTokenRepository struct {
	db *gorm.DB
}

// NewRefreshTokenRepository はRefreshTokenRepositoryの新しいインスタンスを作成
func NewRefreshTokenRepository(db *gorm.DB) RefreshTokenRepository {
	return &refreshTokenRepository{db: db}
}

// Create は新しいRefreshTokenを作成（トークンをSHA256でハッシュ化して保存）
func (r *refreshTokenRepository) Create(token *models.RefreshToken, rawToken string) error {
	// トークンをSHA256でハッシュ化
	hash := sha256.Sum256([]byte(rawToken))
	token.TokenHash = hex.EncodeToString(hash[:])

	if err := r.db.Create(token).Error; err != nil {
		logging.L.Error("failed to create refresh token",
			"repository", "RefreshTokenRepository",
			"method", "Create",
			"user_id", token.UserID,
			"error", err)
		return err
	}

	logging.L.Info("refresh token created",
		"repository", "RefreshTokenRepository",
		"method", "Create",
		"token_id", token.ID,
		"user_id", token.UserID)
	return nil
}

// FindByTokenHash はトークンハッシュでRefreshTokenを検索
func (r *refreshTokenRepository) FindByTokenHash(rawToken string) (*models.RefreshToken, error) {
	// トークンをSHA256でハッシュ化
	hash := sha256.Sum256([]byte(rawToken))
	tokenHash := hex.EncodeToString(hash[:])

	var token models.RefreshToken

	// ハッシュで検索 & 有効期限チェック
	if err := r.db.Where("token_hash = ? AND expires_at > ?", tokenHash, time.Now()).First(&token).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			logging.L.Debug("refresh token not found",
				"repository", "RefreshTokenRepository",
				"method", "FindByTokenHash")
			return nil, gorm.ErrRecordNotFound
		}
		logging.L.Error("failed to query refresh token",
			"repository", "RefreshTokenRepository",
			"method", "FindByTokenHash",
			"error", err)
		return nil, err
	}

	logging.L.Debug("refresh token found",
		"repository", "RefreshTokenRepository",
		"method", "FindByTokenHash",
		"token_id", token.ID)
	return &token, nil
}

// UpdateLastUsed はトークンの最終使用時刻を更新
func (r *refreshTokenRepository) UpdateLastUsed(id int64) error {
	now := time.Now()
	if err := r.db.Model(&models.RefreshToken{}).Where("id = ?", id).Update("last_used_at", now).Error; err != nil {
		logging.L.Error("failed to update refresh token last_used_at",
			"repository", "RefreshTokenRepository",
			"method", "UpdateLastUsed",
			"token_id", id,
			"error", err)
		return err
	}

	logging.L.Debug("refresh token last_used_at updated",
		"repository", "RefreshTokenRepository",
		"method", "UpdateLastUsed",
		"token_id", id)
	return nil
}

// DeleteByUserID はユーザーIDに紐づく全てのRefreshTokenを削除
func (r *refreshTokenRepository) DeleteByUserID(userID int64) error {
	if err := r.db.Where("user_id = ?", userID).Delete(&models.RefreshToken{}).Error; err != nil {
		logging.L.Error("failed to delete refresh tokens",
			"repository", "RefreshTokenRepository",
			"method", "DeleteByUserID",
			"user_id", userID,
			"error", err)
		return err
	}

	logging.L.Info("refresh tokens deleted",
		"repository", "RefreshTokenRepository",
		"method", "DeleteByUserID",
		"user_id", userID)
	return nil
}

// DeleteExpired は有効期限切れのRefreshTokenを削除
func (r *refreshTokenRepository) DeleteExpired() error {
	if err := r.db.Where("expires_at < ?", time.Now()).Delete(&models.RefreshToken{}).Error; err != nil {
		logging.L.Error("failed to delete expired refresh tokens",
			"repository", "RefreshTokenRepository",
			"method", "DeleteExpired",
			"error", err)
		return err
	}

	logging.L.Info("expired refresh tokens deleted",
		"repository", "RefreshTokenRepository",
		"method", "DeleteExpired")
	return nil
}
