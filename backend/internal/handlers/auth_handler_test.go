package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"go-shisha-backend/internal/models"
	"go-shisha-backend/internal/repositories"
	"go-shisha-backend/internal/services"

	"github.com/gin-gonic/gin"
)

func init() {
	_ = os.Setenv("JWT_SECRET", "test-secret-key-for-testing-purpose-at-least-64-characters-long")
	gin.SetMode(gin.TestMode)
}

// Mock repository for testing
type mockAuthUserRepoForHandler struct {
	users map[string]*models.User
}

func newMockAuthUserRepoForHandler() *mockAuthUserRepoForHandler {
	return &mockAuthUserRepoForHandler{
		users: make(map[string]*models.User),
	}
}

func (m *mockAuthUserRepoForHandler) GetByEmail(email string) (*models.User, error) {
	if user, exists := m.users[email]; exists {
		return user, nil
	}
	return nil, errors.New("user not found")
}

func (m *mockAuthUserRepoForHandler) Create(user *models.User) error {
	if _, exists := m.users[user.Email]; exists {
		return repositories.ErrEmailAlreadyExists
	}
	user.ID = len(m.users) + 1
	m.users[user.Email] = user
	return nil
}

func (m *mockAuthUserRepoForHandler) GetByID(id int) (*models.User, error) {
	for _, user := range m.users {
		if user.ID == id {
			return user, nil
		}
	}
	return nil, errors.New("user not found")
}

type mockRefreshTokenRepoForHandler struct {
	tokens map[int64]string
}

func newMockRefreshTokenRepoForHandler() *mockRefreshTokenRepoForHandler {
	return &mockRefreshTokenRepoForHandler{
		tokens: make(map[int64]string),
	}
}

func (m *mockRefreshTokenRepoForHandler) Create(token *models.RefreshToken, rawToken string) error {
	m.tokens[token.UserID] = rawToken
	return nil
}

func (m *mockRefreshTokenRepoForHandler) FindByTokenHash(rawToken string) (*models.RefreshToken, error) {
	for userID, storedToken := range m.tokens {
		if storedToken == rawToken {
			return &models.RefreshToken{UserID: userID}, nil
		}
	}
	return nil, errors.New("token not found")
}

func (m *mockRefreshTokenRepoForHandler) UpdateLastUsed(id int64) error {
	return nil
}

func (m *mockRefreshTokenRepoForHandler) DeleteByUserID(userID int64) error {
	delete(m.tokens, userID)
	return nil
}

func (m *mockRefreshTokenRepoForHandler) DeleteExpired() error {
	// テスト用の実装は不要（何もしない）
	return nil
}

func TestAuthHandler_Register_Success(t *testing.T) {
	userRepo := newMockAuthUserRepoForHandler()
	tokenRepo := newMockRefreshTokenRepoForHandler()
	authService := services.NewAuthService(userRepo, tokenRepo)
	handler := NewAuthHandler(authService)

	r := gin.New()
	r.POST("/register", handler.Register)

	input := models.CreateUserInput{
		Email:       "test@example.com",
		Password:    "password123456",
		DisplayName: "Test User",
	}
	body, _ := json.Marshal(input)

	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Errorf("expected status 201, got %d", w.Code)
	}

	var response models.AuthResponse
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("failed to unmarshal response: %v", err)
	}

	if response.User.Email != input.Email {
		t.Errorf("expected email %s, got %s", input.Email, response.User.Email)
	}
}

func TestAuthHandler_Register_InvalidJSON(t *testing.T) {
	userRepo := newMockAuthUserRepoForHandler()
	tokenRepo := newMockRefreshTokenRepoForHandler()
	authService := services.NewAuthService(userRepo, tokenRepo)
	handler := NewAuthHandler(authService)

	r := gin.New()
	r.POST("/register", handler.Register)

	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewReader([]byte("invalid json")))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status 400, got %d", w.Code)
	}
}

func TestAuthHandler_Register_EmailAlreadyExists(t *testing.T) {
	userRepo := newMockAuthUserRepoForHandler()
	tokenRepo := newMockRefreshTokenRepoForHandler()
	authService := services.NewAuthService(userRepo, tokenRepo)
	handler := NewAuthHandler(authService)

	// 事前にユーザーを登録
	user := &models.User{Email: "existing@example.com", DisplayName: "Existing"}
	_ = user.HashPassword("password123456")
	_ = userRepo.Create(user)

	r := gin.New()
	r.POST("/register", handler.Register)

	input := models.CreateUserInput{
		Email:       "existing@example.com",
		Password:    "password123456",
		DisplayName: "New User",
	}
	body, _ := json.Marshal(input)

	req := httptest.NewRequest(http.MethodPost, "/register", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusConflict {
		t.Errorf("expected status 409, got %d", w.Code)
	}
}

func TestAuthHandler_Login_Success(t *testing.T) {
	userRepo := newMockAuthUserRepoForHandler()
	tokenRepo := newMockRefreshTokenRepoForHandler()
	authService := services.NewAuthService(userRepo, tokenRepo)
	handler := NewAuthHandler(authService)

	// 事前にユーザーを登録
	user := &models.User{Email: "login@example.com", DisplayName: "Login User"}
	_ = user.HashPassword("password123456")
	_ = userRepo.Create(user)

	r := gin.New()
	r.POST("/login", handler.Login)

	input := models.LoginInput{
		Email:    "login@example.com",
		Password: "password123456",
	}
	body, _ := json.Marshal(input)

	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", w.Code)
	}

	// Cookie設定を検証
	cookies := w.Result().Cookies()
	var hasAccessToken, hasRefreshToken bool
	for _, cookie := range cookies {
		if cookie.Name == "access_token" {
			hasAccessToken = true
			if !cookie.HttpOnly {
				t.Error("access_token should be HttpOnly")
			}
			if cookie.SameSite != http.SameSiteLaxMode {
				t.Error("access_token should have SameSite=Lax")
			}
		}
		if cookie.Name == "refresh_token" {
			hasRefreshToken = true
			if !cookie.HttpOnly {
				t.Error("refresh_token should be HttpOnly")
			}
			if cookie.SameSite != http.SameSiteLaxMode {
				t.Error("refresh_token should have SameSite=Lax")
			}
		}
	}

	if !hasAccessToken {
		t.Error("access_token cookie not found")
	}
	if !hasRefreshToken {
		t.Error("refresh_token cookie not found")
	}
}

func TestAuthHandler_Login_InvalidPassword(t *testing.T) {
	userRepo := newMockAuthUserRepoForHandler()
	tokenRepo := newMockRefreshTokenRepoForHandler()
	authService := services.NewAuthService(userRepo, tokenRepo)
	handler := NewAuthHandler(authService)

	// 事前にユーザーを登録
	user := &models.User{Email: "test@example.com", DisplayName: "Test"}
	_ = user.HashPassword("password123456")
	_ = userRepo.Create(user)

	r := gin.New()
	r.POST("/login", handler.Login)

	input := models.LoginInput{
		Email:    "test@example.com",
		Password: "wrongpassword",
	}
	body, _ := json.Marshal(input)

	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", w.Code)
	}
}

func TestAuthHandler_Login_UserNotFound(t *testing.T) {
	userRepo := newMockAuthUserRepoForHandler()
	tokenRepo := newMockRefreshTokenRepoForHandler()
	authService := services.NewAuthService(userRepo, tokenRepo)
	handler := NewAuthHandler(authService)

	r := gin.New()
	r.POST("/login", handler.Login)

	input := models.LoginInput{
		Email:    "notfound@example.com",
		Password: "password123456",
	}
	body, _ := json.Marshal(input)

	req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", w.Code)
	}
}

func TestAuthHandler_Login_ValidationError(t *testing.T) {
	userRepo := newMockAuthUserRepoForHandler()
	tokenRepo := newMockRefreshTokenRepoForHandler()
	authService := services.NewAuthService(userRepo, tokenRepo)
	handler := NewAuthHandler(authService)

	r := gin.New()
	r.POST("/login", handler.Login)

	testCases := []struct {
		name  string
		input interface{}
	}{
		{"Missing email", map[string]string{"password": "password123456"}},
		{"Missing password", map[string]string{"email": "test@example.com"}},
		{"Invalid email format", map[string]string{"email": "invalid-email", "password": "password123456"}},
		{"Empty JSON", map[string]string{}},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			body, _ := json.Marshal(tc.input)
			req := httptest.NewRequest(http.MethodPost, "/login", bytes.NewReader(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != http.StatusBadRequest {
				t.Errorf("%s: expected status 400, got %d", tc.name, w.Code)
			}
		})
	}
}
