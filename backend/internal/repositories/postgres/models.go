package postgres

import (
	"time"

	"gorm.io/gorm"
)

// userModel represents the users table
type userModel struct {
	ID           int64  `gorm:"primaryKey;column:id"`
	Email        string `gorm:"column:email"`
	PasswordHash string `gorm:"column:password_hash"`
	DisplayName  string `gorm:"column:display_name"`
	Description  string `gorm:"column:description"`
	IconURL      string `gorm:"column:icon_url"`
	ExternalURL  string `gorm:"column:external_url"`
}

// TableName ensures GORM uses the existing `users` table
func (userModel) TableName() string {
	return "users"
}

// postModel represents the posts table
type postModel struct {
	ID        int64          `gorm:"primaryKey;column:id"`
	UserID    int64          `gorm:"column:user_id"`
	Likes     int            `gorm:"column:likes"`
	CreatedAt time.Time      `gorm:"column:created_at"`
	DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index"`
	User      *userModel     `gorm:"foreignKey:UserID"`
	Slides    []slideModel   `gorm:"foreignKey:PostID"`
}

// TableName ensures GORM uses the existing `posts` table
func (postModel) TableName() string {
	return "posts"
}

// slideModel represents the slides table
type slideModel struct {
	ID         int64        `gorm:"primaryKey;column:id"`
	PostID     int64        `gorm:"column:post_id"`
	ImageURL   string       `gorm:"column:image_url"`
	Text       string       `gorm:"column:text"`
	FlavorID   *int64       `gorm:"column:flavor_id"`
	SlideOrder int          `gorm:"column:slide_order"`
	CreatedAt  time.Time    `gorm:"column:created_at"`
	Flavor     *flavorModel `gorm:"foreignKey:FlavorID"`
}

// TableName ensures GORM uses the existing `slides` table
func (slideModel) TableName() string {
	return "slides"
}

// flavorModel represents the flavors table
type flavorModel struct {
	ID    int64  `gorm:"primaryKey;column:id"`
	Name  string `gorm:"column:name"`
	Color string `gorm:"column:color"`
}

// TableName ensures GORM uses the existing `flavors` table
func (flavorModel) TableName() string {
	return "flavors"
}

// postLikeModel represents the post_likes table (who liked which post)
type postLikeModel struct {
	UserID    int64     `gorm:"primaryKey;column:user_id"`
	PostID    int64     `gorm:"primaryKey;column:post_id"`
	CreatedAt time.Time `gorm:"column:created_at"`
}

// TableName ensures GORM uses the post_likes table
func (postLikeModel) TableName() string {
	return "post_likes"
}
