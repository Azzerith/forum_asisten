package config

import (
	"fmt"
	"forum_asisten/models"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	// "os"
)

var DB *gorm.DB

func InitDB() {
	dsn := "root@tcp(127.0.0.1:3306)/forum_asisten?parseTime=true"

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal koneksi DB: ", err)
	}
	DB = db
	fmt.Println("Database terkoneksi.")
	db.AutoMigrate(&models.ProgramStudi{}, &models.MataKuliah{},&models.Dosen{}, &models.Jadwal{})
}
