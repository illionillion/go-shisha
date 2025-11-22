package mock

import (
	"errors"
	"go-shisha-backend/internal/models"
)

/**
 * PostRepositoryMock is an in-memory mock implementation of PostRepository
 */
type PostRepositoryMock struct {
	posts   []models.Post
	nextID  int
	userRepo *UserRepositoryMock
}

/**
 * NewPostRepositoryMock creates a new mock post repository with sample data
 */
func NewPostRepositoryMock(userRepo *UserRepositoryMock) *PostRepositoryMock {
	users, _ := userRepo.GetAll()
	
	return &PostRepositoryMock{
		posts: []models.Post{
			{ID: 1, UserID: 1, Message: "今日のシーシャは最高でした！ミント系のフレーバーが爽やかで最高", ImageURL: "https://via.placeholder.com/400x600", Likes: 12, User: users[0]},
			{ID: 2, UserID: 2, Message: "新しいお店を発見！雰囲気も良くて味も抜群でした", ImageURL: "https://via.placeholder.com/400x600", Likes: 8, User: users[1]},
		},
		nextID:  3,
		userRepo: userRepo,
	}
}

/**
 * GetAll returns all posts
 */
func (r *PostRepositoryMock) GetAll() ([]models.Post, error) {
	return r.posts, nil
}

/**
 * GetByID returns a post by ID
 */
func (r *PostRepositoryMock) GetByID(id int) (*models.Post, error) {
	for i := range r.posts {
		if r.posts[i].ID == id {
			return &r.posts[i], nil
		}
	}
	return nil, errors.New("post not found")
}

/**
 * Create creates a new post
 */
func (r *PostRepositoryMock) Create(post *models.Post) error {
	// Get user information
	user, err := r.userRepo.GetByID(post.UserID)
	if err != nil {
		return errors.New("user not found")
	}
	
	post.ID = r.nextID
	post.User = *user
	post.Likes = 0
	
	r.posts = append(r.posts, *post)
	r.nextID++
	
	return nil
}

/**
 * IncrementLikes increments the like count for a post
 */
func (r *PostRepositoryMock) IncrementLikes(id int) (*models.Post, error) {
	for i := range r.posts {
		if r.posts[i].ID == id {
			r.posts[i].Likes++
			return &r.posts[i], nil
		}
	}
	return nil, errors.New("post not found")
}

/**
 * GetByUserID returns all posts by a specific user
 */
func (r *PostRepositoryMock) GetByUserID(userID int) ([]models.Post, error) {
	var userPosts []models.Post
	for _, post := range r.posts {
		if post.UserID == userID {
			userPosts = append(userPosts, post)
		}
	}
	return userPosts, nil
}
