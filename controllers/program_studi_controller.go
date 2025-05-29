package controllers

import (
	"forum_asisten/config"
	"forum_asisten/models"
	"github.com/gin-gonic/gin"
	"net/http"
)

func CreateProgramStudi(c *gin.Context) {
	var ps models.ProgramStudi
	if err := c.ShouldBindJSON(&ps); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data salah"})
		return
	}
	if err := config.DB.Create(&ps).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan"})
		return
	}
	c.JSON(http.StatusCreated, ps)
}

func GetAllProgramStudi(c *gin.Context) {
	var list []models.ProgramStudi
	if err := config.DB.Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
		return
	}
	c.JSON(http.StatusOK, list)
}

func UpdateProgramStudi(c *gin.Context) {
	id := c.Param("id")
	var ps models.ProgramStudi
	if err := config.DB.First(&ps, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Program studi tidak ditemukan"})
		return
	}

	var input models.ProgramStudi
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	ps.Nama = input.Nama
	config.DB.Save(&ps)
	c.JSON(http.StatusOK, ps)
}

func DeleteProgramStudi(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.ProgramStudi{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Berhasil dihapus"})
}
