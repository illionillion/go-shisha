package postgres

import (
	"errors"
	"time"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"

	"gorm.io/gorm"
)

// UploadRepository はアップロードデータ操作を扱う
type UploadRepository struct {
	db *gorm.DB
}

// NewUploadRepository は新しいアップロードリポジトリを作成する
func NewUploadRepository(db *gorm.DB) *UploadRepository {
	return &UploadRepository{db: db}
}

// Create は新しいアップロードレコードを作成する
func (r *UploadRepository) Create(upload *models.UploadDB) error {
	return r.db.Create(upload).Error
}

// GetByID はIDでアップロードを取得する
func (r *UploadRepository) GetByID(id int) (*models.UploadDB, error) {
	var upload models.UploadDB
	err := r.db.Where("id = ?", id).First(&upload).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, repositories.ErrUploadNotFound
		}
		return nil, err
	}
	return &upload, nil
}

// GetByFilePath はファイルパスでアップロードを取得する
func (r *UploadRepository) GetByFilePath(filePath string) (*models.UploadDB, error) {
	var upload models.UploadDB
	err := r.db.Where("file_path = ?", filePath).First(&upload).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, repositories.ErrUploadNotFound
		}
		return nil, err
	}
	return &upload, nil
}

// GetByUserID はユーザーIDで全アップロードを取得する
func (r *UploadRepository) GetByUserID(userID int) ([]models.UploadDB, error) {
	var uploads []models.UploadDB
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&uploads).Error
	return uploads, err
}

// UpdateStatus はアップロードのステータスを更新する
func (r *UploadRepository) UpdateStatus(id int, status string) error {
	now := time.Now()
	updates := map[string]interface{}{
		"status": status,
	}

	// statusが"used"の場合、used_atも更新
	if status == "used" {
		updates["used_at"] = now
	}

	result := r.db.Model(&models.UploadDB{}).Where("id = ?", id).Updates(updates)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return repositories.ErrUploadNotFound
	}
	return nil
}

// MarkAsUsed はアップロードを使用済みにマークする（便利メソッド）
func (r *UploadRepository) MarkAsUsed(filePath string) error {
	return r.MarkAsUsedByPath(filePath)
}

// MarkAsUsedByPath は file_path を条件に直接アップロードを使用済みにマークする
// N+1問題を回避するため、GetByFilePath + UpdateStatus の2回のクエリではなく1回で更新
func (r *UploadRepository) MarkAsUsedByPath(filePath string) error {
	now := time.Now()

	result := r.db.Model(&models.UploadDB{}).
		Where("file_path = ?", filePath).
		Updates(map[string]interface{}{
			"status":  "used",
			"used_at": now,
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return repositories.ErrUploadNotFound
	}
	return nil
}

// DeleteUnusedOlderThan は指定期間より古い未使用アップロードを削除する
// これは将来的なクリーンアップバッチ処理で使用
func (r *UploadRepository) DeleteUnusedOlderThan(duration time.Duration) (int64, error) {
	threshold := time.Now().Add(-duration)
	result := r.db.Where("status = ? AND created_at < ?", "uploaded", threshold).Delete(&models.UploadDB{})
	return result.RowsAffected, result.Error
}
