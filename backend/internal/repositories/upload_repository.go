package repositories

import (
	"errors"
	"go-shisha-backend/internal/models"
	"time"

	"gorm.io/gorm"
)

var (
	// ErrUploadNotFound upload not found error
	ErrUploadNotFound = errors.New("upload not found")
)

// UploadRepository interface for upload data operations
type UploadRepository interface {
	Create(upload *models.UploadDB) error
	GetByID(id int) (*models.UploadDB, error)
	GetByFilePath(filePath string) (*models.UploadDB, error)
	GetByUserID(userID int) ([]models.UploadDB, error)
	UpdateStatus(id int, status string) error
	MarkAsUsed(filePath string) error
	DeleteUnusedOlderThan(duration time.Duration) (int64, error)
}

// uploadRepositoryImpl handles upload data operations
type uploadRepositoryImpl struct {
	db *gorm.DB
}

// NewUploadRepository creates a new upload repository
func NewUploadRepository(db *gorm.DB) UploadRepository {
	return &uploadRepositoryImpl{db: db}
}

// Create creates a new upload record
func (r *uploadRepositoryImpl) Create(upload *models.UploadDB) error {
	return r.db.Create(upload).Error
}

// GetByID retrieves an upload by ID
func (r *uploadRepositoryImpl) GetByID(id int) (*models.UploadDB, error) {
	var upload models.UploadDB
	err := r.db.Where("id = ?", id).First(&upload).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUploadNotFound
		}
		return nil, err
	}
	return &upload, nil
}

// GetByFilePath retrieves an upload by file path
func (r *uploadRepositoryImpl) GetByFilePath(filePath string) (*models.UploadDB, error) {
	var upload models.UploadDB
	err := r.db.Where("file_path = ?", filePath).First(&upload).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUploadNotFound
		}
		return nil, err
	}
	return &upload, nil
}

// GetByUserID retrieves all uploads by user ID
func (r *uploadRepositoryImpl) GetByUserID(userID int) ([]models.UploadDB, error) {
	var uploads []models.UploadDB
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&uploads).Error
	return uploads, err
}

// UpdateStatus updates the status of an upload
func (r *uploadRepositoryImpl) UpdateStatus(id int, status string) error {
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
		return ErrUploadNotFound
	}
	return nil
}

// MarkAsUsed marks an upload as used (convenience method)
func (r *uploadRepositoryImpl) MarkAsUsed(filePath string) error {
	upload, err := r.GetByFilePath(filePath)
	if err != nil {
		return err
	}
	return r.UpdateStatus(upload.ID, "used")
}

// DeleteUnusedOlderThan deletes unused uploads older than the given duration
// これは将来的なクリーンアップバッチ処理で使用
func (r *uploadRepositoryImpl) DeleteUnusedOlderThan(duration time.Duration) (int64, error) {
	threshold := time.Now().Add(-duration)
	result := r.db.Where("status = ? AND created_at < ?", "uploaded", threshold).Delete(&models.UploadDB{})
	return result.RowsAffected, result.Error
}
