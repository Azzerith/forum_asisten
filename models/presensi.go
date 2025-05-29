package models

import "time"

type Presensi struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	JadwalID        uint      `json:"jadwal_id"`
	AsistenID       uint      `json:"asisten_id"`
	Jenis           string    `json:"jenis"` // "utama" | "pengganti"
	Status          string    `json:"status"` // "hadir" | "izin" | "alpha"
	BuktiKehadiran  string    `json:"bukti_kehadiran,omitempty"`
	BuktiIzin       string    `json:"bukti_izin,omitempty"`
	IsiMateri       string    `json:"isi_materi,omitempty"`
	WaktuInput      time.Time `json:"waktu_input" gorm:"autoCreateTime"`

	Jadwal  Jadwal `json:"jadwal" gorm:"foreignKey:JadwalID"`
	Asisten User   `json:"asisten" gorm:"foreignKey:AsistenID"`
}

func (Presensi) TableName() string {
	return "presensi"
}
