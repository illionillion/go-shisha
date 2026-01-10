package logging

import (
	"log/slog"
	"os"
	"strings"
)

// L is the package-level structured logger used across the backend.
var L *slog.Logger

// Init initializes the global logger with the specified environment and log level.
// env: "production" or "development"
// logLevel: "DEBUG", "INFO", "WARN", "ERROR" (defaults to INFO if invalid)
func Init(env, logLevel string) {
	var handler slog.Handler
	var level slog.Level

	// Parse log level
	switch strings.ToUpper(logLevel) {
	case "DEBUG":
		level = slog.LevelDebug
	case "INFO":
		level = slog.LevelInfo
	case "WARN":
		level = slog.LevelWarn
	case "ERROR":
		level = slog.LevelError
	default:
		level = slog.LevelInfo
	}

	opts := &slog.HandlerOptions{
		Level: level,
	}

	if env == "production" {
		// JSON format for production (machine-readable)
		handler = slog.NewJSONHandler(os.Stdout, opts)
	} else {
		// Text format for development (human-readable)
		handler = slog.NewTextHandler(os.Stdout, opts)
	}

	L = slog.New(handler)
}

func init() {
	// Initialize logger based on environment variables with sensible defaults.
	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development"
	}

	level := os.Getenv("LOG_LEVEL")
	if level == "" {
		level = "DEBUG"
	}

	Init(env, level)
}
