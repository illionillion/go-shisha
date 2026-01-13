package services

import (
	"errors"
	"testing"
	"time"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/pkg/auth"

	"gorm.io/gorm"
)

// mockAuthUserRepo はUserRepositoryのモック
type mockAuthUserRepo struct {
	users map[string]*models.User
}

func newMockAuthUserRepo() *mockAuthUserRepo {
	return &mockAuthUserRepo{
		users: make(map[string]*models.User),
	}
}

func (m *mockAuthUserRepo) GetByEmail(email string) (*models.User, error) {
	if user, exists := m.users[email]; exists {
		return user, nil
	}
	return nil, errors.New("user not found")
}

func (m *mockAuthUserRepo) Create(user *models.User) error {
	if _, exists := m.users[user.Email]; exists {
		return errors.New("email already exists")
	}
	user.ID = len(m.users) + 1
	m.users[user.Email] = user
	return nil
}

func (m *mockAuthUserRepo) GetByID(id int) (*models.User, error) {
	for _, user := range m.users {
		if user.ID == id {
			return user, nil
		}
	}
	return nil, errors.New("user not found")
}

func (m *mockAuthUserRepo) GetAll() ([]models.User, error) {
	return nil, nil
}

// mockRefreshTokenRepo はRefreshTokenRepositoryのモック
type mockRefreshTokenRepo struct {
	tokens map[string]*models.RefreshToken
}

func newMockRefreshTokenRepo() *mockRefreshTokenRepo {
	return &mockRefreshTokenRepo{
		tokens: make(map[string]*models.RefreshToken),
	}
}

func (m *mockRefreshTokenRepo) Create(token *models.RefreshToken, rawToken string) error {
	token.ID = int64(len(m.tokens) + 1)
	m.tokens[rawToken] = token
	return nil
}

func (m *mockRefreshTokenRepo) FindByTokenHash(rawToken string) (*models.RefreshToken, error) {
	if token, exists := m.tokens[rawToken]; exists {
		if token.ExpiresAt.After(time.Now()) {
			return token, nil
		}
		return nil, errors.New("token expired")
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockRefreshTokenRepo) UpdateLastUsed(id int64) error {
	for _, token := range m.tokens {
		if token.ID == id {
			now := time.Now()
			token.LastUsedAt = &now
			return nil
		}
	}
	return errors.New("token not found")
}

func (m *mockRefreshTokenRepo) DeleteByUserID(userID int64) error {
	for key, token := range m.tokens {
		if token.UserID == userID {
			delete(m.tokens, key)
		}
	}
	return nil
}

func (m *mockRefreshTokenRepo) DeleteExpired() error {
	return nil
}

func TestRegister(t *testing.T) {
	userRepo := newMockAuthUserRepo()
	tokenRepo := newMockRefreshTokenRepo()
	svc := NewAuthService(userRepo, tokenRepo)

	t.Run("正常系: ユーザー登録成功", func(t *testing.T) {
		input := &models.CreateUserInput{
			Email:       "test@example.com",
			Password:    "password123",
			DisplayName: "Test User",
		}

		user, err := svc.Register(input)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if user.Email != input.Email {
			t.Fatalf("expected email %s, got %s", input.Email, user.Email)
		}
		if user.DisplayName != input.DisplayName {
			t.Fatalf("expected display_name %s, got %s", input.DisplayName, user.DisplayName)
		}
		if user.ID == 0 {
			t.Fatal("expected user ID to be set")
		}
	})

	t.Run("異常系: メールアドレス重複", func(t *testing.T) {
		input := &models.CreateUserInput{
			Email:       "test@example.com",
			Password:    "password123",
			DisplayName: "Duplicate User",
		}

		_, err := svc.Register(input)
		if err == nil {
			t.Fatal("expected error for duplicate email, got nil")
		}
		if err.Error() != "email already exists" {
			t.Fatalf("expected 'email already exists' error, got %v", err)
		}
	})
}

func TestLogin(t *testing.T) {
	userRepo := newMockAuthUserRepo()
	tokenRepo := newMockRefreshTokenRepo()
	svc := NewAuthService(userRepo, tokenRepo)

	// テスト用ユーザーを事前登録
	registerInput := &models.CreateUserInput{
		Email:       "login@example.com",
		Password:    "password123",
		DisplayName: "Login User",
	}
	_, err := svc.Register(registerInput)
	if err != nil {
		t.Fatalf("failed to register test user: %v", err)
	}

	t.Run("正常系: ログイン成功", func(t *testing.T) {
		loginInput := &models.LoginInput{
			Email:    "login@example.com",
			Password: "password123",
		}

		user, accessToken, refreshToken, err := svc.Login(loginInput)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if user.Email != loginInput.Email {
			t.Fatalf("expected email %s, got %s", loginInput.Email, user.Email)
		}
		if accessToken == "" {
			t.Fatal("expected access token to be set")
		}
		if refreshToken == "" {
			t.Fatal("expected refresh token to be set")
		}

		// トークンが検証可能か確認
		claims, err := auth.ValidateToken(accessToken)
		if err != nil {
			t.Fatalf("expected valid access token, got error: %v", err)
		}
		if claims.UserID != int64(user.ID) {
			t.Fatalf("expected user ID %d in token, got %d", user.ID, claims.UserID)
		}
	})

	t.Run("異常系: パスワード不一致", func(t *testing.T) {
		loginInput := &models.LoginInput{
			Email:    "login@example.com",
			Password: "wrongpassword",
		}

		_, _, _, err := svc.Login(loginInput)
		if err == nil {
			t.Fatal("expected error for wrong password, got nil")
		}
		if err.Error() != "invalid email or password" {
			t.Fatalf("expected 'invalid email or password' error, got %v", err)
		}
	})

	t.Run("異常系: ユーザーが存在しない", func(t *testing.T) {
		loginInput := &models.LoginInput{
			Email:    "notfound@example.com",
			Password: "password123",
		}

		_, _, _, err := svc.Login(loginInput)
		if err == nil {
			t.Fatal("expected error for non-existent user, got nil")
		}
		if err.Error() != "invalid email or password" {
			t.Fatalf("expected 'invalid email or password' error, got %v", err)
		}
	})
}

func TestRefresh(t *testing.T) {
	userRepo := newMockAuthUserRepo()
	tokenRepo := newMockRefreshTokenRepo()
	svc := NewAuthService(userRepo, tokenRepo)

	// テスト用ユーザーを事前登録してログイン
	registerInput := &models.CreateUserInput{
		Email:       "refresh@example.com",
		Password:    "password123",
		DisplayName: "Refresh User",
	}
	_, err := svc.Register(registerInput)
	if err != nil {
		t.Fatalf("failed to register test user: %v", err)
	}

	loginInput := &models.LoginInput{
		Email:    "refresh@example.com",
		Password: "password123",
	}
	_, _, refreshToken, err := svc.Login(loginInput)
	if err != nil {
		t.Fatalf("failed to login test user: %v", err)
	}

	t.Run("正常系: トークンリフレッシュ成功", func(t *testing.T) {
		newAccessToken, err := svc.Refresh(refreshToken)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if newAccessToken == "" {
			t.Fatal("expected new access token to be set")
		}

		// 新しいトークンが検証可能か確認
		_, err = auth.ValidateToken(newAccessToken)
		if err != nil {
			t.Fatalf("expected valid new access token, got error: %v", err)
		}
	})

	t.Run("異常系: 無効なリフレッシュトークン", func(t *testing.T) {
		_, err := svc.Refresh("invalid-token")
		if err == nil {
			t.Fatal("expected error for invalid token, got nil")
		}
	})
}

func TestLogout(t *testing.T) {
	userRepo := newMockAuthUserRepo()
	tokenRepo := newMockRefreshTokenRepo()
	svc := NewAuthService(userRepo, tokenRepo)

	// テスト用ユーザーを事前登録してログイン
	registerInput := &models.CreateUserInput{
		Email:       "logout@example.com",
		Password:    "password123",
		DisplayName: "Logout User",
	}
	user, err := svc.Register(registerInput)
	if err != nil {
		t.Fatalf("failed to register test user: %v", err)
	}

	loginInput := &models.LoginInput{
		Email:    "logout@example.com",
		Password: "password123",
	}
	_, _, _, err = svc.Login(loginInput)
	if err != nil {
		t.Fatalf("failed to login test user: %v", err)
	}

	t.Run("正常系: ログアウト成功", func(t *testing.T) {
		err := svc.Logout(int64(user.ID))
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		// ログアウト後はリフレッシュトークンが削除されていることを確認
		if len(tokenRepo.tokens) != 0 {
			t.Fatal("expected all refresh tokens to be deleted")
		}
	})
}

func TestGetCurrentUser(t *testing.T) {
	userRepo := newMockAuthUserRepo()
	tokenRepo := newMockRefreshTokenRepo()
	svc := NewAuthService(userRepo, tokenRepo)

	// テスト用ユーザーを事前登録
	registerInput := &models.CreateUserInput{
		Email:       "current@example.com",
		Password:    "password123",
		DisplayName: "Current User",
	}
	registeredUser, err := svc.Register(registerInput)
	if err != nil {
		t.Fatalf("failed to register test user: %v", err)
	}

	t.Run("正常系: 現在のユーザー情報取得成功", func(t *testing.T) {
		user, err := svc.GetCurrentUser(registeredUser.ID)
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if user.ID != registeredUser.ID {
			t.Fatalf("expected user ID %d, got %d", registeredUser.ID, user.ID)
		}
		if user.Email != registeredUser.Email {
			t.Fatalf("expected email %s, got %s", registeredUser.Email, user.Email)
		}
	})

	t.Run("異常系: 存在しないユーザーID", func(t *testing.T) {
		_, err := svc.GetCurrentUser(9999)
		if err == nil {
			t.Fatal("expected error for non-existent user, got nil")
		}
	})
}
