package models

// エラーコード定数 - ハンドラーと enums タグの単一ソース
const (
	ErrCodeValidationFailed   = "validation_failed"
	ErrCodeEmailAlreadyExists = "email_already_exists"
	ErrCodeAlreadyLiked       = "already_liked"
	ErrCodeNotLiked           = "not_liked"
	ErrCodeForbidden          = "forbidden"
	ErrCodeUnauthorized       = "unauthorized"
	ErrCodeNotFound           = "not_found"
	ErrCodeInternalServer     = "internal_server_error"
)

// ValidationError はバリデーションエラーを表す（400 Bad Request）
// @Description 入力値のバリデーションに失敗した場合のエラーレスポンス
type ValidationError struct {
	// エラー種別の識別子
	Error string `json:"error" enums:"validation_failed" example:"validation_failed" binding:"required"`
}

// ConflictError はリソース競合エラーを表す（409 Conflict）
// @Description リソース競合エラーレスポンス（メール重複・いいね重複・いいね未実施など）
type ConflictError struct {
	// エラー種別の識別子
	Error string `json:"error" enums:"email_already_exists,already_liked,not_liked" example:"already_liked" binding:"required"`
}

// UnauthorizedError は認証エラーを表す（401 Unauthorized）
// @Description 認証に失敗した場合のエラーレスポンス
type UnauthorizedError struct {
	// エラー種別の識別子
	Error string `json:"error" enums:"unauthorized" example:"unauthorized" binding:"required"`
}

// ForbiddenError は権限エラーを表す（403 Forbidden）
// @Description 権限がない操作を実行した場合のエラーレスポンス
type ForbiddenError struct {
	// エラー種別の識別子
	Error string `json:"error" enums:"forbidden" example:"forbidden" binding:"required"`
}

// NotFoundError はリソースが見つからないエラーを表す（404 Not Found）
// @Description リソースが見つからない場合のエラーレスポンス
type NotFoundError struct {
	// エラー種別の識別子
	Error string `json:"error" enums:"not_found" example:"not_found" binding:"required"`
}

// ServerError はサーバー内部エラーを表す（500 Internal Server Error）
// @Description サーバー内部でエラーが発生した場合のエラーレスポンス
type ServerError struct {
	// エラー種別の識別子
	Error string `json:"error" enums:"internal_server_error" example:"internal_server_error" binding:"required"`
}
