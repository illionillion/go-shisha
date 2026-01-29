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
func ValidateImageURL(fl validator.FieldLevel) bool {
	imageURL := strings.TrimSpace(fl.Field().String())

	// 危険なスキームをブロック（SSRF/XSS対策）
	dangerousSchemes := []string{
		"javascript:",
		"data:",
		"file:",
		"vbscript:",
		"about:",
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
