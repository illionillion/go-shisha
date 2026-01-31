package services

import (
	"bytes"
	"errors"
	"log/slog"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"go-shisha-backend/internal/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockUploadRepository はUploadRepositoryのモック
type MockUploadRepository struct {
	mock.Mock
}

func (m *MockUploadRepository) Create(upload *models.UploadDB) error {
	args := m.Called(upload)
	return args.Error(0)
}

func (m *MockUploadRepository) GetByID(id int) (*models.UploadDB, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.UploadDB), args.Error(1)
}

func (m *MockUploadRepository) GetByFilePath(filePath string) (*models.UploadDB, error) {
	args := m.Called(filePath)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.UploadDB), args.Error(1)
}

func (m *MockUploadRepository) GetByUserID(userID int) ([]models.UploadDB, error) {
	args := m.Called(userID)
	return args.Get(0).([]models.UploadDB), args.Error(1)
}

func (m *MockUploadRepository) UpdateStatus(id int, status string) error {
	args := m.Called(id, status)
	return args.Error(0)
}

func (m *MockUploadRepository) MarkAsUsed(filePath string) error {
	args := m.Called(filePath)
	return args.Error(0)
}

func (m *MockUploadRepository) DeleteUnusedOlderThan(duration time.Duration) (int64, error) {
	args := m.Called(duration)
	return args.Get(0).(int64), args.Error(1)
}

func TestUploadService_UploadImages(t *testing.T) {
	// テスト用ロガー
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	mockRepo := new(MockUploadRepository)
	service := NewUploadService(mockRepo, logger)

	// テスト後のクリーンアップ
	defer func() {
		_ = os.RemoveAll("public/images")
	}()

	t.Run("正常系_複数画像アップロード", func(t *testing.T) {
		mockRepo.ExpectedCalls = nil // リセット
		mockRepo.On("Create", mock.AnythingOfType("*models.UploadDB")).Return(nil).Times(2)

		// テスト画像データを作成
		files := createTestImageFiles(t, []testFile{
			{filename: "test1.jpg", contentType: "image/jpeg", size: 1024},
			{filename: "test2.png", contentType: "image/png", size: 2048},
		})

		urls, err := service.UploadImages(1, files)

		assert.NoError(t, err)
		assert.Len(t, urls, 2)
		for _, url := range urls {
			assert.True(t, strings.HasPrefix(url, "/images/"))
			// ファイルが実際に存在することを確認
			filePath := filepath.Join("public", url)
			_, err := os.Stat(filePath)
			assert.NoError(t, err)
		}
		mockRepo.AssertExpectations(t)
	})

	t.Run("異常系_ファイルが0件", func(t *testing.T) {
		urls, err := service.UploadImages(1, []*multipart.FileHeader{})

		assert.Error(t, err)
		assert.Nil(t, urls)
		assert.Contains(t, err.Error(), "ファイルが指定されていません")
	})

	t.Run("異常系_ファイルサイズ超過", func(t *testing.T) {
		// 10MBを超えるファイルを作成
		files := createTestImageFiles(t, []testFile{
			{filename: "large.jpg", contentType: "image/jpeg", size: 11 * 1024 * 1024},
		})

		urls, err := service.UploadImages(1, files)

		assert.Error(t, err)
		assert.Nil(t, urls)
		assert.Contains(t, err.Error(), "ファイルサイズが10MBを超えています")
	})

	t.Run("異常系_不正なファイル形式", func(t *testing.T) {
		files := createTestImageFiles(t, []testFile{
			{filename: "test.txt", contentType: "text/plain", size: 1024},
		})

		urls, err := service.UploadImages(1, files)

		assert.Error(t, err)
		assert.Nil(t, urls)
		assert.Contains(t, err.Error(), "サポートされていないファイル形式です")
	})

	t.Run("異常系_不正な拡張子", func(t *testing.T) {
		files := createTestImageFiles(t, []testFile{
			{filename: "test.exe", contentType: "image/jpeg", size: 1024},
		})

		urls, err := service.UploadImages(1, files)

		assert.Error(t, err)
		assert.Nil(t, urls)
		assert.Contains(t, err.Error(), "サポートされていない拡張子です")
	})

	t.Run("異常系_DB保存失敗", func(t *testing.T) {
		mockRepo.ExpectedCalls = nil // リセット
		mockRepo.On("Create", mock.AnythingOfType("*models.UploadDB")).Return(errors.New("DB error"))

		files := createTestImageFiles(t, []testFile{
			{filename: "test1.jpg", contentType: "image/jpeg", size: 1024},
		})

		urls, err := service.UploadImages(1, files)

		assert.Error(t, err)
		assert.Nil(t, urls)
		assert.Contains(t, err.Error(), "画像情報の保存に失敗しました")
		mockRepo.AssertExpectations(t)
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
		// メモリ上にmultipart.FileHeaderを作成
		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)

		// フィールドを作成
		part, err := writer.CreateFormFile("images", tf.filename)
		assert.NoError(t, err)

		// ダミーデータを書き込み
		data := bytes.Repeat([]byte("x"), int(tf.size))
		_, err = part.Write(data)
		assert.NoError(t, err)

		err = writer.Close()
		assert.NoError(t, err)

		// multipart.FileHeaderを抽出
		reader := multipart.NewReader(body, writer.Boundary())
		form, err := reader.ReadForm(tf.size + 1024)
		assert.NoError(t, err)

		formFiles := form.File["images"]
		assert.Len(t, formFiles, 1)

		// Content-Typeを設定
		formFiles[0].Header.Set("Content-Type", tf.contentType)

		files = append(files, formFiles[0])
	}

	return files
}
