package controllers

import (
	"forum_asisten/config"
	"forum_asisten/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

var honorMap = map[string]int{
	"A": 12500,
	"B": 14500,
	"C": 16500,
	"D": 22500,
	"E": 24500,
}

func SetTipeHonor(c *gin.Context) {
	var input struct {
		AsistenID uint   `json:"asisten_id" binding:"required"`
		TipeHonor string `json:"tipe_honor" binding:"required,oneof=A B C D E"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid", "detail": err.Error()})
		return
	}

	honor, exists := honorMap[input.TipeHonor]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tipe honor tidak valid"})
		return
	}

	var rekap models.Rekapitulasi
	if err := config.DB.Where("asisten_id = ?", input.AsistenID).First(&rekap).Error; err != nil {
		// Belum ada rekap, buat baru
		rekap = models.Rekapitulasi{
			AsistenID:      input.AsistenID,
			TipeHonor:      input.TipeHonor,
			HonorPertemuan: honor,
		}
	} else {
		// Update tipe honor
		rekap.TipeHonor = input.TipeHonor
		rekap.HonorPertemuan = honor
	}

	// Hitung ulang total honor
	rekap.TotalHonor = rekap.HonorPertemuan * (rekap.JumlahHadir + rekap.JumlahPengganti)

	if err := config.DB.Save(&rekap).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan rekapitulasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tipe honor disimpan", "data": rekap})
}


