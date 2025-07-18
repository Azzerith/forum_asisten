package controllers

import (
	"forum_asisten/config"
	"forum_asisten/models"
	"forum_asisten/utils"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

type RegisterInput struct {
	Nama     string  `json:"nama" binding:"required"`
	Email    string  `json:"email" binding:"required,email"`
	Password string  `json:"password" binding:"required"`
	NIM      *string `json:"nim,omitempty"`
	Telepon  *string `json:"telepon,omitempty"`
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	// if input.Role != "asisten" && input.Role != "admin" {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "Role tidak valid"})
	// 	return
	// }

	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal hash password"})
		return
	}

	user := models.User{
		Nama:     input.Nama,
		Email:    input.Email,
		Password: hashedPassword,
		Role:     "asisten",
		NIM:      input.NIM,
		Telepon:  input.Telepon,
		Status:   "non-aktif",
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
			"id":     user.ID,
			"nama":   user.Nama,
			"email":  user.Email,
			"nim":    user.NIM,
			"role":   user.Role,
			"status": user.Status,
			"photo":  user.Photo,
			"telepon":user.Telepon,
		},
		"message": "User berhasil dibuat",
        "success": true,
	})
}

func GetUsers(c *gin.Context) {
	var users []models.User
	if err := config.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data user"})
		return
	}
	c.JSON(http.StatusOK, users)
}

func GetUserByID(c *gin.Context) {
    id := c.Param("id")
    
    var user models.User
    if err := config.DB.First(&user, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error":   "User tidak ditemukan",
            "message": "Tidak ada user dengan ID tersebut",
        })
        return
    }
    
    // You might want to omit sensitive fields like password
    responseUser := gin.H{
        "id":      user.ID,
        "nama":    user.Nama,
        "email":   user.Email,
        "nim":     user.NIM,
        "telepon": user.Telepon,
        "role":    user.Role,
        "status":  user.Status,
        "photo":   user.Photo,
    }
    
    c.JSON(http.StatusOK, gin.H{
        "data":    responseUser,
        "message": "User ditemukan",
        "success": true,
    })
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var input models.User

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	if err := config.DB.Model(&user).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User berhasil diperbarui"})
}

func UpdateUserAsisten(c *gin.Context) {
    id := c.Param("id")
    
    // Get the existing user first
    var user models.User
    if err := config.DB.First(&user, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
        return
    }

    // Parse form data (support both multipart and urlencoded)
    if err := c.Request.ParseMultipartForm(10 << 20); err != nil && err != http.ErrNotMultipart {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal parsing form data"})
        return
    }

    // Handle text fields
    updatedData := map[string]interface{}{
        "nama":    c.PostForm("nama"),
        "email":   c.PostForm("email"),
        "nim":     c.PostForm("nim"),
        "telepon": c.PostForm("telepon"),
    }

    // Handle photo - bisa berupa file upload atau URL string
    photoUrl := c.PostForm("photo") // Untuk URL dari Cloudinary
    
    // Jika ada file upload, proses upload lokal
    file, header, err := c.Request.FormFile("photo")
    if err == nil {
        defer file.Close()

        // Create uploads directory if not exists
        if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat direktori"})
            return
        }

        // Create a new file in the uploads directory
        filename := "user_" + id + filepath.Ext(header.Filename)
        dst, err := os.Create(filepath.Join("uploads", filename))
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file"})
            return
        }
        defer dst.Close()

        // Copy the uploaded file to the filesystem
        if _, err := io.Copy(dst, file); err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyalin file"})
            return
        }

        // Update photo path in database
        photoPath := "/uploads/" + filename
        updatedData["photo"] = photoPath
    } else if photoUrl != "" {
        // Jika ada URL dari Cloudinary, gunakan itu
        updatedData["photo"] = photoUrl
    }

    // Update the user in database
    if err := config.DB.Model(&user).Updates(updatedData).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui user"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "User berhasil diperbarui",
        "data":    user,
    })
}

// Tambahkan endpoint khusus untuk update status
func UpdateUserStatus(c *gin.Context) {
    id := c.Param("id")
    
    // Struct khusus untuk menerima input status
    var input struct {
        Status string `json:"status" binding:"required,oneof=aktif non-aktif"`
    }
    
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Status harus diisi dengan 'aktif' atau 'non-aktif'"})
        return
    }
    
    var user models.User
    if err := config.DB.First(&user, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
        return
    }
    
    // Normalisasi status ke lowercase
    normalizedStatus := strings.ToLower(input.Status)
    
    // Update hanya field status
    if err := config.DB.Model(&user).Update("status", normalizedStatus).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui status user"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Status user berhasil diperbarui",
        "status":  normalizedStatus,
    })
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.User{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User berhasil dihapus"})
}