package mock

import (
	"errors"
	"go-shisha-backend/internal/models"
)

/**
 * PostRepositoryMock is an in-memory mock implementation of PostRepository
 */
type PostRepositoryMock struct {
	posts  []models.Post
	nextID int
}

/**
 * NewPostRepositoryMock creates a new mock post repository with sample data
 */
func NewPostRepositoryMock() *PostRepositoryMock {
	flavorID1 := 1
	flavorID2 := 2
	flavorID3 := 3
	flavorID4 := 4
	flavorID5 := 5
	flavorID6 := 6
	
	return &PostRepositoryMock{
		posts: []models.Post{
			{
				ID:       1,
				UserID:   1,
				Message:  "今日のシーシャは最高でした！ミント系のフレーバーが爽やかで最高",
				ImageURL: "/images/264971_0.jpg",
				Likes:    12,
				User: models.User{
					ID:          1,
					Email:       "test@example.com",
					DisplayName: "テストユーザー",
					Description: "シーシャ大好き！",
					IconURL:     "",
					ExternalURL: "",
				},
				FlavorID: &flavorID1,
				Flavor:   &mockFlavors[0],
			},
			{
				ID:       2,
				UserID:   2,
				Message:  "新しいお店を発見！雰囲気も良くて味も抜群でした",
				ImageURL: "/images/264972_0.jpg",
				Likes:    8,
				User: models.User{
					ID:          2,
					Email:       "shisha@example.com",
					DisplayName: "シーシャマスター",
					Description: "毎日シーシャ吸ってます",
					IconURL:     "",
					ExternalURL: "https://twitter.com/shishamaster",
				},
				FlavorID: &flavorID2,
				Flavor:   &mockFlavors[1],
			},
			{
				ID:       3,
				UserID:   1,
				Message:  "ベリーの酸味がたまらない。ミックスもいいかも。",
				ImageURL: "/images/264977_0.jpg",
				Likes:    22,
				User: models.User{
					ID:          1,
					Email:       "test@example.com",
					DisplayName: "テストユーザー",
					Description: "シーシャ大好き！",
					IconURL:     "",
					ExternalURL: "",
				},
				FlavorID: &flavorID3,
				Flavor:   &mockFlavors[2],
			},
			{
				ID:       4,
				UserID:   2,
				Message:  "マンゴーのトロピカル感が最高！ 夏にぴったり。",
				ImageURL: "/images/264974_0.jpg",
				Likes:    15,
				User: models.User{
					ID:          2,
					Email:       "shisha@example.com",
					DisplayName: "シーシャマスター",
					Description: "毎日シーシャ吸ってます",
					IconURL:     "",
					ExternalURL: "https://twitter.com/shishamaster",
				},
				FlavorID: &flavorID4,
				Flavor:   &mockFlavors[3],
			},
			{
				ID:       5,
				UserID:   1,
				Message:  "オレンジの爽やかさがいい感じ。リフレッシュできる〜",
				ImageURL: "/images/264975_0.jpg",
				Likes:    18,
				User: models.User{
					ID:          1,
					Email:       "test@example.com",
					DisplayName: "テストユーザー",
					Description: "シーシャ大好き！",
					IconURL:     "",
					ExternalURL: "",
				},
				FlavorID: &flavorID5,
				Flavor:   &mockFlavors[4],
			},
			{
				ID:       6,
				UserID:   2,
				Message:  "グレープの濃厚な味わい。フルーツ系の中でも特におすすめ！",
				ImageURL: "/images/264976_0.jpg",
				Likes:    25,
				User: models.User{
					ID:          2,
					Email:       "shisha@example.com",
					DisplayName: "シーシャマスター",
					Description: "毎日シーシャ吸ってます",
					IconURL:     "",
					ExternalURL: "https://twitter.com/shishamaster",
				},
				FlavorID: &flavorID6,
				Flavor:   &mockFlavors[5],
			},
		},
		nextID: 7,
	}
}

/**
 * GetAll returns all posts
 */
func (r *PostRepositoryMock) GetAll() ([]models.Post, error) {
	return r.posts, nil
}

/**
 * GetByID returns a post by ID
 */
func (r *PostRepositoryMock) GetByID(id int) (*models.Post, error) {
	for i := range r.posts {
		if r.posts[i].ID == id {
			return &r.posts[i], nil
		}
	}
	return nil, errors.New("post not found")
}

/**
 * Create creates a new post
 */
func (r *PostRepositoryMock) Create(post *models.Post) error {
	post.ID = r.nextID
	post.Likes = 0
	
	r.posts = append(r.posts, *post)
	r.nextID++
	
	return nil
}

/**
 * IncrementLikes increments the like count for a post
 */
func (r *PostRepositoryMock) IncrementLikes(id int) (*models.Post, error) {
	for i := range r.posts {
		if r.posts[i].ID == id {
			r.posts[i].Likes++
			return &r.posts[i], nil
		}
	}
	return nil, errors.New("post not found")
}

/**
 * GetByUserID returns all posts by a specific user
 */
func (r *PostRepositoryMock) GetByUserID(userID int) ([]models.Post, error) {
	var userPosts []models.Post
	for _, post := range r.posts {
		if post.UserID == userID {
			userPosts = append(userPosts, post)
		}
	}
	return userPosts, nil
}
