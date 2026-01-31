package repositories

import (
	"testing"
	"time"

	"go-shisha-backend/internal/models"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	assert.NoError(t, err)

	// マイグレーション
	err = db.AutoMigrate(&models.UploadDB{})
	assert.NoError(t, err)

	return db
}

func TestUploadRepository_Create(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUploadRepository(db)

	upload := &models.UploadDB{
		UserID:       1,
		FilePath:     "/images/test.jpg",
		OriginalName: "test.jpg",
		MimeType:     "image/jpeg",
		FileSize:     1024,
		Status:       "uploaded",
		CreatedAt:    time.Now(),
	}

	err := repo.Create(upload)
	assert.NoError(t, err)
	assert.NotZero(t, upload.ID)
}

func TestUploadRepository_GetByFilePath(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUploadRepository(db)

	// テストデータ作成
	upload := &models.UploadDB{
		UserID:       1,
		FilePath:     "/images/test.jpg",
		OriginalName: "test.jpg",
		MimeType:     "image/jpeg",
		FileSize:     1024,
		Status:       "uploaded",
		CreatedAt:    time.Now(),
	}
	err := repo.Create(upload)
	assert.NoError(t, err)

	// 取得
	found, err := repo.GetByFilePath("/images/test.jpg")
	assert.NoError(t, err)
	assert.Equal(t, upload.UserID, found.UserID)
	assert.Equal(t, upload.FilePath, found.FilePath)

	// 存在しないパス
	notFound, err := repo.GetByFilePath("/images/notfound.jpg")
	assert.Error(t, err)
	assert.Nil(t, notFound)
	assert.Equal(t, ErrUploadNotFound, err)
}

func TestUploadRepository_MarkAsUsed(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUploadRepository(db)

	// テストデータ作成
	upload := &models.UploadDB{
		UserID:       1,
		FilePath:     "/images/test.jpg",
		OriginalName: "test.jpg",
		MimeType:     "image/jpeg",
		FileSize:     1024,
		Status:       "uploaded",
		CreatedAt:    time.Now(),
	}
	err := repo.Create(upload)
	assert.NoError(t, err)

	// ステータスを"used"に変更
	err = repo.MarkAsUsed("/images/test.jpg")
	assert.NoError(t, err)

	// 確認
	found, err := repo.GetByFilePath("/images/test.jpg")
	assert.NoError(t, err)
	assert.Equal(t, "used", found.Status)
	assert.NotNil(t, found.UsedAt)
}

func TestUploadRepository_GetByUserID(t *testing.T) {
	db := setupTestDB(t)
	repo := NewUploadRepository(db)

	// 複数のテストデータ作成
	uploads := []models.UploadDB{
		{
			UserID:       1,
			FilePath:     "/images/test1.jpg",
			OriginalName: "test1.jpg",
			MimeType:     "image/jpeg",
			FileSize:     1024,
			Status:       "uploaded",
			CreatedAt:    time.Now(),
		},
		{
			UserID:       1,
			FilePath:     "/images/test2.jpg",
			OriginalName: "test2.jpg",
			MimeType:     "image/jpeg",
			FileSize:     2048,
			Status:       "uploaded",
			CreatedAt:    time.Now(),
		},
		{
			UserID:       2,
			FilePath:     "/images/test3.jpg",
			OriginalName: "test3.jpg",
			MimeType:     "image/jpeg",
			FileSize:     512,
			Status:       "uploaded",
			CreatedAt:    time.Now(),
		},
	}

	for i := range uploads {
		err := repo.Create(&uploads[i])
		assert.NoError(t, err)
	}

	// UserID=1のアップロードを取得
	userUploads, err := repo.GetByUserID(1)
	assert.NoError(t, err)
	assert.Len(t, userUploads, 2)

	// UserID=2のアップロードを取得
	user2Uploads, err := repo.GetByUserID(2)
	assert.NoError(t, err)
	assert.Len(t, user2Uploads, 1)
}
