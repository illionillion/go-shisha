package repositories

import (
	"go-shisha-backend/internal/models"
	"time"
)

// UploadRepository はアップロードデータ操作のインターフェース
type UploadRepository interface {
	Create(upload *models.UploadDB) error
	GetByID(id int) (*models.UploadDB, error)
	GetByFilePath(filePath string) (*models.UploadDB, error)
	GetByUserID(userID int) ([]models.UploadDB, error)
	UpdateStatus(id int, status string) error
	MarkAsUsed(filePath string) error
	DeleteUnusedOlderThan(duration time.Duration) (int64, error)
}
