package controllers

import (
	"forum_asisten/config"
	"forum_asisten/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func CreateJadwal(c *gin.Context) {
	var jadwal models.Jadwal
	if err := c.ShouldBindJSON(&jadwal); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	// Validasi format jam
	if _, err := time.Parse("15:04", jadwal.JamMulai); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format jam_mulai harus HH:MM"})
		return
	}
	if _, err := time.Parse("15:04", jadwal.JamSelesai); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format jam_selesai harus HH:MM"})
		return
	}

	if err := config.DB.Create(&jadwal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan jadwal"})
		return
	}
	c.JSON(http.StatusCreated, jadwal)
}


func GetAllJadwal(c *gin.Context) {
	var jadwal []models.Jadwal
	if err := config.DB.Preload("Dosen").Preload("MataKuliah").Preload("MataKuliah.ProgramStudi").Find(&jadwal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data jadwal"})
		return
	}
	c.JSON(http.StatusOK, jadwal)
}

func UpdateJadwal(c *gin.Context) {
	id := c.Param("id")
	var jadwal models.Jadwal
	if err := config.DB.First(&jadwal, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Jadwal tidak ditemukan"})
		return
	}

	var input models.Jadwal
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	jadwal.MataKuliahID = input.MataKuliahID
	jadwal.DosenID = input.DosenID
	jadwal.Hari = input.Hari
	jadwal.JamMulai = input.JamMulai
	jadwal.JamSelesai = input.JamSelesai
	jadwal.Lab = input.Lab
	jadwal.Kelas = input.Kelas
	jadwal.Semester = input.Semester

	config.DB.Save(&jadwal)
	c.JSON(http.StatusOK, jadwal)
}

func DeleteJadwal(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Jadwal{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus jadwal"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Jadwal berhasil dihapus"})
}
