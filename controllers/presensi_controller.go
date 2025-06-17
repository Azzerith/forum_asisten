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

	// Update rekapitulasi
	var rekap models.Rekapitulasi
	if err := config.DB.Where("asisten_id = ?", input.AsistenID).First(&rekap).Error; err != nil {
		// Belum ada rekap, buat baru
		rekap = models.Rekapitulasi{
			AsistenID: input.AsistenID,
		}
	}

	switch input.Status {
	case "hadir":
		if input.Jenis == "utama" {
			rekap.JumlahHadir++
		} else if input.Jenis == "pengganti" {
			rekap.JumlahPengganti++
		}
	case "izin":
		rekap.JumlahIzin++
	case "alpha":
		rekap.JumlahAlpha++
	}

	rekap.TotalHonor = rekap.HonorPertemuan * (rekap.JumlahHadir + rekap.JumlahPengganti)

	if err := config.DB.Save(&rekap).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui rekapitulasi"})
		return
	}

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
func UpdatePresensi(c *gin.Context) {
    // [1] Ambil ID presensi dan validasi
    presensiID := c.Param("id")
    if presensiID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ID presensi harus disertakan"})
        return
    }

    // [2] Cek role admin
    role := c.GetString("role")
    if role != "admin" {
        c.JSON(http.StatusForbidden, gin.H{"error": "Hanya admin yang dapat mengupdate presensi"})
        return
    }

    // [3] Bind input
    type UpdateInput struct {
        Status string `json:"status" binding:"required,oneof=hadir izin alpha"`
    }
    
    var input UpdateInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Invalid input",
            "details": err.Error(),
        })
        return
    }
    
    // if err := c.ShouldBindJSON(&input); err != nil {
    //     c.JSON(http.StatusBadRequest, gin.H{"error": "Input tidak valid"})
    //     return
    // }

    // [4] Validasi status
    validStatus := map[string]bool{"hadir": true, "izin": true, "alpha": true}
    if !validStatus[input.Status] {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Status tidak valid"})
        return
    }

    // [5] Mulai transaction
    tx := config.DB.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // [6] Ambil data presensi lama (untuk mengetahui status sebelumnya)
    var presensi models.Presensi
    if err := tx.Where("id = ?", presensiID).First(&presensi).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusNotFound, gin.H{"error": "Presensi tidak ditemukan"})
        return
    }

    oldStatus := presensi.Status
    presensi.Status = input.Status

    // [7] Simpan perubahan presensi
    if err := tx.Save(&presensi).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan presensi"})
        return
    }

    // [8] Update rekapitulasi HANYA jika status berubah
    if oldStatus != input.Status {
        var rekap models.Rekapitulasi
        if err := tx.Where("asisten_id = ?", presensi.AsistenID).First(&rekap).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Data rekapitulasi tidak ditemukan"})
            return
        }

        // [9] Kurangi counter status lama
        switch oldStatus {
        case "hadir":
            if presensi.Jenis == "utama" {
                rekap.JumlahHadir--
            } else {
                rekap.JumlahPengganti--
            }
        case "izin":
            rekap.JumlahIzin--
        case "alpha":
            rekap.JumlahAlpha--
        }

        // [10] Tambahkan counter status baru
        switch input.Status {
        case "hadir":
            if presensi.Jenis == "utama" {
                rekap.JumlahHadir++
            } else {
                rekap.JumlahPengganti++
            }
        case "izin":
            rekap.JumlahIzin++
        case "alpha":
            rekap.JumlahAlpha++
        }

        // [11] Hitung ulang total honor
        rekap.TotalHonor = rekap.HonorPertemuan * (rekap.JumlahHadir + rekap.JumlahPengganti)

        if err := tx.Save(&rekap).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal update rekapitulasi"})
            return
        }
    }

    // [12] Commit transaksi jika semua berhasil
    tx.Commit()

    c.JSON(http.StatusOK, gin.H{
        "message": "Status presensi berhasil diperbarui",
        "data":    presensi,
    })
}

func DeletePresensi(c *gin.Context) {
    // Get presensi ID from URL parameter
    presensiID := c.Param("id")
    if presensiID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ID presensi harus disertakan"})
        return
    }

    // Start transaction
    tx := config.DB.Begin()
    defer func() {
        if r := recover(); r != nil {
            tx.Rollback()
        }
    }()

    // Check if presensi exists
    var presensi models.Presensi
    if err := tx.Where("id = ?", presensiID).First(&presensi).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusNotFound, gin.H{"error": "Presensi tidak ditemukan"})
        return
    }

    // Delete presensi
    if err := tx.Delete(&presensi).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus presensi"})
        return
    }

    // Update rekapitulasi - use presensi.AsistenID instead of userID
    var rekap models.Rekapitulasi
    if err := tx.Where("asisten_id = ?", presensi.AsistenID).First(&rekap).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Gagal menemukan rekapitulasi",
            "details": err.Error(),
        })
        return
    }

    // Recalculate counts based on remaining presensi records
    var presensis []models.Presensi
    if err := tx.Where("asisten_id = ?", presensi.AsistenID).Find(&presensis).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghitung ulang rekapitulasi"})
        return
    }

    // Reset counters
    rekap.JumlahHadir = 0
    rekap.JumlahPengganti = 0
    rekap.JumlahIzin = 0
    rekap.JumlahAlpha = 0

    // Recalculate
    for _, p := range presensis {
        switch p.Status {
        case "hadir":
            if p.Jenis == "utama" {
                rekap.JumlahHadir++
            } else if p.Jenis == "pengganti" {
                rekap.JumlahPengganti++
            }
        case "izin":
            rekap.JumlahIzin++
        case "alpha":
            rekap.JumlahAlpha++
        }
    }

    rekap.TotalHonor = rekap.HonorPertemuan * (rekap.JumlahHadir + rekap.JumlahPengganti)

    if err := tx.Save(&rekap).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui rekapitulasi"})
        return
    }

    tx.Commit()

    c.JSON(http.StatusOK, gin.H{
        "message": "Presensi berhasil dihapus",
    })
}