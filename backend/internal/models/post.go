package models

import "time"

// Post represents a shisha post
// Slide represents a single image + text + flavor in a post
type Slide struct {
	ImageURL string   `json:"image_url"`
	Text     string   `json:"text"`
	Flavor   *Flavor  `json:"flavor,omitempty"`
}

// Post represents a shisha post
type Post struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Message   string    `json:"message"`
	Slides    []Slide   `json:"slides"`
	Likes     int       `json:"likes"`
	User      User      `json:"user"`
	CreatedAt time.Time `json:"created_at"`
}

// CreatePostInput represents the input for creating a post
type CreatePostInput struct {
	UserID   int     `json:"user_id" binding:"required"`
	Message  string  `json:"message" binding:"required,max=100"`
	Slides   []Slide `json:"slides"`
}

// PostsResponse represents the response for post list
type PostsResponse struct {
	Posts []Post `json:"posts"`
	Total int    `json:"total"`
}
