package postgres

import (
	"errors"
	"fmt"

	"gorm.io/gorm"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/pkg/logging"
)

type PostRepository struct {
	db *gorm.DB
}

func NewPostRepository(db *gorm.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) toDomain(pm *postModel) models.Post {
	if pm == nil {
		return models.Post{}
	}

	var slides []models.Slide
	{
		slide := models.Slide{
			ImageURL: pm.ImageURL,
			Text:     pm.Content,
		}
		if pm.Flavor != nil {
			slide.Flavor = &models.Flavor{
				ID:    int(pm.Flavor.ID),
				Name:  pm.Flavor.Name,
				Color: pm.Flavor.Color,
			}
		}
		slides = append(slides, slide)
	}

	var user models.User
	if pm.User != nil {
		user = models.User{
			ID:          int(pm.User.ID),
			Email:       pm.User.Email,
			DisplayName: pm.User.DisplayName,
			Description: pm.User.Description,
			IconURL:     pm.User.IconURL,
			ExternalURL: pm.User.ExternalURL,
		}
	}

	return models.Post{
		ID:        int(pm.ID),
		UserID:    int(pm.UserID),
		Slides:    slides,
		Likes:     pm.Likes,
		User:      user,
		CreatedAt: pm.CreatedAt,
	}
}

func (r *PostRepository) GetAll() ([]models.Post, error) {
	logging.L.Debug("querying posts from DB", "repository", "PostRepository", "method", "GetAll")
	var pms []postModel
	if err := r.db.Preload("User").Preload("Flavor").Order("created_at desc").Find(&pms).Error; err != nil {
		logging.L.Error("failed to query posts", "repository", "PostRepository", "method", "GetAll", "error", err)
		return nil, fmt.Errorf("failed to query all posts: %w", err)
	}
	logging.L.Debug("fetched posts", "repository", "PostRepository", "method", "GetAll", "count", len(pms))
	var posts []models.Post
	for i := range pms {
		posts = append(posts, r.toDomain(&pms[i]))
	}
	return posts, nil
}

func (r *PostRepository) GetByID(id int) (*models.Post, error) {
	logging.L.Debug("querying post by ID", "repository", "PostRepository", "method", "GetByID", "post_id", id)
	var pm postModel
	if err := r.db.Preload("User").Preload("Flavor").First(&pm, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logging.L.Debug("post not found", "repository", "PostRepository", "method", "GetByID", "post_id", id)
			return nil, fmt.Errorf("post not found: id=%d", id)
		}
		logging.L.Error("failed to query post", "repository", "PostRepository", "method", "GetByID", "post_id", id, "error", err)
		return nil, fmt.Errorf("failed to query post by id=%d: %w", id, err)
	}
	post := r.toDomain(&pm)
	logging.L.Debug("post found", "repository", "PostRepository", "method", "GetByID", "post_id", id)
	return &post, nil
}

func (r *PostRepository) Create(post *models.Post) error {
	var content string
	var image string
	var flavorID *int64
	if len(post.Slides) > 0 {
		// join slide texts with newlines
		content = post.Slides[0].Text
		image = post.Slides[0].ImageURL
		if post.Slides[0].Flavor != nil {
			id := int64(post.Slides[0].Flavor.ID)
			flavorID = &id
		}
	}
	pm := postModel{
		UserID:   int64(post.UserID),
		FlavorID: flavorID,
		Content:  content,
		ImageURL: image,
		Likes:    post.Likes,
	}
	logging.L.Debug("creating post", "repository", "PostRepository", "method", "Create", "user_id", post.UserID)
	if err := r.db.Create(&pm).Error; err != nil {
		logging.L.Error("failed to create post", "repository", "PostRepository", "method", "Create", "user_id", post.UserID, "error", err)
		return fmt.Errorf("failed to create post for user_id=%d: %w", post.UserID, err)
	}
	post.ID = int(pm.ID)
	post.CreatedAt = pm.CreatedAt
	logging.L.Info("post created", "repository", "PostRepository", "method", "Create", "post_id", post.ID, "user_id", post.UserID)
	return nil
}

func (r *PostRepository) IncrementLikes(id int) (*models.Post, error) {
	logging.L.Debug("incrementing post likes", "repository", "PostRepository", "method", "IncrementLikes", "post_id", id)
	if err := r.db.Model(&postModel{}).Where("id = ?", id).UpdateColumn("likes", gorm.Expr("likes + ?", 1)).Error; err != nil {
		logging.L.Error("failed to increment likes", "repository", "PostRepository", "method", "IncrementLikes", "post_id", id, "error", err)
		return nil, fmt.Errorf("failed to increment likes for post id=%d: %w", id, err)
	}
	return r.GetByID(id)
}

func (r *PostRepository) DecrementLikes(id int) (*models.Post, error) {
	logging.L.Debug("decrementing post likes", "repository", "PostRepository", "method", "DecrementLikes", "post_id", id)
	if err := r.db.Model(&postModel{}).Where("id = ?", id).UpdateColumn("likes", gorm.Expr("GREATEST(likes - 1, 0)")).Error; err != nil {
		logging.L.Error("failed to decrement likes", "repository", "PostRepository", "method", "DecrementLikes", "post_id", id, "error", err)
		return nil, fmt.Errorf("failed to decrement likes for post id=%d: %w", id, err)
	}
	return r.GetByID(id)
}

func (r *PostRepository) GetByUserID(userID int) ([]models.Post, error) {
	logging.L.Debug("querying posts by user ID", "repository", "PostRepository", "method", "GetByUserID", "user_id", userID)
	var pms []postModel
	if err := r.db.Preload("User").Preload("Flavor").Where("user_id = ?", userID).Order("created_at desc").Find(&pms).Error; err != nil {
		logging.L.Error("failed to query posts by user", "repository", "PostRepository", "method", "GetByUserID", "user_id", userID, "error", err)
		return nil, fmt.Errorf("failed to query posts by user_id=%d: %w", userID, err)
	}
	logging.L.Debug("fetched posts for user", "repository", "PostRepository", "method", "GetByUserID", "user_id", userID, "count", len(pms))
	var posts []models.Post
	for i := range pms {
		posts = append(posts, r.toDomain(&pms[i]))
	}
	return posts, nil
}
