package models

/**
 * Post represents a shisha post
 */
type Post struct {
	ID       int    `json:"id"`
	UserID   int    `json:"user_id"`
	Message  string `json:"message"`
	ImageURL string `json:"image_url"`
	Likes    int    `json:"likes"`
	User     User   `json:"user"`
}

/**
 * CreatePostInput represents input for creating a new post
 */
type CreatePostInput struct {
	UserID   int    `json:"user_id" binding:"required"`
	Message  string `json:"message" binding:"required,max=100"`
	ImageURL string `json:"image_url" binding:"required"`
}
