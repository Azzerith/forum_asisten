package models

type User struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	Nama     string `json:"nama"`
	Email    string `json:"email" gorm:"unique"`
	Password string `json:"-"`
	Role     string `json:"role"`
	NIM      *string `json:"nim,omitempty"`
}
