package repositories

import (
	"errors"

	"go-shisha-backend/internal/models"
)

var (
	// ErrAlreadyLiked は、ユーザーが既にいいねした投稿に再度いいねしようとしたときに返されるエラー
	ErrAlreadyLiked = errors.New("already liked")
	// ErrNotLiked は、ユーザーがまだいいねしていない投稿のいいねを取り消そうとしたときに返されるエラー
	ErrNotLiked = errors.New("not liked")
	// ErrPostNotFound は、対象の投稿が存在しない場合に返されるエラー
	ErrPostNotFound = errors.New("post not found")
	// ErrForbidden は、ユーザーに許可されていない操作を実行しようとしたときに返されるエラー
	ErrForbidden = errors.New("forbidden")
	// ErrSlideCountMismatch は、更新時のスライド枚数が既存と一致しない場合に返されるエラー
	ErrSlideCountMismatch = errors.New("slide count mismatch")
)

// PostRepository は投稿データアクセスのインターフェースを定義する
type PostRepository interface {
	// GetAll は、指定されたユーザーのいいね状態（userID が nil の場合は未ログインとして扱う）を含めて、すべての投稿を取得する
	GetAll(userID *int) ([]models.Post, error)

	// GetByID は、指定された ID の投稿を取得し、指定されたユーザーのいいね状態（userID が nil の場合は未ログインとして扱う）を含めて返す
	GetByID(id int, userID *int) (*models.Post, error)

	// GetByUserID は、指定されたユーザーの投稿一覧を取得し、カレントユーザーのいいね状態（currentUserID が nil の場合は未ログインとして扱う）を含めて返す
	GetByUserID(userID int, currentUserID *int) ([]models.Post, error)

	// Create は、新しい投稿を作成する
	Create(post *models.Post) error

	// IncrementLikes は、指定された投稿のいいね数をインクリメントする（#162 で削除予定）
	IncrementLikes(id int) (*models.Post, error)

	// DecrementLikes は、指定された投稿のいいね数をデクリメントする（#162 で削除予定）
	DecrementLikes(id int) (*models.Post, error)

	// AddLike は、userID による postID へのいいねを記録する
	// すでにいいね済みの場合は ErrAlreadyLiked を返す
	AddLike(userID, postID int) error

	// RemoveLike は、userID による postID へのいいねを削除する
	// まだいいねしていない場合は ErrNotLiked を返す
	RemoveLike(userID, postID int) error

	// HasLiked は、userID が postID にいいねしているかどうかを真偽値で返す
	HasLiked(userID, postID int) (bool, error)

	// DeletePost は、指定された postID の投稿をソフトデリートする
	// 投稿が存在しない、またはすでに削除されている場合は ErrPostNotFound を返す
	// 投稿が userID に紐づかない場合は ErrForbidden を返す
	DeletePost(userID, postID int) error

	// UpdatePost は、指定された postID のスライドの text/flavor_id を更新する
	// 投稿が存在しない場合は ErrPostNotFound を返す
	// 投稿が userID に紐づかない場合は ErrForbidden を返す
	// スライド枚数が既存と一致しない場合は ErrSlideCountMismatch を返す
	UpdatePost(userID, postID int, slides []models.UpdateSlideInput) (*models.Post, error)
}
