package logging

import (
	"log"
	"os"
)

// L is the package-level logger used across the backend.
var L *log.Logger

func init() {
	// include date, time and microseconds for better tracing
	L = log.New(os.Stdout, "", log.LstdFlags|log.Lmicroseconds)
}
