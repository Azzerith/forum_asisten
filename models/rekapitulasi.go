package models

type Rekapitulasi struct {
	ID              uint   `json:"id" gorm:"primaryKey"`
	AsistenID       uint   `json:"asisten_id"`
	JumlahHadir     int    `json:"jumlah_hadir"`
	JumlahIzin      int    `json:"jumlah_izin"`
	JumlahAlpha     int    `json:"jumlah_alpha"`
	JumlahPengganti int    `json:"jumlah_pengganti"`
	TipeHonor       string `json:"tipe_honor"` // A, B, C, D, E
	HonorPertemuan  int    `json:"honor_pertemuan"`
	TotalHonor      int    `json:"total_honor" gorm:"->"`
	Asisten         User   `json:"asisten" gorm:"foreignKey:AsistenID"`
}

func (Rekapitulasi) TableName() string {
	return "rekapitulasi"
}
