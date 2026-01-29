package services

import (
	"fmt"
	"io"
	"log/slog"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

// UploadService 画像アップロードサービス
type UploadService struct {
	logger *slog.Logger
}

// NewUploadService UploadServiceのコンストラクタ
func NewUploadService(logger *slog.Logger) *UploadService {
	return &UploadService{
		logger: logger,
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
func (s *UploadService) UploadImages(files []*multipart.FileHeader) ([]string, error) {
	if len(files) == 0 {
		s.logger.Warn("アップロードファイルが0件")
		return nil, fmt.Errorf("ファイルが指定されていません")
	}

	// 保存先ディレクトリの確保
	uploadDir := "public/images"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		s.logger.Error("ディレクトリ作成失敗", "error", err, "path", uploadDir)
		return nil, fmt.Errorf("ディレクトリの作成に失敗しました")
	}

	var urls []string

	for _, fileHeader := range files {
		// ファイルサイズチェック
		if fileHeader.Size > maxFileSize {
			s.logger.Warn("ファイルサイズ超過",
				"filename", fileHeader.Filename,
				"size", fileHeader.Size,
				"max", maxFileSize)
			return nil, fmt.Errorf("ファイルサイズが10MBを超えています: %s", fileHeader.Filename)
		}

		// MIMEタイプチェック
		contentType := fileHeader.Header.Get("Content-Type")
		if !allowedMimeTypes[contentType] {
			s.logger.Warn("不正なファイル形式",
				"filename", fileHeader.Filename,
				"contentType", contentType)
			return nil, fmt.Errorf("サポートされていないファイル形式です: %s (許可: jpg, jpeg, png, webp, gif)", fileHeader.Filename)
		}

		// ファイルを開く
		file, err := fileHeader.Open()
		if err != nil {
			s.logger.Error("ファイルオープン失敗", "error", err, "filename", fileHeader.Filename)
			return nil, fmt.Errorf("ファイルの読み込みに失敗しました")
		}
		defer func() {
			if err := file.Close(); err != nil {
				s.logger.Warn("ファイルクローズ失敗", "error", err)
			}
		}()

		// ファイル名生成（タイムスタンプ + UUID + 拡張子）
		ext := filepath.Ext(fileHeader.Filename)
		// パストラバーサル対策: 拡張子のサニタイゼーション
		ext = strings.ToLower(strings.TrimPrefix(ext, "."))
		if !isValidExtension(ext) {
			s.logger.Warn("不正な拡張子", "filename", fileHeader.Filename, "ext", ext)
			return nil, fmt.Errorf("サポートされていない拡張子です: %s", fileHeader.Filename)
		}

		timestamp := time.Now().Format("20060102")
		filename := fmt.Sprintf("%s_%s.%s", timestamp, uuid.New().String(), ext)
		savePath := filepath.Join(uploadDir, filename)

		// ファイル保存
		dst, err := os.Create(savePath)
		if err != nil {
			s.logger.Error("ファイル作成失敗", "error", err, "path", savePath)
			return nil, fmt.Errorf("ファイルの保存に失敗しました")
		}
		defer func() {
			if err := dst.Close(); err != nil {
				s.logger.Warn("ファイルクローズ失敗", "error", err)
			}
		}()

		if _, err := io.Copy(dst, file); err != nil {
			s.logger.Error("ファイル書き込み失敗", "error", err, "path", savePath)
			// 失敗したファイルを削除
			if removeErr := os.Remove(savePath); removeErr != nil {
				s.logger.Warn("失敗ファイル削除エラー", "error", removeErr, "path", savePath)
			}
			return nil, fmt.Errorf("ファイルの保存に失敗しました")
		}

		// URLを生成（publicからの相対パス）
		url := fmt.Sprintf("/images/%s", filename)
		urls = append(urls, url)

		s.logger.Info("画像アップロード成功",
			"filename", fileHeader.Filename,
			"savedAs", filename,
			"size", fileHeader.Size)
	}

	return urls, nil
}

// isValidExtension 有効な拡張子かチェック
func isValidExtension(ext string) bool {
	validExts := map[string]bool{
		"jpg":  true,
		"jpeg": true,
		"png":  true,
		"webp": true,
		"gif":  true,
	}
	return validExts[ext]
}
