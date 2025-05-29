package models

type AsistenKelas struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	JadwalID  uint   `json:"jadwal_id"`
	AsistenID uint   `json:"asisten_id"`

	Jadwal Jadwal `gorm:"foreignKey:JadwalID;references:ID" json:"jadwal"`
	User   User   `gorm:"foreignKey:AsistenID;references:ID" json:"user"`
}

