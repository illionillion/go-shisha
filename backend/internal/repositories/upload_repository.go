package repositories

import (
	"errors"
	"time"

	"go-shisha-backend/internal/models"
)

// UploadRepository はアップロードデータ操作のインターフェース
type UploadRepository interface {
	Create(upload *models.UploadDB) error
	GetByID(id int) (*models.UploadDB, error)
	GetByFilePath(filePath string) (*models.UploadDB, error)
	GetByUserID(userID int) ([]models.UploadDB, error)
	UpdateStatus(id int, status string) error
	MarkAsUsed(filePath string) error
	DeleteUnusedOlderThan(duration time.Duration) (int64, error)
	// ReplaceProfileImage はトランザクション内でプロフィール画像を原子的に置き換える。
	// 既存の未削除プロフィール画像レコードをFOR UPDATEでロックしてdeleted状態に更新し、
	// 新規レコードを作成する。削除した旧レコードのファイルパス一覧を返す。
	ReplaceProfileImage(newUpload *models.UploadDB) ([]string, error)
}

// ErrUploadNotFound はアップロードが見つからないエラー
var ErrUploadNotFound = errors.New("upload not found")

// ProfileImageURLPrefix はプロフィール画像のURLパスプレフィックス
const ProfileImageURLPrefix = "/images/profiles/"
