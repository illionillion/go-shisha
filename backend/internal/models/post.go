package models

// Post represents a shisha post
type Post struct {
	ID        int     `json:"id"`
	UserID    int     `json:"user_id"`
	Message   string  `json:"message"`
	ImageURL  string  `json:"image_url"`
	Likes     int     `json:"likes"`
	User      User    `json:"user"`
	FlavorID  *int    `json:"flavor_id,omitempty"`
	Flavor    *Flavor `json:"flavor,omitempty"`
}

// CreatePostInput represents the input for creating a post
type CreatePostInput struct {
	UserID   int    `json:"user_id" binding:"required"`
	Message  string `json:"message" binding:"required,max=100"`
	ImageURL string `json:"image_url" binding:"required"`
}

// PostsResponse represents the response for post list
type PostsResponse struct {
	Posts []Post `json:"posts"`
	Total int    `json:"total"`
}
