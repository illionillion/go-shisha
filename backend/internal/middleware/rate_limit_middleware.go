package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/pkg/logging"
)

// IPRateLimiter はIPアドレスごとのレート制限を管理
type IPRateLimiter struct {
	ips map[string]*rate.Limiter
	mu  *sync.RWMutex
	r   rate.Limit
	b   int
}

// NewIPRateLimiter は新しいIPRateLimiterを作成
// r: 1秒あたりのリクエスト数、b: バースト数
func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
	return &IPRateLimiter{
		ips: make(map[string]*rate.Limiter),
		mu:  &sync.RWMutex{},
		r:   r,
		b:   b,
	}
}

// AddIP はIPアドレスにレート制限を追加
func (i *IPRateLimiter) AddIP(ip string) *rate.Limiter {
	i.mu.Lock()
	defer i.mu.Unlock()

	limiter := rate.NewLimiter(i.r, i.b)
	i.ips[ip] = limiter

	return limiter
}

// GetLimiter は指定されたIPアドレスのレート制限を取得
func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
	i.mu.Lock()
	limiter, exists := i.ips[ip]
	if !exists {
		i.mu.Unlock()
		return i.AddIP(ip)
	}
	i.mu.Unlock()

	return limiter
}

// RateLimitMiddleware はレート制限を適用するミドルウェア
func RateLimitMiddleware(limiter *IPRateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		
		lim := limiter.GetLimiter(ip)
		if !lim.Allow() {
			logging.L.Warn("rate limit exceeded",
				"middleware", "RateLimitMiddleware",
				"ip", ip,
				"path", c.Request.URL.Path)
			c.JSON(http.StatusTooManyRequests, models.ErrorResponse{
				Error: "too many requests, please try again later",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// CleanupOldIPs は古いIPアドレスのエントリを定期的にクリーンアップ
// メモリリーク防止のため、バックグラウンドで実行することを推奨
func (i *IPRateLimiter) CleanupOldIPs(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			i.mu.Lock()
			// 実装の簡略化のため、全エントリをクリア
			// 本番環境ではRedisなどの外部ストレージを使用することを推奨
			i.ips = make(map[string]*rate.Limiter)
			i.mu.Unlock()
			logging.L.Debug("rate limiter cleanup executed")
		}
	}()
}
