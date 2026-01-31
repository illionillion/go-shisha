package validation

import (
	"testing"

	"github.com/go-playground/validator/v10"
)

type testStruct struct {
	ImageURL string `validate:"imageurl"`
}

func TestValidateImageURL(t *testing.T) {
	v := validator.New()
	err := v.RegisterValidation("imageurl", ValidateImageURL)
	if err != nil {
		t.Fatalf("failed to register validation: %v", err)
	}

	tests := []struct {
		name      string
		imageURL  string
		wantValid bool
	}{
		// 有効なケース
		{
			name:      "相対パス: /images/で始まる",
			imageURL:  "/images/test.jpg",
			wantValid: true,
		},
		{
			name:      "HTTPS URL",
			imageURL:  "https://example.com/image.png",
			wantValid: true,
		},
		{
			name:      "HTTP URL",
			imageURL:  "http://example.com/image.jpg",
			wantValid: true,
		},
		{
			name:      "S3風のURL",
			imageURL:  "https://s3.amazonaws.com/bucket/image.jpg",
			wantValid: true,
		},
		// 無効なケース
		{
			name:      "javascript: スキーム（XSS対策）",
			imageURL:  "javascript:alert(1)",
			wantValid: false,
		},
		{
			name:      "JavaScript: 大文字（XSS対策）",
			imageURL:  "JavaScript:alert(1)",
			wantValid: false,
		},
		{
			name:      "data: スキーム（XSS対策）",
			imageURL:  "data:text/html,<script>alert(1)</script>",
			wantValid: false,
		},
		{
			name:      "file: スキーム（SSRF対策）",
			imageURL:  "file:///etc/passwd",
			wantValid: false,
		},
		{
			name:      "vbscript: スキーム（XSS対策）",
			imageURL:  "vbscript:msgbox(1)",
			wantValid: false,
		},
		{
			name:      "about: スキーム",
			imageURL:  "about:blank",
			wantValid: false,
		},
		{
			name:      "単なる相対パス（/images/なし）",
			imageURL:  "/other/path.jpg",
			wantValid: false,
		},
		{
			name:      "images/で始まる（スラッシュなし）",
			imageURL:  "images/test.jpg",
			wantValid: false,
		},
		{
			name:      "空文字列",
			imageURL:  "",
			wantValid: false,
		},
		// 新しく追加された危険なスキーム
		{
			name:      "blob: スキーム",
			imageURL:  "blob:https://example.com/uuid",
			wantValid: false,
		},
		{
			name:      "ftp: スキーム（SSRF対策）",
			imageURL:  "ftp://example.com/file.jpg",
			wantValid: false,
		},
		{
			name:      "ftps: スキーム（SSRF対策）",
			imageURL:  "ftps://example.com/file.jpg",
			wantValid: false,
		},
		{
			name:      "ws: スキーム（WebSocket）",
			imageURL:  "ws://example.com/socket",
			wantValid: false,
		},
		{
			name:      "wss: スキーム（WebSocket）",
			imageURL:  "wss://example.com/socket",
			wantValid: false,
		},
		// 空白文字のトリミングテスト（修正：トリミング前後で異なる場合は拒否）
		{
			name:      "先頭に空白がある有効なパス（拒否される）",
			imageURL:  " /images/test.jpg",
			wantValid: false,
		},
		{
			name:      "末尾に空白がある有効なパス（拒否される）",
			imageURL:  "/images/test.jpg ",
			wantValid: false,
		},
		{
			name:      "前後に空白がある有効なURL（拒否される）",
			imageURL:  "  https://example.com/image.jpg  ",
			wantValid: false,
		},
		{
			name:      "空白のみ",
			imageURL:  "   ",
			wantValid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ts := testStruct{ImageURL: tt.imageURL}
			err := v.Struct(ts)
			isValid := err == nil

			if isValid != tt.wantValid {
				t.Errorf("ValidateImageURL(%q) = %v, want %v (error: %v)",
					tt.imageURL, isValid, tt.wantValid, err)
			}
		})
	}
}
