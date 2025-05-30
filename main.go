package main

import (
	"log"

	"forum_asisten/config"
	"forum_asisten/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables from .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("Gagal memuat file .env")
	}

	// Initialize database
	config.InitDB()

	// Set up Gin router
	r := gin.Default()
	routes.SetupRoutes(r)

	// Run server
	r.Run(":8080")
}
