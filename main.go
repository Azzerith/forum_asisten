package main

import (
	"forum_asisten/config"
	"forum_asisten/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	config.InitDB()
	routes.SetupRoutes(r)
	r.Run(":8080")
}
