package repositories

import (
	"errors"

	"go-shisha-backend/internal/models"
)

var (
	// ErrAlreadyLiked is returned when a user tries to like a post they have already liked
	ErrAlreadyLiked = errors.New("already liked")
	// ErrNotLiked is returned when a user tries to unlike a post they have not liked
	ErrNotLiked = errors.New("not liked")
	// ErrPostNotFound is returned when a post is not found
	ErrPostNotFound = errors.New("post not found")
	// ErrForbidden is returned when a user tries to perform an action they are not allowed to
	ErrForbidden = errors.New("forbidden")
)

/**
 * PostRepository defines the interface for post data access
 */
type PostRepository interface {
	// GetAll returns all posts with optional like status for the given user (nil = not logged in)
	GetAll(userID *int) ([]models.Post, error)

	// GetByID returns a post by ID with optional like status for the given user (nil = not logged in)
	GetByID(id int, userID *int) (*models.Post, error)

	// GetByUserID returns all posts by a specific user with optional like status for the given currentUser (nil = not logged in)
	GetByUserID(userID int, currentUserID *int) ([]models.Post, error)

	// Create creates a new post
	Create(post *models.Post) error

	// IncrementLikes increments the like count for a post (to be removed in #162)
	IncrementLikes(id int) (*models.Post, error)

	// DecrementLikes decrements the like count for a post (to be removed in #162)
	DecrementLikes(id int) (*models.Post, error)

	// AddLike records a like by userID on postID.
	// Returns ErrAlreadyLiked if the user has already liked the post.
	AddLike(userID, postID int) error

	// RemoveLike removes a like by userID on postID.
	// Returns ErrNotLiked if the user has not liked the post.
	RemoveLike(userID, postID int) error

	// HasLiked returns true if userID has liked postID.
	HasLiked(userID, postID int) (bool, error)

	// DeletePost soft-deletes a post by postID.
	// Returns ErrPostNotFound if the post does not exist or is already deleted.
	// Returns ErrForbidden if the post does not belong to userID.
	DeletePost(userID, postID int) error
}
