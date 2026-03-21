package services

import (
	"errors"
	"fmt"
	"strings"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"
	"go-shisha-backend/pkg/logging"
)

var (
	ErrInvalidImagePath      = errors.New("不正な画像パス形式です")
	ErrImageNotAllowed       = errors.New("画像形式が許可されていません")
	ErrImageNotFound         = errors.New("画像が存在しません")
	ErrImagePermissionDenied = errors.New("画像を使用する権限がありません")
	ErrImageDeleted          = errors.New("削除された画像は使用できません")
)

// PostService は投稿関連のビジネスロジックを処理する
type PostService struct {
	postRepo   repositories.PostRepository
	userRepo   repositories.UserRepository
	flavorRepo repositories.FlavorRepository
	uploadRepo repositories.UploadRepository
}

// NewPostService は新しいPostServiceを作成する
func NewPostService(postRepo repositories.PostRepository, userRepo repositories.UserRepository, flavorRepo repositories.FlavorRepository, uploadRepo repositories.UploadRepository) *PostService {
	return &PostService{
		postRepo:   postRepo,
		userRepo:   userRepo,
		flavorRepo: flavorRepo,
		uploadRepo: uploadRepo,
	}
}

// GetAllPosts はすべての投稿を取得する
// userIDが指定されている場合、各投稿のいいね状態（is_liked）を含めて返す
func (s *PostService) GetAllPosts(userID *int) ([]models.Post, error) {
	return s.postRepo.GetAll(userID)
}

// GetPostByID は指定IDの投稿を取得する
// userIDが指定されている場合、いいね状態（is_liked）を含めて返す
func (s *PostService) GetPostByID(id int, userID *int) (*models.Post, error) {
	return s.postRepo.GetByID(id, userID)
}

// CreatePost は新しい投稿を作成する
func (s *PostService) CreatePost(userID int, input *models.CreatePostInput) (*models.Post, error) {
	// Verify user exists and get user information
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		// ユーザーが見つからない場合はsentinel errorをそのまま返す
		if errors.Is(err, repositories.ErrUserNotFound) {
			return nil, repositories.ErrUserNotFound
		}
		return nil, err
	}

	// Convert SlideInput to Slide
	slides := make([]models.Slide, len(input.Slides))
	for i, slideInput := range input.Slides {
		// 画像URLの検証
		if err := s.validateImageURL(userID, slideInput.ImageURL); err != nil {
			logging.L.Warn("画像URL検証失敗",
				"user_id", userID,
				"image_url", slideInput.ImageURL,
				"error", err)
			return nil, err
		}

		slide := models.Slide{
			ImageURL: slideInput.ImageURL,
			Text:     slideInput.Text,
		}
		// flavor_idが指定されている場合はフレーバー情報を取得
		if slideInput.FlavorID != nil {
			flavor, err := s.flavorRepo.GetByID(*slideInput.FlavorID)
			if err != nil {
				// フレーバーが見つからない場合でも投稿作成全体は失敗させない
				// エラーをログに記録し、フレーバーなしで続行する
				// 注意: 無効なflavor_idは静かに無視され、該当スライドのFlavorはnilになります
				logging.L.Warn("flavor not found for slide", "flavor_id", *slideInput.FlavorID, "error", err)
			} else {
				slide.Flavor = flavor
			}
		}
		slides[i] = slide
	}

	post := &models.Post{
		UserID: userID,
		Slides: slides,
		User:   *user,
	}

	err = s.postRepo.Create(post)
	if err != nil {
		return nil, err
	}

	// 使用した画像のステータスを"used"に更新
	// 設計方針: 投稿作成が優先。ステータス更新失敗してもログのみで処理継続
	// （画像の使い回しは許可、クリーンアップは別途バッチ処理で対応）
	for _, slide := range slides {
		if err := s.uploadRepo.MarkAsUsed(slide.ImageURL); err != nil {
			logging.L.Warn("画像ステータス更新失敗（投稿作成は成功）",
				"post_id", post.ID,
				"image_url", slide.ImageURL,
				"error", err)
			// 投稿作成は成功として扱うため、処理を継続
			continue
		}
	}

	return post, nil
}

// validateImageURL 画像URLの検証（セキュリティ対策）
func (s *PostService) validateImageURL(userID int, imageURL string) error {
	// 1. パストラバーサル対策
	if strings.Contains(imageURL, "..") {
		return fmt.Errorf("%w: %s", ErrInvalidImagePath, imageURL)
	}

	// 2. 許可されたプレフィックスのチェック
	if !strings.HasPrefix(imageURL, "/images/") {
		return fmt.Errorf("%w: %s", ErrImageNotAllowed, imageURL)
	}

	// 3. DBでアップロード記録を確認
	upload, err := s.uploadRepo.GetByFilePath(imageURL)
	if err != nil {
		if errors.Is(err, repositories.ErrUploadNotFound) {
			return fmt.Errorf("%w: %s", ErrImageNotFound, imageURL)
		}
		return fmt.Errorf("画像情報の取得に失敗しました: %w", err)
	}

	// 4. アップロードしたユーザーと投稿者が同じか確認
	if upload.UserID != userID {
		logging.L.Warn("他人の画像を使用しようとした",
			"post_user_id", userID,
			"upload_user_id", upload.UserID,
			"image_url", imageURL)
		return ErrImagePermissionDenied
	}

	// 5. 既に削除済みでないか確認
	if upload.Status == "deleted" {
		return fmt.Errorf("%w: %s", ErrImageDeleted, imageURL)
	}

	return nil
}

// LikePost は指定された投稿にいいねを追加する
// ユーザーIDと投稿IDを受け取り、AddLikeでDB登録後に最新データを返す
func (s *PostService) LikePost(userID, postID int) (*models.Post, error) {
	if err := s.postRepo.AddLike(userID, postID); err != nil {
		return nil, err
	}
	return s.postRepo.GetByID(postID, &userID)
}

// UnlikePost は指定された投稿のいいねを取り消す
// ユーザーIDと投稿IDを受け取り、RemoveLikeでDB削除後に最新データを返す
func (s *PostService) UnlikePost(userID, postID int) (*models.Post, error) {
	if err := s.postRepo.RemoveLike(userID, postID); err != nil {
		return nil, err
	}
	return s.postRepo.GetByID(postID, &userID)
}

// DeletePost は指定された投稿を論理削除する
// 投稿が存在しない場合は repositories.ErrPostNotFound を返す
// 投稿の所有者でない場合は repositories.ErrForbidden を返す
func (s *PostService) DeletePost(userID, postID int) error {
	return s.postRepo.DeletePost(userID, postID)
}

// UpdatePost は指定された投稿のスライドの text/flavor_id を更新する
// 投稿が存在しない場合は repositories.ErrPostNotFound を返す
// 投稿の所有者でない場合は repositories.ErrForbidden を返す
// スライド枚数が既存と一致しない場合は repositories.ErrSlideCountMismatch を返す
// スライドIDが重複している場合は repositories.ErrDuplicateSlideID を返す
// スライドIDが投稿に紐づかない場合は repositories.ErrSlideNotBelongToPost を返す
func (s *PostService) UpdatePost(userID, postID int, input *models.UpdatePostInput) (*models.Post, error) {
	// 存在しない flavor_id によるFK違反を防ぐため事前に検証する
	// ErrFlavorNotFound の場合は警告ログを出して nil に落として続行する
	// DB障害等の予期しないエラーは更新処理自体を失敗させる
	for i := range input.Slides {
		slide := &input.Slides[i]
		if slide.FlavorID == nil {
			continue
		}
		if _, err := s.flavorRepo.GetByID(*slide.FlavorID); err != nil {
			if errors.Is(err, repositories.ErrFlavorNotFound) {
				// フレーバーが存在しない場合でも更新全体は失敗させない
				// 警告ログを出して flavor_id を nil に落として続行する
				logging.L.Warn("存在しないフレーバーIDが指定されたため無視します",
					"service", "PostService",
					"method", "UpdatePost",
					"post_id", postID,
					"user_id", userID,
					"flavor_id", *slide.FlavorID,
					"error", err)
				slide.FlavorID = nil
				continue
			}
			// DB障害等の予期しないエラーは更新処理自体を失敗させる
			logging.L.Error("フレーバー情報の取得に失敗しました",
				"service", "PostService",
				"method", "UpdatePost",
				"post_id", postID,
				"user_id", userID,
				"flavor_id", *slide.FlavorID,
				"error", err)
			return nil, err
		}
	}
	return s.postRepo.UpdatePost(userID, postID, input.Slides)
}
