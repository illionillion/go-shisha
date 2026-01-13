package models

import "time"

// RefreshToken represents a refresh token in the database
type RefreshToken struct {
	ID         int64      `json:"id" gorm:"primaryKey"`
	UserID     int64      `json:"user_id" gorm:"not null;index"`
	TokenHash  string     `json:"-" gorm:"uniqueIndex;not null"` // ハッシュ化されたトークン（JSON出力しない）
	ExpiresAt  time.Time  `json:"expires_at" gorm:"not null;index"`
	CreatedAt  time.Time  `json:"created_at" gorm:"not null;default:now()"`
	LastUsedAt *time.Time `json:"last_used_at"`
}

// TableName はテーブル名を指定
func (RefreshToken) TableName() string {
	return "refresh_tokens"
}
