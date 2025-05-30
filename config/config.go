package config

import (
	"fmt"
	"forum_asisten/models"
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	// Load DB config from environment variables
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASS")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	dbname := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", user, pass, host, port, dbname)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal koneksi DB: ", err)
	}

	DB = db
	fmt.Println("Database terkoneksi.")

	// Auto migrate semua model
	db.AutoMigrate(
		&models.ProgramStudi{},
		&models.MataKuliah{},
		&models.Dosen{},
		&models.Jadwal{},
		&models.User{},
		&models.AsistenKelas{},
	)
}
