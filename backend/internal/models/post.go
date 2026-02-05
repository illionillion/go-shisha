package models

import "time"

// SlideDB represents a slide record in the database
type SlideDB struct {
	ID         int       `gorm:"primaryKey;autoIncrement"`
	PostID     int       `gorm:"not null;index"`
	ImageURL   string    `gorm:"not null"`
	Text       string    `gorm:"type:text"`
	FlavorID   *int      `gorm:"index"`
	SlideOrder int       `gorm:"not null;default:0"`
	CreatedAt  time.Time `gorm:"not null;default:now()"`
}

// TableName specifies the table name for SlideDB
func (SlideDB) TableName() string {
	return "slides"
}

// Slide represents a single image + text + flavor in a post (API response)
type Slide struct {
	ImageURL string  `json:"image_url" binding:"required"`
	Text     string  `json:"text"`
	Flavor   *Flavor `json:"flavor,omitempty"`
}

// Post represents a shisha post
type Post struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Slides    []Slide   `json:"slides"`
	Likes     int       `json:"likes"`
	User      User      `json:"user"`
	CreatedAt time.Time `json:"created_at"`
	IsLiked   bool      `json:"is_liked,omitempty"`
}

// PostDB represents a post record in the database
type PostDB struct {
	ID        int       `gorm:"primaryKey;autoIncrement"`
	UserID    int       `gorm:"not null;index"`
	Likes     int       `gorm:"not null;default:0"`
	CreatedAt time.Time `gorm:"not null;default:now()"`
}

// TableName specifies the table name for PostDB
func (PostDB) TableName() string {
	return "posts"
}

// SlideInput represents the input for a single slide when creating a post
type SlideInput struct {
	ImageURL string `json:"image_url" binding:"required,imageurl"`
	Text     string `json:"text"`
	FlavorID *int   `json:"flavor_id"`
}

// CreatePostInput represents the input for creating a post
type CreatePostInput struct {
	Slides []SlideInput `json:"slides" binding:"required,min=1,max=10,dive"`
}

// PostsResponse represents the response for post list
type PostsResponse struct {
	Posts []Post `json:"posts"`
	Total int    `json:"total"`
}
