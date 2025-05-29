package models

type Jadwal struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	MataKuliahID uint       `json:"mata_kuliah_id"`
	DosenID      uint       `json:"dosen_id"`
	Hari         string     `json:"hari"`
	JamMulai     string     `json:"jam_mulai"`   // format: "08:00"
	JamSelesai   string     `json:"jam_selesai"` // format: "10:00"
	Lab          string     `json:"lab"`
	Kelas        string     `json:"kelas"`
	Semester     int        `json:"semester"`
	MataKuliah   MataKuliah `json:"mata_kuliah" gorm:"foreignKey:MataKuliahID"`
	Dosen        Dosen      `json:"dosen" gorm:"foreignKey:DosenID"`
}
