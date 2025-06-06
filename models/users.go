package models

type User struct {
	ID       uint    `json:"id" gorm:"primaryKey"`
	Nama     string  `json:"nama"`
	Email    string  `json:"email" gorm:"unique"`
	Password string  `json:"-"` // biasanya tidak di-encode di JSON
	Role     string  `json:"role"`
	NIM      *string `json:"nim,omitempty"`

	Status string  `json:"status" gorm:"type:enum('aktif','non-aktif');default:'aktif'"` // ENUM aktif/non-aktif
	Photo  *string `json:"photo,omitempty"` // bisa null
}
