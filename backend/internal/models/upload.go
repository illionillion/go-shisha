package models

// UploadImagesResponse 画像アップロードレスポンス
type UploadImagesResponse struct {
	URLs []string `json:"urls" example:"/images/20260129_abc123.jpg,/images/20260129_def456.png"`
}
