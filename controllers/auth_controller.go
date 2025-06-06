package controllers

import (
	"forum_asisten/config"
	"forum_asisten/models"
	"forum_asisten/utils"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

// type LoginInput struct {
// 	Email    string `json:"email"`
// 	Password string `json:"password"`
// }

type RegisterInput struct {
	Nama     string  `json:"nama" binding:"required"`
	Email    string  `json:"email" binding:"required,email"`
	Password string  `json:"password" binding:"required"`
	Role     string  `json:"role" binding:"required"`
	NIM      *string `json:"nim,omitempty"`
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	if input.Role != "asisten" && input.Role != "admin" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role tidak valid"})
		return
	}

	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal hash password"})
		return
	}

	// Buat objek User dari input
	user := models.User{
		Nama:     input.Nama,
		Email:    input.Email,
		Password: hashedPassword,
		Role:     input.Role,
		NIM:      input.NIM,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User berhasil dibuat"})
}



func Login(c *gin.Context) {
	var input struct {
		Identifier string `json:"identifier" binding:"required"`
		Password   string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format input salah"})
		return
	}

	var user models.User

	// Simple check apakah identifier itu email dengan regex
	isEmail := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`).MatchString(input.Identifier)

	var err error
	if isEmail {
		err = config.DB.Where("email = ?", strings.ToLower(input.Identifier)).First(&user).Error
	} else {
		err = config.DB.Where("nim = ?", input.Identifier).First(&user).Error
	}

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau NIM tidak ditemukan"})
		return
	}

	if !utils.CheckPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Password salah"})
		return
	}

	nim := ""
	if user.NIM != nil {
		nim = *user.NIM
	}

	token, err := utils.GenerateJWT(user.ID, user.Email, user.Nama, nim, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":    user.ID,
			"nama":  user.Nama,
			"email": user.Email,
			"nim":   user.NIM,
			"role":  user.Role,
		},
	})
}
