package validation

import (
	"strings"

	"github.com/go-playground/validator/v10"
)

// ValidateExternalURL は外部URLを検証する。
// 許可:
//   - 空文字列（URLのクリア/未設定用途として許可）
//   - http:// または https:// で始まるURL（スキームは大文字小文字を区別しない）
//
// 禁止:
//   - javascript:, data:, file:, vbscript:, about: などの危険なスキーム（XSS/SSRF対策）
//   - 先頭・末尾に空白文字を含む値
//   - http: や https: のみ（"://" のない不完全なURL）
//
// 注意: UpdateUserInput.ExternalURL は *string のため、omitempty は nil のときのみスキップする。
// external_url: "" が送られた場合はこのバリデータが呼ばれるため、空文字はここで明示的に許可する。
func ValidateExternalURL(fl validator.FieldLevel) bool {
	raw := fl.Field().String()

	externalURL := strings.TrimSpace(raw)

	// トリミング前後で値が異なる場合（先頭・末尾に空白文字が含まれる）は拒否する。
	if raw != externalURL {
		return false
	}

	// 空文字列は未入力・クリア用途として許可する。
	if externalURL == "" {
		return true
	}

	// 大文字小文字を区別せず http:// または https:// で始まるURLのみ許可する。
	// strings.HasPrefix による前方一致で "//" を必須とし、http:example.com 等の不完全なURLを拒否する。
	lowerURL := strings.ToLower(externalURL)
	return strings.HasPrefix(lowerURL, "http://") || strings.HasPrefix(lowerURL, "https://")
}
