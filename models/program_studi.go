package models

import "time"

type ProgramStudi struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	Nama      string `json:"nama" gorm:"unique;not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}
