package validation

import (
	"strings"

	"github.com/go-playground/validator/v10"
)

// ValidateImageURL は画像URLまたは相対パスを検証
// 許可:
//   - /images/ で始まる相対パス（現状のpublic/images）
//   - http:// または https:// で始まるURL（将来のS3など外部URL）
//
// 禁止:
//   - javascript:, data:, file:, vbscript:, about: などの危険なスキーム（SSRF/XSS対策）
//   - 先頭・末尾に空白を含む値（トリミング前後で異なる値）
func ValidateImageURL(fl validator.FieldLevel) bool {
	raw := fl.Field().String()
	imageURL := strings.TrimSpace(raw)

	// トリミング前後で値が異なる場合（先頭・末尾に空白が含まれる）は拒否
	// これにより、意図しない空白文字によるバリデーションバイパスを防ぐ
	if raw != imageURL {
		return false
	}

	// 危険なスキームをブロック（SSRF/XSS対策）
	dangerousSchemes := []string{
		"javascript:",
		"data:",
		"file:",
		"vbscript:",
		"about:",
		"blob:",
		"ftp:",
		"ftps:",
		"ws:",
		"wss:",
	}

	lowerURL := strings.ToLower(imageURL)
	for _, scheme := range dangerousSchemes {
		if strings.HasPrefix(lowerURL, scheme) {
			return false
		}
	}

	// 相対パス（/images/で始まる）を許可
	if strings.HasPrefix(imageURL, "/images/") {
		return true
	}

	// HTTP(S) URLを許可（将来のS3など外部URL対応）
	if strings.HasPrefix(imageURL, "http://") || strings.HasPrefix(imageURL, "https://") {
		return true
	}

	return false
}
