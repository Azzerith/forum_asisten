// controllers/sanggah_controller.go
package controllers

import (
	"forum_asisten/config"
	"forum_asisten/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// POST /sanggah
func BuatSanggah(c *gin.Context) {
	var input struct {
		RekapitulasiID uint   `json:"rekapitulasi_id" binding:"required"`
		IsiSanggahan   string `json:"isi_sanggahan" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sanggah := models.Sanggah{
		RekapitulasiID: input.RekapitulasiID,
		IsiSanggahan:   input.IsiSanggahan,
	}

	if err := config.DB.Create(&sanggah).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan sanggahan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Sanggahan berhasil dikirim", "data": sanggah})
}

// GET /sanggah
func GetSemuaSanggah(c *gin.Context) {
	var list []models.Sanggah

	if err := config.DB.Preload("Rekapitulasi.Asisten").Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data sanggahan"})
		return
	}

	c.JSON(http.StatusOK, list)
}

// GET /sanggah/:id
func GetSanggahByID(c *gin.Context) {
	id := c.Param("id")
	var sanggah models.Sanggah

	if err := config.DB.Preload("Rekapitulasi").First(&sanggah, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sanggahan tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, sanggah)
}
