package postgres

import (
	"errors"
	"fmt"

	"gorm.io/gorm"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"
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

	// Convert slides
	var slides []models.Slide
	for _, sm := range pm.Slides {
		slide := models.Slide{
			ImageURL: sm.ImageURL,
			Text:     sm.Text,
		}
		if sm.Flavor != nil {
			slide.Flavor = &models.Flavor{
				ID:    int(sm.Flavor.ID),
				Name:  sm.Flavor.Name,
				Color: sm.Flavor.Color,
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

func (r *PostRepository) GetAll(userID *int) ([]models.Post, error) {
	logging.L.Debug("querying posts from DB", "repository", "PostRepository", "method", "GetAll")
	var pms []postModel
	if err := r.db.Preload("User").Preload("Slides", func(db *gorm.DB) *gorm.DB {
		return db.Order("slides.slide_order ASC")
	}).Preload("Slides.Flavor").Order("created_at desc").Find(&pms).Error; err != nil {
		logging.L.Error("failed to query posts", "repository", "PostRepository", "method", "GetAll", "error", err)
		return nil, fmt.Errorf("failed to query all posts: %w", err)
	}
	logging.L.Debug("fetched posts", "repository", "PostRepository", "method", "GetAll", "count", len(pms))
	var posts []models.Post
	for i := range pms {
		post := r.toDomain(&pms[i])
		if userID != nil {
			liked, err := r.HasLiked(*userID, post.ID)
			if err != nil {
				logging.L.Error("failed to check like status in GetAll", "repository", "PostRepository", "method", "GetAll", "user_id", *userID, "post_id", post.ID, "error", err)
			} else {
				post.IsLiked = liked
			}
		}
		posts = append(posts, post)
	}
	return posts, nil
}

func (r *PostRepository) GetByID(id int, userID *int) (*models.Post, error) {
	logging.L.Debug("querying post by ID", "repository", "PostRepository", "method", "GetByID", "post_id", id)
	var pm postModel
	if err := r.db.Preload("User").Preload("Slides", func(db *gorm.DB) *gorm.DB {
		return db.Order("slides.slide_order ASC")
	}).Preload("Slides.Flavor").First(&pm, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logging.L.Debug("post not found", "repository", "PostRepository", "method", "GetByID", "post_id", id)
			return nil, repositories.ErrPostNotFound
		}
		logging.L.Error("failed to query post", "repository", "PostRepository", "method", "GetByID", "post_id", id, "error", err)
		return nil, fmt.Errorf("failed to query post by id=%d: %w", id, err)
	}
	post := r.toDomain(&pm)
	if userID != nil {
		liked, err := r.HasLiked(*userID, post.ID)
		if err == nil {
			post.IsLiked = liked
		}
	}
	logging.L.Debug("post found", "repository", "PostRepository", "method", "GetByID", "post_id", id)
	return &post, nil
}

func (r *PostRepository) Create(post *models.Post) error {
	logging.L.Debug("creating post", "repository", "PostRepository", "method", "Create", "user_id", post.UserID)

	// トランザクション内でpostとslidesを作成
	err := r.db.Transaction(func(tx *gorm.DB) error {
		// Postを作成
		pm := postModel{
			UserID: int64(post.UserID),
			Likes:  post.Likes,
		}
		if err := tx.Create(&pm).Error; err != nil {
			return fmt.Errorf("failed to create post: %w", err)
		}

		// Slidesを作成
		for i, slide := range post.Slides {
			sm := slideModel{
				PostID:     pm.ID,
				ImageURL:   slide.ImageURL,
				Text:       slide.Text,
				SlideOrder: i,
			}
			if slide.Flavor != nil {
				flavorID := int64(slide.Flavor.ID)
				sm.FlavorID = &flavorID
			}
			if err := tx.Create(&sm).Error; err != nil {
				return fmt.Errorf("failed to create slide %d: %w", i, err)
			}
		}

		post.ID = int(pm.ID)
		post.CreatedAt = pm.CreatedAt
		return nil
	})

	if err != nil {
		logging.L.Error("failed to create post", "repository", "PostRepository", "method", "Create", "user_id", post.UserID, "error", err)
		return err
	}

	logging.L.Info("post created", "repository", "PostRepository", "method", "Create", "post_id", post.ID, "user_id", post.UserID, "slides_count", len(post.Slides))
	return nil
}

func (r *PostRepository) IncrementLikes(id int) (*models.Post, error) {
	logging.L.Debug("incrementing post likes", "repository", "PostRepository", "method", "IncrementLikes", "post_id", id)
	if err := r.db.Model(&postModel{}).Where("id = ?", id).UpdateColumn("likes", gorm.Expr("likes + ?", 1)).Error; err != nil {
		logging.L.Error("failed to increment likes", "repository", "PostRepository", "method", "IncrementLikes", "post_id", id, "error", err)
		return nil, fmt.Errorf("failed to increment likes for post id=%d: %w", id, err)
	}
	return r.GetByID(id, nil)
}

func (r *PostRepository) DecrementLikes(id int) (*models.Post, error) {
	logging.L.Debug("decrementing post likes", "repository", "PostRepository", "method", "DecrementLikes", "post_id", id)
	if err := r.db.Model(&postModel{}).Where("id = ?", id).UpdateColumn("likes", gorm.Expr("GREATEST(likes - 1, 0)")).Error; err != nil {
		logging.L.Error("failed to decrement likes", "repository", "PostRepository", "method", "DecrementLikes", "post_id", id, "error", err)
		return nil, fmt.Errorf("failed to decrement likes for post id=%d: %w", id, err)
	}
	return r.GetByID(id, nil)
}

// HasLiked returns true if userID has liked postID.
func (r *PostRepository) HasLiked(userID, postID int) (bool, error) {
	var count int64
	if err := r.db.Model(&postLikeModel{}).Where("user_id = ? AND post_id = ?", userID, postID).Count(&count).Error; err != nil {
		logging.L.Error("failed to check like", "repository", "PostRepository", "method", "HasLiked", "user_id", userID, "post_id", postID, "error", err)
		return false, fmt.Errorf("failed to check like for user_id=%d post_id=%d: %w", userID, postID, err)
	}
	return count > 0, nil
}

// AddLike records a like by userID on postID.
// Returns ErrAlreadyLiked if the user has already liked the post.
func (r *PostRepository) AddLike(userID, postID int) error {
	logging.L.Debug("adding like", "repository", "PostRepository", "method", "AddLike", "user_id", userID, "post_id", postID)
	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&postLikeModel{UserID: int64(userID), PostID: int64(postID)}).Error; err != nil {
			if errors.Is(err, gorm.ErrDuplicatedKey) {
				return repositories.ErrAlreadyLiked
			}
			if errors.Is(err, gorm.ErrForeignKeyViolated) {
				// post_likes.user_id / post_likes.post_id の両方が外部キーのため、
				// FK違反時に post が本当に存在しないかを確認してから ErrPostNotFound を返す。
				var count int64
				if cerr := tx.Model(&postModel{}).Where("id = ?", postID).Count(&count).Error; cerr != nil {
					return fmt.Errorf("failed to check post existence after foreign key violation: %w", cerr)
				}
				if count == 0 {
					return repositories.ErrPostNotFound
				}
				// post が存在する場合は user 側のFK違反（ユーザー削除済み等）とみなす
				return repositories.ErrUserNotFound
			}
			return fmt.Errorf("failed to insert post_like: %w", err)
		}
		result := tx.Model(&postModel{}).Where("id = ?", postID).
			UpdateColumn("likes", gorm.Expr("likes + 1"))
		if result.Error != nil {
			return fmt.Errorf("failed to increment likes: %w", result.Error)
		}
		if result.RowsAffected == 0 {
			return repositories.ErrPostNotFound
		}
		return nil
	})
	if err != nil {
		if errors.Is(err, repositories.ErrAlreadyLiked) {
			logging.L.Debug("user already liked post", "repository", "PostRepository", "method", "AddLike", "user_id", userID, "post_id", postID)
			return repositories.ErrAlreadyLiked
		}
		if errors.Is(err, repositories.ErrPostNotFound) {
			logging.L.Debug("post not found for like", "repository", "PostRepository", "method", "AddLike", "post_id", postID)
			return repositories.ErrPostNotFound
		}
		if errors.Is(err, repositories.ErrUserNotFound) {
			logging.L.Debug("user not found for like (deleted?)", "repository", "PostRepository", "method", "AddLike", "user_id", userID)
			return repositories.ErrUserNotFound
		}
		logging.L.Error("failed to add like", "repository", "PostRepository", "method", "AddLike", "user_id", userID, "post_id", postID, "error", err)
		return err
	}
	logging.L.Info("like added", "repository", "PostRepository", "method", "AddLike", "user_id", userID, "post_id", postID)
	return nil
}

// RemoveLike は userID が指定した postID に付与したいいねを削除する
// ユーザーがその投稿にいいねしていない場合は ErrNotLiked を返す
func (r *PostRepository) RemoveLike(userID, postID int) error {
	logging.L.Debug("removing like", "repository", "PostRepository", "method", "RemoveLike", "user_id", userID, "post_id", postID)
	err := r.db.Transaction(func(tx *gorm.DB) error {
		result := tx.Where("user_id = ? AND post_id = ?", userID, postID).Delete(&postLikeModel{})
		if result.Error != nil {
			return fmt.Errorf("failed to delete post_like: %w", result.Error)
		}
		if result.RowsAffected == 0 {
			return repositories.ErrNotLiked
		}
		if err := tx.Model(&postModel{}).Where("id = ?", postID).
			UpdateColumn("likes", gorm.Expr("CASE WHEN likes > 0 THEN likes - 1 ELSE 0 END")).Error; err != nil {
			return fmt.Errorf("failed to decrement likes: %w", err)
		}
		return nil
	})
	if err != nil {
		if errors.Is(err, repositories.ErrNotLiked) {
			logging.L.Debug("user has not liked post", "repository", "PostRepository", "method", "RemoveLike", "user_id", userID, "post_id", postID)
			return repositories.ErrNotLiked
		}
		logging.L.Error("failed to remove like", "repository", "PostRepository", "method", "RemoveLike", "user_id", userID, "post_id", postID, "error", err)
		return err
	}
	logging.L.Info("like removed", "repository", "PostRepository", "method", "RemoveLike", "user_id", userID, "post_id", postID)
	return nil
}

// DeletePost は postID を指定して投稿を論理削除する
// 投稿が存在しない、またはすでに削除済みの場合は ErrPostNotFound を返す
// 投稿が userID に紐づかない場合は ErrForbidden を返す
func (r *PostRepository) DeletePost(userID, postID int) error {
	logging.L.Debug("soft-deleting post", "repository", "PostRepository", "method", "DeletePost", "post_id", postID, "user_id", userID)

	// まず投稿の存在を確認する
	var pm postModel
	if err := r.db.First(&pm, "id = ?", postID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logging.L.Debug("post not found for deletion", "repository", "PostRepository", "method", "DeletePost", "post_id", postID)
			return repositories.ErrPostNotFound
		}
		logging.L.Error("failed to find post for deletion", "repository", "PostRepository", "method", "DeletePost", "post_id", postID, "error", err)
		return fmt.Errorf("failed to find post id=%d: %w", postID, err)
	}

	// 所有権チェック
	if int(pm.UserID) != userID {
		logging.L.Debug("user does not own post", "repository", "PostRepository", "method", "DeletePost", "post_id", postID, "user_id", userID, "owner_id", pm.UserID)
		return repositories.ErrForbidden
	}

	// 論理削除
	result := r.db.Delete(&pm)
	if result.Error != nil {
		logging.L.Error("failed to soft-delete post", "repository", "PostRepository", "method", "DeletePost", "post_id", postID, "error", result.Error)
		return fmt.Errorf("failed to delete post id=%d: %w", postID, result.Error)
	}
	if result.RowsAffected == 0 {
		logging.L.Debug("post already deleted or not found", "repository", "PostRepository", "method", "DeletePost", "post_id", postID)
		return repositories.ErrPostNotFound
	}

	logging.L.Info("post soft-deleted", "repository", "PostRepository", "method", "DeletePost", "post_id", postID, "user_id", userID)
	return nil
}

// UpdatePost は postID を指定して投稿のスライドの text/flavor_id を更新する
// 投稿が存在しない場合は ErrPostNotFound を返す
// 投稿が userID に紐づかない場合は ErrForbidden を返す
// スライド枚数が既存と一致しない場合は ErrSlideCountMismatch を返す
// 入力スライドIDが重複している場合は ErrDuplicateSlideID を返す
// 入力スライドIDが対象投稿に属さない場合は ErrSlideNotBelongToPost を返す
func (r *PostRepository) UpdatePost(userID, postID int, slides []models.UpdateSlideInput) (*models.Post, error) {
	logging.L.Debug("updating post slides", "repository", "PostRepository", "method", "UpdatePost", "post_id", postID, "user_id", userID)

	// まず投稿の存在を確認する
	var pm postModel
	if err := r.db.First(&pm, "id = ?", postID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			logging.L.Debug("post not found for update", "repository", "PostRepository", "method", "UpdatePost", "post_id", postID)
			return nil, repositories.ErrPostNotFound
		}
		logging.L.Error("failed to find post for update", "repository", "PostRepository", "method", "UpdatePost", "post_id", postID, "error", err)
		return nil, fmt.Errorf("failed to find post id=%d: %w", postID, err)
	}

	// 所有権チェック
	if int(pm.UserID) != userID {
		logging.L.Debug("user does not own post", "repository", "PostRepository", "method", "UpdatePost", "post_id", postID, "user_id", userID, "owner_id", pm.UserID)
		return nil, repositories.ErrForbidden
	}

	// 既存スライドを取得して枚数チェック
	var existingSlides []slideModel
	if err := r.db.Where("post_id = ?", postID).Order("slide_order ASC").Find(&existingSlides).Error; err != nil {
		logging.L.Error("failed to fetch slides for update", "repository", "PostRepository", "method", "UpdatePost", "post_id", postID, "error", err)
		return nil, fmt.Errorf("failed to fetch slides for post id=%d: %w", postID, err)
	}
	if len(existingSlides) != len(slides) {
		logging.L.Debug("slide count mismatch", "repository", "PostRepository", "method", "UpdatePost", "post_id", postID, "existing", len(existingSlides), "input", len(slides))
		return nil, repositories.ErrSlideCountMismatch
	}
	existingSlideByID := make(map[int64]slideModel, len(existingSlides))
	for i := range existingSlides {
		existingSlideByID[existingSlides[i].ID] = existingSlides[i]
	}

	// トランザクション内でスライドを更新する
	err := r.db.Transaction(func(tx *gorm.DB) error {
		seenSlideIDs := make(map[int64]struct{}, len(slides))
		for _, slide := range slides {
			slideID := int64(slide.ID)
			if _, duplicated := seenSlideIDs[slideID]; duplicated {
				return repositories.ErrDuplicateSlideID
			}
			seenSlideIDs[slideID] = struct{}{}

			sm, ok := existingSlideByID[slideID]
			if !ok {
				return repositories.ErrSlideNotBelongToPost
			}
			// slides.flavor_id は BIGINT のため *int64 に変換して渡す
			var flavorID *int64
			if slide.FlavorID != nil {
				v := int64(*slide.FlavorID)
				flavorID = &v
			}
			updates := map[string]interface{}{
				"text":      slide.Text,
				"flavor_id": flavorID,
			}
			if err := tx.Model(&slideModel{}).Where("id = ?", sm.ID).Updates(updates).Error; err != nil {
				return fmt.Errorf("failed to update slide id=%d: %w", sm.ID, err)
			}
		}
		return nil
	})
	if err != nil {
		if errors.Is(err, repositories.ErrDuplicateSlideID) {
			return nil, repositories.ErrDuplicateSlideID
		}
		if errors.Is(err, repositories.ErrSlideNotBelongToPost) {
			logging.L.Warn("slide does not belong to post", "repository", "PostRepository", "method", "UpdatePost", "post_id", postID, "user_id", userID, "error", err)
			return nil, repositories.ErrSlideNotBelongToPost
		}
		logging.L.Error("failed to update post slides", "repository", "PostRepository", "method", "UpdatePost", "post_id", postID, "error", err)
		return nil, err
	}

	logging.L.Info("post updated", "repository", "PostRepository", "method", "UpdatePost", "post_id", postID, "user_id", userID)
	return r.GetByID(postID, &userID)
}

func (r *PostRepository) GetByUserID(userID int, currentUserID *int) ([]models.Post, error) {
	logging.L.Debug("querying posts by user ID", "repository", "PostRepository", "method", "GetByUserID", "user_id", userID)
	var pms []postModel
	if err := r.db.Preload("User").Preload("Slides", func(db *gorm.DB) *gorm.DB {
		return db.Order("slides.slide_order ASC")
	}).Preload("Slides.Flavor").Where("user_id = ?", userID).Order("created_at desc").Find(&pms).Error; err != nil {
		logging.L.Error("failed to query posts by user", "repository", "PostRepository", "method", "GetByUserID", "user_id", userID, "error", err)
		return nil, fmt.Errorf("failed to query posts by user_id=%d: %w", userID, err)
	}
	logging.L.Debug("fetched posts for user", "repository", "PostRepository", "method", "GetByUserID", "user_id", userID, "count", len(pms))

	// N+1を避けるため、対象投稿のいいね状態を1クエリでまとめて取得する
	likedSet := map[int]bool{}
	if currentUserID != nil && len(pms) > 0 {
		postIDs := make([]int, 0, len(pms))
		for i := range pms {
			postIDs = append(postIDs, int(pms[i].ID))
		}
		var likes []postLikeModel
		if err := r.db.Where("user_id = ? AND post_id IN ?", *currentUserID, postIDs).Find(&likes).Error; err != nil {
			logging.L.Error("failed to fetch like statuses in GetByUserID", "repository", "PostRepository", "method", "GetByUserID", "user_id", *currentUserID, "error", err)
		} else {
			for _, l := range likes {
				likedSet[int(l.PostID)] = true
			}
		}
	}

	var posts []models.Post
	for i := range pms {
		post := r.toDomain(&pms[i])
		post.IsLiked = likedSet[post.ID]
		posts = append(posts, post)
	}
	return posts, nil
}
