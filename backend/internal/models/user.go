package models

// User represents a user in the system
type User struct {
	ID          int    `json:"id"`
	Email       string `json:"email"`
	DisplayName string `json:"display_name"`
	Description string `json:"description"`
	IconURL     string `json:"icon_url"`
	ExternalURL string `json:"external_url"`
}

// UsersResponse represents the response for user list
type UsersResponse struct {
	Users []User `json:"users"`
	Total int    `json:"total"`
}
