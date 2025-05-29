package controllers

import (
	"forum_asisten/config"
	"forum_asisten/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreatePresensi(c *gin.Context) {
	// Ambil user ID dari token (context)
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID tidak ditemukan"})
		return
	}

	userIDFloat, ok := userIDVal.(float64)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID token tidak valid"})
		return
	}
	userID := uint(userIDFloat)

	// Ambil role
	role := c.GetString("role")
	if role != "asisten" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya asisten yang dapat mengisi presensi"})
		return
	}

	// Binding input
	var input models.Presensi
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid", "detail": err.Error()})
		return
	}

	// Validasi kehadiran vs izin
	if input.Status == "hadir" {
		if input.BuktiIzin != "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Bukti izin harus kosong jika status hadir"})
			return
		}
	} else if input.Status == "izin" || input.Status == "alpha" {
		if input.BuktiKehadiran != "" || input.IsiMateri != "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Bukti kehadiran dan isi materi harus kosong jika tidak hadir"})
			return
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status presensi tidak valid"})
		return
	}

	// Tambahkan asisten_id dari token
	input.AsistenID = userID

	// Simpan presensi
	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan presensi"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Presensi berhasil disimpan",
		"data":    input,
	})
}



func GetAllPresensi(c *gin.Context) {
	var data []models.Presensi
	if err := config.DB.
		Preload("Jadwal").
		Preload("Jadwal.MataKuliah").
		Preload("Asisten").
		Preload("Jadwal.MataKuliah.ProgramStudi").
		Preload("Jadwal.Dosen").
		Find(&data).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data presensi"})
		return
	}
	c.JSON(http.StatusOK, data)
}
