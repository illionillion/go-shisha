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

// 許可する画像形式のMIMEタイプ
var allowedMimeTypes = map[string]bool{
	"image/jpeg": true,
	"image/jpg":  true,
	"image/png":  true,
	"image/webp": true,
	"image/gif":  true,
}

// 最大ファイルサイズ（10MB）
const maxFileSize = 10 * 1024 * 1024

// UploadImages 複数の画像をアップロードする
func (s *UploadService) UploadImages(userID int, files []*multipart.FileHeader) ([]string, error) {
	if len(files) == 0 {
		s.logger.Warn("アップロードファイルが0件")
		return nil, ErrNoFiles
	}

	// 保存先ディレクトリの確保
	uploadDir := "public/images"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		s.logger.Error("ディレクトリ作成失敗", "error", err, "path", uploadDir)
		return nil, fmt.Errorf("ディレクトリの作成に失敗しました")
	}

	var urls []string
	var uploadRecords []models.UploadDB

	for _, fileHeader := range files {
		// ファイルサイズチェック
		if fileHeader.Size > maxFileSize {
			s.logger.Warn("ファイルサイズ超過",
				"filename", fileHeader.Filename,
				"size", fileHeader.Size,
				"max", maxFileSize)
			// 既に保存したファイルをロールバック
			s.rollbackFiles(uploadRecords)
			return nil, fmt.Errorf("%w: %s", ErrFileTooLarge, fileHeader.Filename)
		}

		// ファイルを開く
		file, err := fileHeader.Open()
		if err != nil {
			s.logger.Error("ファイルオープン失敗", "error", err, "filename", fileHeader.Filename)
			s.rollbackFiles(uploadRecords)
			return nil, fmt.Errorf("ファイルの読み込みに失敗しました")
		}

		// MIMEタイプチェック（実データから検証）
		buffer := make([]byte, 512)
		n, err := file.Read(buffer)
		if err != nil && err != io.EOF {
			_ = file.Close()
			s.logger.Error("ファイル読み込み失敗", "error", err, "filename", fileHeader.Filename)
			s.rollbackFiles(uploadRecords)
			return nil, fmt.Errorf("ファイルの読み込みに失敗しました")
		}
		detectedType := http.DetectContentType(buffer[:n])
		if !allowedMimeTypes[detectedType] {
			_ = file.Close()
			s.logger.Warn("不正なファイル形式",
				"filename", fileHeader.Filename,
				"detectedType", detectedType)
			s.rollbackFiles(uploadRecords)
			return nil, fmt.Errorf("%w: %s (検出: %s)", ErrInvalidFileType, fileHeader.Filename, detectedType)
		}

		// ファイルポインタを先頭に戻す
		if _, err := file.Seek(0, 0); err != nil {
			_ = file.Close()
			s.logger.Error("ファイルシーク失敗", "error", err, "filename", fileHeader.Filename)
			s.rollbackFiles(uploadRecords)
			return nil, fmt.Errorf("ファイルの読み込みに失敗しました")
		}

		// MIMEタイプから拡張子を決定（セキュリティ向上）
		ext := getExtensionFromMIME(detectedType)
		if ext == "" {
			_ = file.Close()
			s.logger.Warn("サポートされていないMIMEタイプ", "filename", fileHeader.Filename, "mimeType", detectedType)
			s.rollbackFiles(uploadRecords)
			return nil, fmt.Errorf("%w: %s", ErrInvalidExtension, detectedType)
		}

		timestamp := time.Now().Format("20060102")
		filename := fmt.Sprintf("%s_%s.%s", timestamp, uuid.New().String(), ext)
		savePath := filepath.Join(uploadDir, filename)

		// ファイル保存
		dst, err := os.Create(savePath)
		if err != nil {
			_ = file.Close()
			s.logger.Error("ファイル作成失敗", "error", err, "path", savePath)
			s.rollbackFiles(uploadRecords)
			return nil, fmt.Errorf("ファイルの保存に失敗しました")
		}

		// io.Copyとクローズ処理
		_, copyErr := io.Copy(dst, file)
		_ = file.Close()
		_ = dst.Close()

		if copyErr != nil {
			s.logger.Error("ファイル書き込み失敗", "error", copyErr, "path", savePath)
			// 失敗したファイルを削除
			if removeErr := os.Remove(savePath); removeErr != nil {
				s.logger.Warn("失敗ファイル削除エラー", "error", removeErr, "path", savePath)
			}
			s.rollbackFiles(uploadRecords)
			return nil, fmt.Errorf("ファイルの保存に失敗しました")
		}

		// URLを生成（publicからの相対パス）
		url := fmt.Sprintf("/images/%s", filename)

		// DB記録を作成
		uploadRecord := models.UploadDB{
			UserID:       userID,
			FilePath:     url,
			OriginalName: fileHeader.Filename,
			MimeType:     detectedType,
			FileSize:     fileHeader.Size,
			Status:       "uploaded",
			CreatedAt:    time.Now(),
		}

		// DBに保存
		if err := s.uploadRepo.Create(&uploadRecord); err != nil {
			s.logger.Error("DB保存失敗", "error", err, "path", url)
			// ファイルを削除
			if removeErr := os.Remove(savePath); removeErr != nil {
				s.logger.Warn("失敗ファイル削除エラー", "error", removeErr, "path", savePath)
			}
			s.rollbackFiles(uploadRecords)
			return nil, fmt.Errorf("画像情報の保存に失敗しました")
		}

		uploadRecords = append(uploadRecords, uploadRecord)
		urls = append(urls, url)

		s.logger.Info("画像アップロード成功",
			"user_id", userID,
			"filename", fileHeader.Filename,
			"savedAs", filename,
			"size", fileHeader.Size)
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
