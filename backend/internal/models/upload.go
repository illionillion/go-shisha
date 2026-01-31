package models

import "time"

// UploadDB represents an upload record in the database
type UploadDB struct {
	ID           int       `gorm:"primaryKey;autoIncrement"`
	UserID       int       `gorm:"not null;index"`
	FilePath     string    `gorm:"not null;uniqueIndex"`
	OriginalName string    `gorm:"not null"`
	MimeType     string    `gorm:"not null"`
	FileSize     int64     `gorm:"not null"`
	Status       string    `gorm:"not null;default:'uploaded';index"` // uploaded / used / deleted
	CreatedAt    time.Time `gorm:"not null;autoCreateTime;index"`
	UsedAt       *time.Time
}

// TableName specifies the table name for UploadDB
func (UploadDB) TableName() string {
	return "uploads"
}

// UploadImagesResponse 画像アップロードレスポンス
type UploadImagesResponse struct {
	URLs []string `json:"urls" example:"/images/20260129_abc123.jpg,/images/20260129_def456.png"`
}
