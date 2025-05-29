package models

import "time"

type MataKuliah struct {
	ID             uint         `json:"id" gorm:"primaryKey"`
	Nama           string       `json:"nama" gorm:"not null"`
	Semester       uint         `json:"semester" gorm:"not null"`
	Kode           string       `json:"kode" gorm:"unique;not null"`
	ProgramStudiID uint         `json:"program_studi_id"`
	ProgramStudi   ProgramStudi `json:"program_studi" gorm:"foreignKey:ProgramStudiID"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
