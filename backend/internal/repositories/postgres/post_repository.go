package postgres

import (
    "errors"
    "time"

    "go-shisha-backend/internal/models"

    "gorm.io/gorm"
)

type postModel struct {
    ID        int64      `gorm:"primaryKey;column:id"`
    UserID    int64      `gorm:"column:user_id"`
    FlavorID  *int64     `gorm:"column:flavor_id"`
    Content   string     `gorm:"column:content"`
    ImageURL  string     `gorm:"column:image_url"`
    Likes     int        `gorm:"column:likes"`
    CreatedAt time.Time  `gorm:"column:created_at"`
    User      *userModel `gorm:"foreignKey:UserID"`
    Flavor    *flavorModel `gorm:"foreignKey:FlavorID"`
}

type userModel struct {
    ID          int64  `gorm:"primaryKey;column:id"`
    Email       string `gorm:"column:email"`
    DisplayName string `gorm:"column:display_name"`
    Description string `gorm:"column:description"`
    IconURL     string `gorm:"column:icon_url"`
    ExternalURL string `gorm:"column:external_url"`
}

type flavorModel struct {
    ID    int64  `gorm:"primaryKey;column:id"`
    Name  string `gorm:"column:name"`
    Color string `gorm:"column:color"`
}

type PostRepository struct {
    db *gorm.DB
}

func NewPostRepository(db *gorm.DB) *PostRepository {
    return &PostRepository{db: db}
}

func (r *PostRepository) toDomain(pm *postModel) models.Post {
    var slides []models.Slide
    if pm != nil {
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
    if pm != nil && pm.User != nil {
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
    var pms []postModel
    if err := r.db.Preload("User").Preload("Flavor").Order("created_at desc").Find(&pms).Error; err != nil {
        return nil, err
    }
    var posts []models.Post
    for i := range pms {
        posts = append(posts, r.toDomain(&pms[i]))
    }
    return posts, nil
}

func (r *PostRepository) GetByID(id int) (*models.Post, error) {
    var pm postModel
    if err := r.db.Preload("User").Preload("Flavor").First(&pm, "id = ?", id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, errors.New("post not found")
        }
        return nil, err
    }
    post := r.toDomain(&pm)
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
    if err := r.db.Create(&pm).Error; err != nil {
        return err
    }
    post.ID = int(pm.ID)
    post.CreatedAt = pm.CreatedAt
    return nil
}

func (r *PostRepository) IncrementLikes(id int) (*models.Post, error) {
    if err := r.db.Model(&postModel{}).Where("id = ?", id).UpdateColumn("likes", gorm.Expr("likes + ?", 1)).Error; err != nil {
        return nil, err
    }
    return r.GetByID(id)
}

func (r *PostRepository) DecrementLikes(id int) (*models.Post, error) {
    if err := r.db.Exec("UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = ?", id).Error; err != nil {
        return nil, err
    }
    return r.GetByID(id)
}

func (r *PostRepository) GetByUserID(userID int) ([]models.Post, error) {
    var pms []postModel
    if err := r.db.Preload("User").Preload("Flavor").Where("user_id = ?", userID).Order("created_at desc").Find(&pms).Error; err != nil {
        return nil, err
    }
    var posts []models.Post
    for i := range pms {
        posts = append(posts, r.toDomain(&pms[i]))
    }
    return posts, nil
}
