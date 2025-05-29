package controllers

import (
	"forum_asisten/config"
	"forum_asisten/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateMataKuliah(c *gin.Context) {
	var mk models.MataKuliah
	if err := c.ShouldBindJSON(&mk); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data salah"})
		return
	}
	if err := config.DB.Create(&mk).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan"})
		return
	}
	c.JSON(http.StatusCreated, mk)
}

func GetAllMataKuliah(c *gin.Context) {
	var list []models.MataKuliah
	if err := config.DB.Preload("ProgramStudi").Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data"})
		return
	}
	c.JSON(http.StatusOK, list)
}

func UpdateMataKuliah(c *gin.Context) {
	id := c.Param("id")
	var mk models.MataKuliah
	if err := config.DB.First(&mk, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mata kuliah tidak ditemukan"})
		return
	}

	var input models.MataKuliah
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
		return
	}

	mk.Nama = input.Nama
	mk.Semester = input.Semester
	mk.Kode = input.Kode
	mk.ProgramStudiID = input.ProgramStudiID

	config.DB.Save(&mk)
	c.JSON(http.StatusOK, mk)
}

func DeleteMataKuliah(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.MataKuliah{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Berhasil dihapus"})
}
