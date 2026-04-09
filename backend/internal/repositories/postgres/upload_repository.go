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

// MarkAsUsed はアップロードを使用済みにマークする
// N+1問題を回避するため、file_pathから直接1回のクエリで更新
func (r *UploadRepository) MarkAsUsed(filePath string) error {
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

// ReplaceProfileImage はトランザクション内でプロフィール画像を原子的に置き換える。
// pg_advisory_xact_lock でユーザー単位の排他ロックを取得してから既存レコードを deleted 状態に更新し、
// 新規レコードを作成する。advisory lock はトランザクション終了時に自動解放されるため
// 同一ユーザーの並列リクエストが0件→複数件 insert するケースも確実に排除できる。
// 削除された旧レコードのファイルパス一覧を返す（ディスク上のファイル削除は呼び出し元が行う）。
func (r *UploadRepository) ReplaceProfileImage(newUpload *models.UploadDB) ([]string, error) {
	var oldPaths []string
	err := r.db.Transaction(func(tx *gorm.DB) error {
		// ユーザー単位の advisory lock（トランザクション自動解放）。
		// FOR UPDATE と異なり既存行が0件でもロックが取得できるため、
		// 初回アップロードの並列リクエストでも「1枚のみ」が保証される。
		// pg_advisory_xact_lock は bigint (int64) を要求するため明示的にキャスト。
		if err := tx.Exec("SELECT pg_advisory_xact_lock(?)", int64(newUpload.UserID)).Error; err != nil {
			return err
		}

		// 既存プロフィール画像を検索（advisory lock で排他制御済みのため FOR UPDATE 不要）
		var existing []models.UploadDB
		if err := tx.Where("user_id = ? AND status != ? AND file_path LIKE ?",
			newUpload.UserID, "deleted", repositories.ProfileImageURLPrefix+"%").
			Find(&existing).Error; err != nil {
			return err
		}

		// 既存レコードを deleted 状態に更新
		if len(existing) > 0 {
			ids := make([]int, len(existing))
			for i, u := range existing {
				ids[i] = u.ID
				oldPaths = append(oldPaths, u.FilePath)
			}
			if err := tx.Model(&models.UploadDB{}).
				Where("id IN ?", ids).
				Update("status", "deleted").Error; err != nil {
				return err
			}
		}

		// 新規レコードを作成
		return tx.Create(newUpload).Error
	})
	if err != nil {
		return nil, err
	}
	return oldPaths, nil
}
