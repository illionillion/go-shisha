package db

import (
	"fmt"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// NewDBFromEnv reads DATABASE_URL from env and returns a gorm.DB
func NewDBFromEnv() (*gorm.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return nil, fmt.Errorf("DATABASE_URL is not set")
	}

	// GORM設定: ロガー、PrepareStmt、NowFuncを設定
	config := &gorm.Config{
		Logger:      logger.Default.LogMode(logger.Info), // 本番環境では logger.Silent に切り替え
		PrepareStmt: true,                                // プリペアドステートメントを有効化（パフォーマンス向上）
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	}

	db, err := gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// コネクションプール設定
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)           // アイドル接続の最大数
	sqlDB.SetMaxOpenConns(100)          // 最大接続数
	sqlDB.SetConnMaxLifetime(time.Hour) // 接続の最大ライフタイム

	return db, nil
}
