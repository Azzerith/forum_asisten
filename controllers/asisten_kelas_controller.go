package controllers

import (
	"forum_asisten/config"
	"forum_asisten/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func PilihJadwalAsisten(c *gin.Context) {
	// Ambil ID user dan role dari token
	userID := c.GetUint("user_id")
	role := c.GetString("role")

	if role != "asisten" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya asisten yang dapat memilih jadwal"})
		return
	}

	// Ambil hanya jadwal_id dari input JSON
	var input struct {
		JadwalID uint `json:"jadwal_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Ambil data NIM dari user yang sedang login
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data pengguna"})
		return
	}

	// Cek apakah user sudah pernah memilih jadwal ini sebelumnya
	var existing models.AsistenKelas
	if err := config.DB.
		Where("jadwal_id = ? AND asisten_id = ?", input.JadwalID, userID).
		First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Jadwal sudah pernah dipilih"})
		return
	}

	// Simpan ke tabel asisten_kelas
	asistenKelas := models.AsistenKelas{
		JadwalID:  input.JadwalID,
		AsistenID: userID,
		NIM:       *user.NIM,
	}

	if err := config.DB.Create(&asistenKelas).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memilih jadwal"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Berhasil memilih jadwal", "data": asistenKelas})
}

func GetJadwalAsisten(c *gin.Context) {
	userID := c.GetUint("user_id") // dari JWT
	var data []models.AsistenKelas

	if err := config.DB.Where("asisten_id = ?", userID).Preload("Jadwal").Find(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
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
	data.NIM = input.NIM
	// data.Hadir = input.Hadir
	// data.Izin = input.Izin
	// data.Alpha = input.Alpha
	// data.Pengganti = input.Pengganti

	if err := config.DB.Save(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Berhasil diupdate", "data": data})
}

func DeleteAsistenKelas(c *gin.Context) {
	id := c.Param("id")
	var data models.AsistenKelas

	if err := config.DB.First(&data, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data tidak ditemukan"})
		return
	}

	if err := config.DB.Delete(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data berhasil dihapus"})
}
