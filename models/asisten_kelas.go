package models

type AsistenKelas struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	JadwalID  uint   `json:"jadwal_id"`
	AsistenID uint   `json:"asisten_id"`
	NIM       string `json:"nim"`

	// Hadir     int `json:"hadir"`
	// Izin      int `json:"izin"`
	// Alpha     int `json:"alpha"`
	// Pengganti int `json:"pengganti"`

	Jadwal Jadwal `gorm:"foreignKey:JadwalID"`
	User   User   `gorm:"foreignKey:AsistenID"`
}
