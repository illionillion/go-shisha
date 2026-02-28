package models

// ValidationError はバリデーションエラーを表す（400 Bad Request）
// @Description 入力値のバリデーションに失敗した場合のエラーレスポンス
type ValidationError struct {
	// エラー種別の識別子
	Error string `json:"error" example:"validation failed"`
	// ユーザー向けのエラーメッセージ
	Message string `json:"message" example:"入力値を確認してください"`
}

// ConflictError はリソース競合エラーを表す（409 Conflict）
// @Description リソースが既に存在する場合のエラーレスポンス
type ConflictError struct {
	// エラー種別の識別子
	Error string `json:"error" example:"resource conflict"`
	// ユーザー向けのエラーメッセージ
	Message string `json:"message" example:"このリソースは既に存在します"`
}

// UnauthorizedError は認証エラーを表す（401 Unauthorized）
// @Description 認証に失敗した場合のエラーレスポンス
type UnauthorizedError struct {
	// エラー種別の識別子
	Error string `json:"error" example:"unauthorized"`
	// ユーザー向けのエラーメッセージ
	Message string `json:"message" example:"認証に失敗しました"`
}

// ServerError はサーバー内部エラーを表す（500 Internal Server Error）
// @Description サーバー内部でエラーが発生した場合のエラーレスポンス
type ServerError struct {
	// エラー種別の識別子
	Error string `json:"error" example:"internal server error"`
	// ユーザー向けのエラーメッセージ
	Message string `json:"message" example:"サーバーエラーが発生しました"`
}
