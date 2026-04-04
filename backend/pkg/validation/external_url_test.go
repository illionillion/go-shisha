package validation

import (
	"testing"

	"github.com/go-playground/validator/v10"
)

type testExternalURLStruct struct {
	ExternalURL string `validate:"omitempty,externalurl"`
}

func TestValidateExternalURL(t *testing.T) {
	v := validator.New()
	err := v.RegisterValidation("externalurl", ValidateExternalURL)
	if err != nil {
		t.Fatalf("failed to register validation: %v", err)
	}

	tests := []struct {
		name      string
		url       string
		wantValid bool
	}{
		// 有効なケース
		{name: "HTTPS URL", url: "https://example.com/profile", wantValid: true},
		{name: "HTTP URL", url: "http://example.com/", wantValid: true},
		{name: "空文字列（省略）", url: "", wantValid: true},
		// 無効なケース
		{name: "javascript: スキーム", url: "javascript:alert(1)", wantValid: false},
		{name: "data: スキーム", url: "data:text/html,<script>alert(1)</script>", wantValid: false},
		{name: "file: スキーム", url: "file:///etc/passwd", wantValid: false},
		{name: "vbscript: スキーム", url: "vbscript:msgbox(1)", wantValid: false},
		{name: "相対パス", url: "/profile/123", wantValid: false},
		{name: "先頭に空白", url: " https://example.com", wantValid: false},
		{name: "末尾に空白", url: "https://example.com ", wantValid: false},
		{name: "スキームなし", url: "example.com", wantValid: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ts := testExternalURLStruct{ExternalURL: tt.url}
			e := v.Struct(ts)
			isValid := e == nil
			if isValid != tt.wantValid {
				t.Errorf("ValidateExternalURL(%q) = %v, want %v (error: %v)",
					tt.url, isValid, tt.wantValid, e)
			}
		})
	}
}
