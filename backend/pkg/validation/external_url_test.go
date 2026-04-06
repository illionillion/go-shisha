package validation

import (
	"testing"

	"github.com/go-playground/validator/v10"
)

type testExternalURLStruct struct {
	ExternalURL *string `validate:"omitempty,externalurl"`
}

func TestValidateExternalURL(t *testing.T) {
	v := validator.New()
	err := v.RegisterValidation("externalurl", ValidateExternalURL)
	if err != nil {
		t.Fatalf("failed to register validation: %v", err)
	}

	strPtr := func(s string) *string { return &s }

	tests := []struct {
		name      string
		url       *string
		wantValid bool
	}{
		// 有効なケース
		{name: "HTTPS URL", url: strPtr("https://example.com/profile"), wantValid: true},
		{name: "HTTP URL", url: strPtr("http://example.com/"), wantValid: true},
		{name: "空文字列（クリア用途）", url: strPtr(""), wantValid: true},
		{name: "nil（フィールド省略）", url: nil, wantValid: true},
		// 無効なケース
		{name: "javascript: スキーム", url: strPtr("javascript:alert(1)"), wantValid: false},
		{name: "data: スキーム", url: strPtr("data:text/html,<script>alert(1)</script>"), wantValid: false},
		{name: "file: スキーム", url: strPtr("file:///etc/passwd"), wantValid: false},
		{name: "vbscript: スキーム", url: strPtr("vbscript:msgbox(1)"), wantValid: false},
		{name: "相対パス", url: strPtr("/profile/123"), wantValid: false},
		{name: "先頭に空白", url: strPtr(" https://example.com"), wantValid: false},
		{name: "末尾に空白", url: strPtr("https://example.com "), wantValid: false},
		{name: "スキームなし", url: strPtr("example.com"), wantValid: false},
		{name: "http://なし（不完全なURL）", url: strPtr("http:example.com"), wantValid: false},
		{name: "https://なし（不完全なURL）", url: strPtr("https:example.com"), wantValid: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ts := testExternalURLStruct{ExternalURL: tt.url}
			e := v.Struct(ts)
			isValid := e == nil
			if isValid != tt.wantValid {
				t.Errorf("ValidateExternalURL(%v) = %v, want %v (error: %v)",
					tt.url, isValid, tt.wantValid, e)
			}
		})
	}
}
