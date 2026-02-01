package models

import "time"

// UploadDB はアップロード記録のDBモデル
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

// TableName はUploadDBのテーブル名を返す
func (UploadDB) TableName() string {
	return "uploads"
}

// UploadImagesResponse 画像アップロードレスポンス
type UploadImagesResponse struct {
	URLs []string `json:"urls"`
}
