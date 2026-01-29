package services

import (
	"bytes"
	"log/slog"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUploadService_UploadImages(t *testing.T) {
	// テスト用ロガー
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	service := NewUploadService(logger)

	// テスト後のクリーンアップ
	defer func() {
		os.RemoveAll("public/images")
	}()

	t.Run("正常系_複数画像アップロード", func(t *testing.T) {
		// テスト画像データを作成
		files := createTestImageFiles(t, []testFile{
			{filename: "test1.jpg", contentType: "image/jpeg", size: 1024},
			{filename: "test2.png", contentType: "image/png", size: 2048},
		})

		urls, err := service.UploadImages(files)

		assert.NoError(t, err)
		assert.Len(t, urls, 2)
		for _, url := range urls {
			assert.True(t, strings.HasPrefix(url, "/images/"))
			// ファイルが実際に存在することを確認
			filePath := filepath.Join("public", url)
			_, err := os.Stat(filePath)
			assert.NoError(t, err)
		}
	})

	t.Run("異常系_ファイルが0件", func(t *testing.T) {
		urls, err := service.UploadImages([]*multipart.FileHeader{})

		assert.Error(t, err)
		assert.Nil(t, urls)
		assert.Contains(t, err.Error(), "ファイルが指定されていません")
	})

	t.Run("異常系_ファイルサイズ超過", func(t *testing.T) {
		// 10MBを超えるファイルを作成
		files := createTestImageFiles(t, []testFile{
			{filename: "large.jpg", contentType: "image/jpeg", size: 11 * 1024 * 1024},
		})

		urls, err := service.UploadImages(files)

		assert.Error(t, err)
		assert.Nil(t, urls)
		assert.Contains(t, err.Error(), "ファイルサイズが10MBを超えています")
	})

	t.Run("異常系_不正なファイル形式", func(t *testing.T) {
		files := createTestImageFiles(t, []testFile{
			{filename: "test.txt", contentType: "text/plain", size: 1024},
		})

		urls, err := service.UploadImages(files)

		assert.Error(t, err)
		assert.Nil(t, urls)
		assert.Contains(t, err.Error(), "サポートされていないファイル形式です")
	})

	t.Run("異常系_不正な拡張子", func(t *testing.T) {
		files := createTestImageFiles(t, []testFile{
			{filename: "test.exe", contentType: "image/jpeg", size: 1024},
		})

		urls, err := service.UploadImages(files)

		assert.Error(t, err)
		assert.Nil(t, urls)
		assert.Contains(t, err.Error(), "サポートされていない拡張子です")
	})
}

// テストヘルパー関数

type testFile struct {
	filename    string
	contentType string
	size        int64
}

func createTestImageFiles(t *testing.T, testFiles []testFile) []*multipart.FileHeader {
	t.Helper()

	var files []*multipart.FileHeader

	for _, tf := range testFiles {
		// テストデータを作成
		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)

		part, err := writer.CreateFormFile("images", tf.filename)
		assert.NoError(t, err)

		// ダミーデータを書き込み
		dummyData := make([]byte, tf.size)
		_, err = part.Write(dummyData)
		assert.NoError(t, err)

		writer.Close()

		// multipart.FileHeaderを作成
		reader := multipart.NewReader(body, writer.Boundary())
		form, err := reader.ReadForm(tf.size + 1024)
		assert.NoError(t, err)

		fileHeaders := form.File["images"]
		assert.Len(t, fileHeaders, 1)

		// Content-Typeを設定
		fileHeaders[0].Header.Set("Content-Type", tf.contentType)

		files = append(files, fileHeaders[0])
	}

	return files
}
