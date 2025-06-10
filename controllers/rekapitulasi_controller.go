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
	var hadir, izin, alpha, pengganti int64

	config.DB.Model(&models.Presensi{}).Where("asisten_id = ? AND status = ? AND jenis = ?", input.AsistenID, "hadir", "utama").Count(&hadir)
	config.DB.Model(&models.Presensi{}).Where("asisten_id = ? AND status = ? AND jenis = ?", input.AsistenID, "izin", "utama").Count(&izin)
	config.DB.Model(&models.Presensi{}).Where("asisten_id = ? AND status = ? AND jenis = ?", input.AsistenID, "alpha", "utama").Count(&alpha)
	config.DB.Model(&models.Presensi{}).Where("asisten_id = ? AND status = ? AND jenis = ?", input.AsistenID, "hadir", "pengganti").Count(&pengganti)

	rekap.JumlahHadir = int(hadir)
	rekap.JumlahIzin = int(izin)
	rekap.JumlahAlpha = int(alpha)
	rekap.JumlahPengganti = int(pengganti)

	// Hitung ulang total honor
	rekap.TotalHonor = rekap.HonorPertemuan * (rekap.JumlahHadir + rekap.JumlahPengganti)

	if err := config.DB.Save(&rekap).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan rekapitulasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tipe honor disimpan", "data": rekap})
}

func GetRekapitulasi(c *gin.Context) {
	var rekapList []models.Rekapitulasi
	asistenID := c.Query("asisten_id") // optional query param

	query := config.DB.Preload("Asisten")

	if asistenID != "" {
		query = query.Where("asisten_id = ?", asistenID)
	}

	if err := query.Find(&rekapList).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data rekapitulasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": rekapList})
}

func UpdateRekapitulasi(c *gin.Context) {
	var input struct {
		AsistenID       uint   `json:"asisten_id" binding:"required"`
		JumlahHadir     int    `json:"jumlah_hadir"`
		JumlahIzin      int    `json:"jumlah_izin"`
		JumlahAlpha     int    `json:"jumlah_alpha"`
		JumlahPengganti int    `json:"jumlah_pengganti"`
		TipeHonor       string `json:"tipe_honor" binding:"omitempty,oneof=A B C D E"` // optional field
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid", "detail": err.Error()})
		return
	}

	var rekap models.Rekapitulasi
	if err := config.DB.Where("asisten_id = ?", input.AsistenID).First(&rekap).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rekapitulasi tidak ditemukan"})
		return
	}

	// Update tipe honor if provided
	if input.TipeHonor != "" {
		honor, exists := honorMap[input.TipeHonor]
		if !exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Tipe honor tidak valid"})
			return
		}
		rekap.TipeHonor = input.TipeHonor
		rekap.HonorPertemuan = honor
	}

	// Hitung ulang dari tabel presensi
	var hadir, izin, alpha, pengganti int64
	config.DB.Model(&models.Presensi{}).Where("asisten_id = ? AND status = ? AND jenis = ?", input.AsistenID, "hadir", "utama").Count(&hadir)
	config.DB.Model(&models.Presensi{}).Where("asisten_id = ? AND status = ? AND jenis = ?", input.AsistenID, "izin", "utama").Count(&izin)
	config.DB.Model(&models.Presensi{}).Where("asisten_id = ? AND status = ? AND jenis = ?", input.AsistenID, "alpha", "utama").Count(&alpha)
	config.DB.Model(&models.Presensi{}).Where("asisten_id = ? AND status = ? AND jenis = ?", input.AsistenID, "hadir", "pengganti").Count(&pengganti)

	rekap.JumlahHadir = int(hadir)
	rekap.JumlahIzin = int(izin)
	rekap.JumlahAlpha = int(alpha)
	rekap.JumlahPengganti = int(pengganti)

	// Hitung ulang total honor
	rekap.TotalHonor = rekap.HonorPertemuan * (rekap.JumlahHadir + rekap.JumlahPengganti)

	if err := config.DB.Save(&rekap).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengupdate rekapitulasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Rekapitulasi diperbarui", "data": rekap})
}

func DeleteRekapitulasi(c *gin.Context) {
	asistenID := c.Param("asisten_id")

	var rekap models.Rekapitulasi
	if err := config.DB.Where("asisten_id = ?", asistenID).First(&rekap).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rekapitulasi tidak ditemukan"})
		return
	}

	if err := config.DB.Delete(&rekap).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus rekapitulasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Rekapitulasi berhasil dihapus"})
}
