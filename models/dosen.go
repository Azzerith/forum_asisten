package models

type Dosen struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Nama string `json:"nama" gorm:"type:varchar(100);not null"`
}
