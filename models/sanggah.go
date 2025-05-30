package models

import "time"

type Sanggah struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	RekapitulasiID uint      `gorm:"not null" json:"rekapitulasi_id"`
	IsiSanggahan   string    `gorm:"type:text;not null" json:"isi_sanggahan"`
	Waktu          time.Time `gorm:"autoCreateTime" json:"waktu"`

	Rekapitulasi Rekapitulasi `gorm:"foreignKey:RekapitulasiID;references:ID"`
}

func (Sanggah) TableName() string {
	return "sanggah"
}
