package postgres

import (
	"errors"
	"log"

	"go-shisha-backend/internal/models"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) toDomain(um *userModel) models.User {
	if um == nil {
		return models.User{}
	}
	return models.User{
		ID:          int(um.ID),
		Email:       um.Email,
		DisplayName: um.DisplayName,
		Description: um.Description,
		IconURL:     um.IconURL,
		ExternalURL: um.ExternalURL,
	}
}

func (r *UserRepository) GetAll() ([]models.User, error) {
	log.Printf("[UserRepository] GetAll: querying users from DB")
	var ums []userModel
	if err := r.db.Order("id").Find(&ums).Error; err != nil {
		log.Printf("[UserRepository] GetAll: db error: %v", err)
		return nil, err
	}
	log.Printf("[UserRepository] GetAll: fetched %d rows", len(ums))
	var users []models.User
	for i := range ums {
		users = append(users, r.toDomain(&ums[i]))
	}
	return users, nil
}

func (r *UserRepository) GetByID(id int) (*models.User, error) {
	log.Printf("[UserRepository] GetByID: id=%d", id)
	var um userModel
	if err := r.db.First(&um, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("[UserRepository] GetByID: not found id=%d", id)
			return nil, errors.New("user not found")
		}
		log.Printf("[UserRepository] GetByID: db error id=%d error=%v", id, err)
		return nil, err
	}
	user := r.toDomain(&um)
	log.Printf("[UserRepository] GetByID: success id=%d", id)
	return &user, nil
}
