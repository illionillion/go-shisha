package postgres

import (
	"errors"
	"fmt"
	"time"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/pkg/logging"

	"gorm.io/gorm"
)

type postModel struct {
	ID        int64        `gorm:"primaryKey;column:id"`
	UserID    int64        `gorm:"column:user_id"`
	FlavorID  *int64       `gorm:"column:flavor_id"`
	Content   string       `gorm:"column:content"`
	ImageURL  string       `gorm:"column:image_url"`
	Likes     int          `gorm:"column:likes"`
	CreatedAt time.Time    `gorm:"column:created_at"`
	User      *userModel   `gorm:"foreignKey:UserID"`
	Flavor    *flavorModel `gorm:"foreignKey:FlavorID"`
}

// TableName ensures GORM uses the existing `posts` table
func (postModel) TableName() string {
	return "posts"
}

type userModel struct {
	ID          int64  `gorm:"primaryKey;column:id"`
	Email       string `gorm:"column:email"`
	DisplayName string `gorm:"column:display_name"`
	Description string `gorm:"column:description"`
	IconURL     string `gorm:"column:icon_url"`
	ExternalURL string `gorm:"column:external_url"`
}

// TableName ensures GORM uses the existing `users` table
func (userModel) TableName() string {
	return "users"
}

type flavorModel struct {
	ID    int64  `gorm:"primaryKey;column:id"`
	Name  string `gorm:"column:name"`
	Color string `gorm:"column:color"`
}

// TableName ensures GORM uses the existing `flavors` table
func (flavorModel) TableName() string {
	return "flavors"
}

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
	logging.L.Printf("[PostRepository] GetAll: querying posts from DB")
	var pms []postModel
	if err := r.db.Preload("User").Preload("Flavor").Order("created_at desc").Find(&pms).Error; err != nil {
		logging.L.Printf("[PostRepository] GetAll: db error: %v", err)
		return nil, err
	}
	logging.L.Printf("[PostRepository] GetAll: fetched %d rows", len(pms))
	var posts []models.Post
	for i := range pms {
		posts = append(posts, r.toDomain(&pms[i]))
	}
	return posts, nil
}

func (r *PostRepository) GetByID(id int) (*models.Post, error) {
	logging.L.Printf("[PostRepository] GetByID: id=%d", id)
	var pm postModel
	if err := r.db.Preload("User").Preload("Flavor").First(&pm, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logging.L.Printf("[PostRepository] GetByID: not found id=%d", id)
			return nil, errors.New("post not found")
		}
		logging.L.Printf("[PostRepository] GetByID: db error id=%d error=%v", id, err)
		return nil, err
	}
	post := r.toDomain(&pm)
	logging.L.Printf("[PostRepository] GetByID: success id=%d", id)
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
	logging.L.Printf("[PostRepository] Create: creating post for user_id=%d", post.UserID)
	if err := r.db.Create(&pm).Error; err != nil {
		logging.L.Printf("[PostRepository] Create: db error: %v", err)
		return err
	}
	post.ID = int(pm.ID)
	post.CreatedAt = pm.CreatedAt
	logging.L.Printf("[PostRepository] Create: created id=%d", post.ID)
	return nil
}

func (r *PostRepository) IncrementLikes(id int) (*models.Post, error) {
	logging.L.Printf("[PostRepository] IncrementLikes: id=%d", id)
	if err := r.db.Model(&postModel{}).Where("id = ?", id).UpdateColumn("likes", gorm.Expr("likes + ?", 1)).Error; err != nil {
		logging.L.Printf("[PostRepository] IncrementLikes: db error id=%d err=%v", id, err)
		return nil, fmt.Errorf("failed to increment likes for post id=%d: %w", id, err)
	}
	return r.GetByID(id)
}

func (r *PostRepository) DecrementLikes(id int) (*models.Post, error) {
	logging.L.Printf("[PostRepository] DecrementLikes: id=%d", id)
	if err := r.db.Model(&postModel{}).Where("id = ?", id).UpdateColumn("likes", gorm.Expr("GREATEST(likes - 1, 0)")).Error; err != nil {
		logging.L.Printf("[PostRepository] DecrementLikes: db error id=%d err=%v", id, err)
		return nil, fmt.Errorf("failed to decrement likes for post id=%d: %w", id, err)
	}
	return r.GetByID(id)
}

func (r *PostRepository) GetByUserID(userID int) ([]models.Post, error) {
	logging.L.Printf("[PostRepository] GetByUserID: user_id=%d", userID)
	var pms []postModel
	if err := r.db.Preload("User").Preload("Flavor").Where("user_id = ?", userID).Order("created_at desc").Find(&pms).Error; err != nil {
		logging.L.Printf("[PostRepository] GetByUserID: db error user_id=%d err=%v", userID, err)
		return nil, err
	}
	logging.L.Printf("[PostRepository] GetByUserID: fetched %d rows for user_id=%d", len(pms), userID)
	var posts []models.Post
	for i := range pms {
		posts = append(posts, r.toDomain(&pms[i]))
	}
	return posts, nil
}
