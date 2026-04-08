package services

import (
	"errors"
	"fmt"
	"io"
	"log/slog"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"

	"github.com/google/uuid"
)

// カスタムエラー型
var (
	ErrNoFiles          = errors.New("ファイルが指定されていません")
	ErrTooManyFiles     = errors.New("一度に10枚までアップロード可能です")
	ErrFileTooLarge     = errors.New("ファイルサイズが10MBを超えています")
	ErrInvalidFileType  = errors.New("サポートされていないファイル形式です")
	ErrInvalidExtension = errors.New("サポートされていない拡張子です")
)

// UploadService 画像アップロードサービス
type UploadService struct {
	uploadRepo repositories.UploadRepository
	logger     *slog.Logger
}

// NewUploadService UploadServiceのコンストラクタ
func NewUploadService(uploadRepo repositories.UploadRepository, logger *slog.Logger) *UploadService {
	return &UploadService{
		uploadRepo: uploadRepo,
		logger:     logger,
	}
}

// 許可する画像形式のMIMEタイプ（http.DetectContentTypeで検出される標準タイプのみ）
var allowedMimeTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/webp": true,
	"image/gif":  true,
}

// 定数定義
const (
	maxFileSize      = 10 * 1024 * 1024          // 最大ファイルサイズ（10MB）
	maxFiles         = 10                          // 最大ファイル数（スライド上限と一致）
	profileUploadDir = "public/images/profiles"   // プロフィール画像の保存先ディレクトリ
)

// savedFileResult saveImageFileの戻り値
type savedFileResult struct {
	uploadRecord models.UploadDB
	savePath     string
}

// saveImageFileToDisk 1ファイルのバリデーションとディスク保存を行い、DB登録前の状態を返す。
// DB登録は行わないため、呼び出し元が Create または ReplaceProfileImage を選択できる。
func (s *UploadService) saveImageFileToDisk(userID int, fileHeader *multipart.FileHeader, dir, urlPrefix string) (*savedFileResult, error) {
	// ファイルサイズチェック
	if fileHeader.Size > maxFileSize {
		s.logger.Warn("ファイルサイズ超過",
			"filename", fileHeader.Filename,
			"size", fileHeader.Size,
			"max", maxFileSize)
		return nil, fmt.Errorf("%w: %s", ErrFileTooLarge, fileHeader.Filename)
	}

	// ファイルを開く
	file, err := fileHeader.Open()
	if err != nil {
		s.logger.Error("ファイルオープン失敗", "error", err, "filename", fileHeader.Filename)
		return nil, fmt.Errorf("ファイルの読み込みに失敗しました")
	}
	defer func() { _ = file.Close() }()

	// MIMEタイプチェック（実データから検証）
	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		s.logger.Error("ファイル読み込み失敗", "error", err, "filename", fileHeader.Filename)
		return nil, fmt.Errorf("ファイルの読み込みに失敗しました")
	}
	detectedType := http.DetectContentType(buffer[:n])
	if !allowedMimeTypes[detectedType] {
		s.logger.Warn("不正なファイル形式",
			"filename", fileHeader.Filename,
			"detectedType", detectedType)
		return nil, fmt.Errorf("%w: %s (検出: %s)", ErrInvalidFileType, fileHeader.Filename, detectedType)
	}

	// ファイルポインタを先頭に戻す
	if _, err := file.Seek(0, 0); err != nil {
		s.logger.Error("ファイルシーク失敗", "error", err, "filename", fileHeader.Filename)
		return nil, fmt.Errorf("ファイルの読み込みに失敗しました")
	}

	// MIMEタイプから拡張子を決定（セキュリティ向上）
	ext := getExtensionFromMIME(detectedType)
	if ext == "" {
		s.logger.Warn("サポートされていないMIMEタイプ", "filename", fileHeader.Filename, "mimeType", detectedType)
		return nil, fmt.Errorf("%w: %s", ErrInvalidExtension, detectedType)
	}

	// 保存先ディレクトリの確保
	if err := os.MkdirAll(dir, 0755); err != nil {
		s.logger.Error("ディレクトリ作成失敗", "error", err, "path", dir)
		return nil, fmt.Errorf("ディレクトリの作成に失敗しました")
	}

	timestamp := time.Now().Format("20060102")
	filename := fmt.Sprintf("%s_%s.%s", timestamp, uuid.New().String(), ext)
	savePath := filepath.Join(dir, filename)

	// ファイル保存
	dst, err := os.Create(savePath)
	if err != nil {
		s.logger.Error("ファイル作成失敗", "error", err, "path", savePath)
		return nil, fmt.Errorf("ファイルの保存に失敗しました")
	}

	_, copyErr := io.Copy(dst, file)
	closeErr := dst.Close()

	if copyErr != nil {
		s.logger.Error("ファイル書き込み失敗", "error", copyErr, "path", savePath)
		if removeErr := os.Remove(savePath); removeErr != nil {
			s.logger.Warn("失敗ファイル削除エラー", "error", removeErr, "path", savePath)
		}
		return nil, fmt.Errorf("ファイルの保存に失敗しました")
	}
	if closeErr != nil {
		s.logger.Error("ファイルクローズ失敗", "error", closeErr, "path", savePath)
		if removeErr := os.Remove(savePath); removeErr != nil {
			s.logger.Warn("失敗ファイル削除エラー", "error", removeErr, "path", savePath)
		}
		return nil, fmt.Errorf("ファイルの保存に失敗しました")
	}

	// URLを生成
	url := urlPrefix + filename

	uploadRecord := models.UploadDB{
		UserID:       userID,
		FilePath:     url,
		OriginalName: fileHeader.Filename,
		MimeType:     detectedType,
		FileSize:     fileHeader.Size,
		Status:       "uploaded",
		CreatedAt:    time.Now(),
	}

	s.logger.Info("画像ディスク保存成功",
		"user_id", userID,
		"filename", fileHeader.Filename,
		"savedAs", filename,
		"size", fileHeader.Size)

	return &savedFileResult{uploadRecord: uploadRecord, savePath: savePath}, nil
}

// saveImageFile 1ファイルのバリデーション・保存・DB登録を行う内部ヘルパー
// dir にファイルを保存し、urlPrefix + ファイル名 をURLとして記録する
func (s *UploadService) saveImageFile(userID int, fileHeader *multipart.FileHeader, dir, urlPrefix string) (*savedFileResult, error) {
	result, err := s.saveImageFileToDisk(userID, fileHeader, dir, urlPrefix)
	if err != nil {
		return nil, err
	}

	// DB記録を作成・保存
	if err := s.uploadRepo.Create(&result.uploadRecord); err != nil {
		s.logger.Error("DB保存失敗", "error", err, "path", result.uploadRecord.FilePath)
		if removeErr := os.Remove(result.savePath); removeErr != nil {
			s.logger.Warn("失敗ファイル削除エラー", "error", removeErr, "path", result.savePath)
		}
		return nil, fmt.Errorf("画像情報の保存に失敗しました")
	}

	s.logger.Info("画像アップロード成功",
		"user_id", userID,
		"filename", fileHeader.Filename,
		"savedAs", filepath.Base(result.savePath),
		"size", fileHeader.Size)

	return result, nil
}

// UploadImages 複数の画像をアップロードする
func (s *UploadService) UploadImages(userID int, files []*multipart.FileHeader) ([]string, error) {
	if len(files) == 0 {
		s.logger.Warn("アップロードファイルが0件")
		return nil, ErrNoFiles
	}

	if len(files) > maxFiles {
		s.logger.Warn("ファイル数超過", "count", len(files), "max", maxFiles)
		return nil, ErrTooManyFiles
	}

	var urls []string
	var uploadRecords []models.UploadDB

	for _, fileHeader := range files {
		result, err := s.saveImageFile(userID, fileHeader, "public/images", "/images/")
		if err != nil {
			s.rollbackFiles(uploadRecords)
			return nil, err
		}
		uploadRecords = append(uploadRecords, result.uploadRecord)
		urls = append(urls, result.uploadRecord.FilePath)
	}

	return urls, nil
}

// rollbackFiles 保存に失敗した場合、既に保存したファイルを削除し、DB記録のstatusを'deleted'に更新する
func (s *UploadService) rollbackFiles(uploadRecords []models.UploadDB) {
	for _, record := range uploadRecords {
		// ファイル削除（先頭の"/"を除去してから結合）
		relativePath := strings.TrimPrefix(record.FilePath, "/")
		filePath := filepath.Join("public", relativePath)
		if err := os.Remove(filePath); err != nil {
			s.logger.Warn("ロールバック時ファイル削除失敗", "error", err, "path", filePath)
		}
		// DB記録のstatusを'deleted'に更新（PostServiceの検証で弾かれるようにする）
		if record.ID != 0 {
			if err := s.uploadRepo.UpdateStatus(record.ID, "deleted"); err != nil {
				s.logger.Warn("ロールバック時DB更新失敗", "error", err, "id", record.ID)
			}
		}
	}
}

// getExtensionFromMIME MIMEタイプから拡張子を決定（セキュリティ向上）
func getExtensionFromMIME(mimeType string) string {
	mimeToExt := map[string]string{
		"image/jpeg": "jpg",
		"image/png":  "png",
		"image/webp": "webp",
		"image/gif":  "gif",
	}
	return mimeToExt[mimeType]
}

// UploadProfileImage プロフィール画像を1枚アップロードし、保存先URLを返す
// 既存のプロフィール画像が存在する場合はトランザクション内で原子的に置き換える
func (s *UploadService) UploadProfileImage(userID int, file *multipart.FileHeader) (string, error) {
	if file == nil {
		s.logger.Warn("アップロードファイルが指定されていない")
		return "", ErrNoFiles
	}

	// バリデーションとディスク保存のみ行う（DB登録は ReplaceProfileImage でアトミックに実施）
	pending, err := s.saveImageFileToDisk(userID, file, profileUploadDir, repositories.ProfileImageURLPrefix)
	if err != nil {
		return "", err
	}

	// トランザクション内でアトミックに旧画像を deleted に更新し、新規レコードを作成する。
	// FOR UPDATE ロックにより同一ユーザーの同時リクエストでも「1枚のみ」が保証される。
	oldPaths, err := s.uploadRepo.ReplaceProfileImage(&pending.uploadRecord)
	if err != nil {
		s.logger.Error("プロフィール画像DB置き換え失敗",
			"user_id", userID,
			"error", err)
		// DB操作が失敗したため、先に保存したディスクファイルをロールバック
		if removeErr := os.Remove(pending.savePath); removeErr != nil {
			s.logger.Warn("ロールバック時ファイル削除失敗",
				"user_id", userID,
				"path", pending.savePath,
				"error", removeErr)
		}
		return "", fmt.Errorf("プロフィール画像の保存に失敗しました")
	}

	// DB置き換え成功後、旧プロフィール画像のディスクファイルを削除（ベストエフォート）
	// filepath.Base でファイル名のみを抽出することで、DB値に不正なパスが含まれていても
	// profileUploadDir 配下にしか削除が及ばない（パストラバーサル防止）
	for _, oldPath := range oldPaths {
		baseName := filepath.Base(oldPath)
		if baseName == "." || baseName == ".." {
			s.logger.Warn("不正なベースネームをスキップ（パストラバーサル防止）",
				"user_id", userID,
				"file_path", oldPath)
			continue
		}
		diskPath := filepath.Join(profileUploadDir, baseName)
		if removeErr := os.Remove(diskPath); removeErr != nil {
			s.logger.Warn("既存プロフィール画像削除失敗",
				"user_id", userID,
				"path", diskPath,
				"error", removeErr)
		} else {
			s.logger.Info("既存プロフィール画像を削除（置き換え）",
				"user_id", userID,
				"old_path", oldPath)
		}
	}

	return pending.uploadRecord.FilePath, nil
}

