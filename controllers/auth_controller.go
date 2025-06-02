package controllers

import (
	"fmt"
	"forum_asisten/config"
	"forum_asisten/models"
	"forum_asisten/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

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
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format input salah"})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email tidak ditemukan"})
		return
	}

	if !utils.CheckPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Password salah"})
		fmt.Println("Password input:", input.Password)
fmt.Println("Password stored:", user.Password)
		return
	}

	token, err := utils.GenerateJWT(user.ID, user.Email ,user.Nama, *user.NIM, user.Role)
if err != nil {
	c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal generate token"})
	return
}



	c.JSON(http.StatusOK, gin.H{"token": token})
}
