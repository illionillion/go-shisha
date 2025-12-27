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
	
	return &PostRepositoryMock{
		       posts: []models.Post{
			       {
				       ID:       1,
				       UserID:   1,
				       Message:  "今日のシーシャは最高でした！ミント系のフレーバーが爽やかで最高",
				       Slides: []models.Slide{
					       {ImageURL: "/images/264971_0.jpg", Text: "最初はミント。爽やかでスッキリ！", Flavor: &mockFlavors[0]},
					       {ImageURL: "/images/264972_0.jpg", Text: "次はダブルアップル。甘さが絶妙", Flavor: &mockFlavors[1]},
					       {ImageURL: "/images/264973_0.jpg", Text: "最後はレモン。締めにぴったり", Flavor: &mockFlavors[2]},
				       },
					   Likes:    12,
					   IsLiked:  false,
					   User: models.User{
					   ID:          1,
					   Email:       "test@example.com",
					   DisplayName: "テストユーザー",
					   Description: "シーシャ大好き！",
					   IconURL:     "https://i.pravatar.cc/80?img=11",
					   ExternalURL: "",
					   },
			       },
			       {
				       ID:       2,
				       UserID:   2,
				       Message:  "新しいお店を発見！雰囲気も良くて味も抜群でした",
				       Slides: []models.Slide{
					       {ImageURL: "/images/264974_0.jpg", Text: "グレープの濃厚な香り", Flavor: &mockFlavors[3]},
					       {ImageURL: "/images/264975_0.jpg", Text: "オレンジでリフレッシュ", Flavor: &mockFlavors[4]},
				       },
					   Likes:    8,
					   IsLiked:  false,
					   User: models.User{
					   ID:          2,
					   Email:       "shisha@example.com",
					   DisplayName: "シーシャマスター",
					   Description: "毎日シーシャ吸ってます",
					   IconURL:     "https://i.pravatar.cc/80?img=12",
					   ExternalURL: "https://twitter.com/shishamaster",
					   },
			       },
			       {
				       ID:       3,
				       UserID:   1,
				       Message:  "ベリーの酸味がたまらない。ミックスもいいかも。",
				       Slides: []models.Slide{
					       {ImageURL: "/images/264977_0.jpg", Text: "ベリー単体で味わい深い", Flavor: &mockFlavors[2]},
				       },
					   Likes:    22,
					   IsLiked:  false,
					   User: models.User{
					   ID:          1,
					   Email:       "test@example.com",
					   DisplayName: "テストユーザー",
					   Description: "シーシャ大好き！",
					   IconURL:     "https://i.pravatar.cc/80?img=11",
					   ExternalURL: "",
					   },
			       },
			       {
				       ID:       4,
				       UserID:   2,
				       Message:  "マンゴーのトロピカル感が最高！ 夏にぴったり。",
				       Slides: []models.Slide{
					       {ImageURL: "/images/264978_0.jpg", Text: "マンゴーで夏気分", Flavor: &mockFlavors[5]},
					       {ImageURL: "/images/264979_0.jpg", Text: "ミントでクールダウン", Flavor: &mockFlavors[0]},
				       },
					   Likes:    15,
					   IsLiked:  false,
					   User: models.User{
					   ID:          2,
					   Email:       "shisha@example.com",
					   DisplayName: "シーシャマスター",
					   Description: "毎日シーシャ吸ってます",
					   IconURL:     "https://i.pravatar.cc/80?img=12",
					   ExternalURL: "https://twitter.com/shishamaster",
					   },
			       },
			       {
				       ID:       5,
				       UserID:   1,
				       Message:  "オレンジの爽やかさがいい感じ。リフレッシュできる〜",
				       Slides: []models.Slide{
					       {ImageURL: "/images/264975_0.jpg", Text: "オレンジで元気チャージ", Flavor: &mockFlavors[4]},
				       },
					   Likes:    18,
					   IsLiked:  false,
					   User: models.User{
					   ID:          1,
					   Email:       "test@example.com",
					   DisplayName: "テストユーザー",
					   Description: "シーシャ大好き！",
					   IconURL:     "https://i.pravatar.cc/80?img=11",
					   ExternalURL: "",
					   },
			       },
			       {
				       ID:       6,
				       UserID:   2,
				       Message:  "グレープの濃厚な味わい。フルーツ系の中でも特におすすめ！",
				       Slides: []models.Slide{
					       {ImageURL: "/images/264976_0.jpg", Text: "グレープで濃厚な一服", Flavor: &mockFlavors[3]},
					       {ImageURL: "/images/264977_0.jpg", Text: "レモンでさっぱり", Flavor: &mockFlavors[2]},
				       },
					   Likes:    25,
					   IsLiked:  false,
				       User: models.User{
					       ID:          2,
					       Email:       "shisha@example.com",
					       DisplayName: "シーシャマスター",
					       Description: "毎日シーシャ吸ってます",
					       IconURL:     "",
					       ExternalURL: "https://twitter.com/shishamaster",
				       },
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
			// when liking via this mock endpoint, mark as liked
			r.posts[i].IsLiked = true
			return &r.posts[i], nil
		}
	}
	return nil, errors.New("post not found")
}

/**
 * DecrementLikes decrements the like count for a post
 */
func (r *PostRepositoryMock) DecrementLikes(id int) (*models.Post, error) {
	for i := range r.posts {
		if r.posts[i].ID == id {
			if r.posts[i].Likes > 0 {
				r.posts[i].Likes--
			}
			// when unliking via this mock endpoint, mark as not liked
			r.posts[i].IsLiked = false
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
