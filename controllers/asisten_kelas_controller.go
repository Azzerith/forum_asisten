package controllers

import (
	"forum_asisten/config"
	"forum_asisten/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func PilihJadwalAsisten(c *gin.Context) {
	// Ambil ID user dan role dari token
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID tidak ditemukan"})
		return
	}

	// Token user_id biasanya bertipe float64 saat di-unmarshal, perlu convert ke uint
	userIDFloat, ok := userIDVal.(float64)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID token tidak valid"})
		return
	}
	userID := uint(userIDFloat)

	// role := c.GetString("role")
	// if role != "asisten" {
	// 	c.JSON(http.StatusForbidden, gin.H{"error": "Hanya asisten yang dapat memilih jadwal"})
	// 	return
	// }

	// Input dari client hanya jadwal_id
	var input struct {
		JadwalID uint `json:"jadwal_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Cek apakah jadwal dengan ID tersebut ada di DB
	var jadwal models.Jadwal
	if err := config.DB.First(&jadwal, input.JadwalID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Jadwal tidak ditemukan"})
		return
	}

	// Ambil data user
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data pengguna"})
		return
	}

	// Cek apakah user sudah pernah memilih jadwal ini
	var existing models.AsistenKelas
	if err := config.DB.
		Where("jadwal_id = ? AND asisten_id = ?", input.JadwalID, userID).
		First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Jadwal sudah pernah dipilih"})
		return
	}

	// Buat record baru
	asistenKelas := models.AsistenKelas{
		JadwalID:  input.JadwalID,
		AsistenID: userID,
	}

	// Pastikan user.NIM tidak nil pointer
	// if user.Nama != nil {
	// 	asistenKelas.Nama = *user.Nama
	// }

	if err := config.DB.Create(&asistenKelas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memilih jadwal"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Berhasil memilih jadwal", "data": asistenKelas})
}

func AdminPilihJadwalAsisten(c *gin.Context) {
	var input struct {
		JadwalID  uint `json:"jadwal_id" binding:"required"`
		AsistenID uint `json:"asisten_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify schedule exists
	var jadwal models.Jadwal
	if err := config.DB.First(&jadwal, input.JadwalID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Schedule not found"})
		return
	}

	// Verify assistant exists
	var asisten models.User
	if err := config.DB.First(&asisten, input.AsistenID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Assistant not found"})
		return
	}

	// Check if assignment already exists
	var existing models.AsistenKelas
	if err := config.DB.
		Where("jadwal_id = ? AND asisten_id = ?", input.JadwalID, input.AsistenID).
		First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Assistant already assigned to this schedule"})
		return
	}

	// Create new assignment
	asistenKelas := models.AsistenKelas{
		JadwalID:  input.JadwalID,
		AsistenID: input.AsistenID,
	}

	if err := config.DB.Create(&asistenKelas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign assistant"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully assigned assistant to schedule",
		"data":    asistenKelas,
	})
}

func GetJadwalAsisten(c *gin.Context) {
	// userID := c.GetUint("user_id") // dari JWT
	var data []models.AsistenKelas

	if err := config.DB.Preload("Jadwal").Preload("User").Preload("Jadwal.MataKuliah.ProgramStudi").Preload("Jadwal.Dosen").
		Find(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
		return
	}

	c.JSON(http.StatusOK, data)
}

func GetJadwalAsistenById(c *gin.Context) {
    // Get user ID from path parameter
    userId := c.Param("user_id")
    if userId == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "User ID must be provided"})
        return
    }

    // Convert userID to uint
    userID, err := strconv.ParseUint(userId, 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
        return
    }

    var data []models.AsistenKelas

    // Query with proper joins and preloading
    if err := config.DB.
        Preload("Jadwal", func(db *gorm.DB) *gorm.DB {
            return db.Preload("MataKuliah.ProgramStudi").Preload("Dosen")
        }).
        Preload("User").
        Where("asisten_id = ?", uint(userID)).
        Find(&data).Error; err != nil {
            
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch data",
            "details": err.Error(),
        })
        return
    }

    // Handle empty result
    if len(data) == 0 {
        c.JSON(http.StatusOK, []models.AsistenKelas{})
        return
    }

    c.JSON(http.StatusOK, data)
}

func UpdateAsistenKelas(c *gin.Context) {
	id := c.Param("id")
	var data models.AsistenKelas

	if err := config.DB.First(&data, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data tidak ditemukan"})
		return
	}

	var input models.AsistenKelas
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	data.JadwalID = input.JadwalID
	data.AsistenID = input.AsistenID

	if err := config.DB.Save(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Berhasil diupdate", "data": data})
}

func DeleteAsistenFromJadwal(c *gin.Context) {
    jadwalID := c.Param("jadwal_id")
    asistenID := c.Param("asisten_id")

    // Convert IDs to uint
    jadwalIDUint, err := strconv.ParseUint(jadwalID, 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid jadwal ID"})
        return
    }

    asistenIDUint, err := strconv.ParseUint(asistenID, 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid asisten ID"})
        return
    }

    // Delete the record
    if err := config.DB.
        Where("jadwal_id = ? AND asisten_id = ?", jadwalIDUint, asistenIDUint).
        Delete(&models.AsistenKelas{}).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Asisten removed from jadwal"})
}