package main

import (
	"log"
	"os"
	"strings"

	"forum_asisten/config"
	"forum_asisten/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env (for development)
	// In production, these should be set in the environment
	_ = godotenv.Load()

	// Initialize database
	config.InitDB()

	// Set up Gin router
	r := gin.Default()

	// Get allowed origins from environment
	allowedOrigins := getOriginsFromEnv()

	// CORS configuration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	routes.SetupRoutes(r)

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Run server
	log.Printf("Server running on port %s", port)
	log.Printf("Allowed origins: %v", allowedOrigins)
	r.Run(":" + port)
}

func getOriginsFromEnv() []string {
	// Default origins for development
	defaultOrigins := []string{
		"http://localhost:5173", 
		"http://localhost:5174",
	}

	// Get additional origins from environment
	envOrigins := os.Getenv("ALLOWED_ORIGINS")
	if envOrigins == "" {
		return defaultOrigins
	}

	// Split multiple origins separated by comma
	var origins []string
	for _, origin := range strings.Split(envOrigins, ",") {
		trimmed := strings.TrimSpace(origin)
		if trimmed != "" {
			origins = append(origins, trimmed)
		}
	}

	return append(defaultOrigins, origins...)
}