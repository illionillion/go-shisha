package models

// Flavor represents a shisha flavor
type Flavor struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Color string `json:"color"`
}
