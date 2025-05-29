package controllers

import (
	"forum_asisten/config"
	"forum_asisten/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateDosen(c *gin.Context) {
	var dosen models.Dosen
	if err := c.ShouldBindJSON(&dosen); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}
	if err := config.DB.Create(&dosen).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan dosen"})
		return
	}
	c.JSON(http.StatusCreated, dosen)
}

func GetAllDosen(c *gin.Context) {
	var dosen []models.Dosen
	if err := config.DB.Find(&dosen).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data dosen"})
		return
	}
	c.JSON(http.StatusOK, dosen)
}

func UpdateDosen(c *gin.Context) {
	id := c.Param("id")
	var dosen models.Dosen
	if err := config.DB.First(&dosen, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Dosen tidak ditemukan"})
		return
	}

	var input models.Dosen
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	dosen.Nama = input.Nama
	config.DB.Save(&dosen)
	c.JSON(http.StatusOK, dosen)
}

func DeleteDosen(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.Dosen{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus dosen"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Dosen berhasil dihapus"})
}
