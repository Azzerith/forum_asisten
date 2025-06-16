package models

type User struct {
	ID       uint    `json:"id" gorm:"primaryKey"`
	Nama     string  `json:"nama"`
	Email    string  `json:"email" gorm:"unique"`
	Password string  `json:"-"`
	Role     string  `json:"role" gorm:"type:enum('admin','asisten');default:'asisten'"`
	NIM      *string `json:"nim,omitempty"`
	Telepon *string `json:"telepon,omitempty"`
	Status string  `json:"status" gorm:"type:enum('aktif','non-aktif');default:'non-aktif'"`
	Photo  *string `json:"photo,omitempty"`
}
