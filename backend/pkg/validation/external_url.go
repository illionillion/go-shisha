package validation

import (
	"strings"

	"github.com/go-playground/validator/v10"
)

// ValidateExternalURL は外部URLを検証
// 許可:
//   - http:// または https:// で始まるURL
//   - 空文字列（omitempty で省略可能）
//
// 禁止:
//   - javascript:, data:, file:, vbscript:, about: などの危険なスキーム（XSS/SSRF対策）
//   - 先頭・末尾に空白文字を含む値
func ValidateExternalURL(fl validator.FieldLevel) bool {
	raw := fl.Field().String()

	// 空文字列は omitempty で制御するため常に許可
	if raw == "" {
		return true
	}

	externalURL := strings.TrimSpace(raw)

	// トリミング前後で値が異なる場合（先頭・末尾に空白文字が含まれる）は拒否
	if raw != externalURL {
		return false
	}

	// HTTP(S) URLのみ許可
	if strings.HasPrefix(externalURL, "http://") || strings.HasPrefix(externalURL, "https://") {
		return true
	}

	return false
}
