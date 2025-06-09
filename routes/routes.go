package routes

import (
	"forum_asisten/controllers"
	"forum_asisten/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// api.POST("/register", controllers.Register)
		api.POST("/login", controllers.Login)
		// api.GET("/program-studi", controllers.GetAllProgramStudi)
		// api.GET("/mata-kuliah", controllers.GetAllMataKuliah)
		// api.GET("/dosen", controllers.GetAllDosen)
		api.GET("/jadwal", controllers.GetAllJadwal)
		// api.GET("/asisten-kelas", controllers.GetJadwalAsisten)
		// api.GET("/presensi", controllers.GetAllPresensi)
		// api.GET("/rekapitulasi", controllers.GetRekapitulasi)
		api.GET("/sanggah", controllers.GetSemuaSanggah)
		api.GET("/sanggah/:id", controllers.GetSanggahByID)

		protected := api.Group("/")
		protected.Use(middlewares.AuthMiddleware())
		{
			protected.POST("/asisten-kelas", controllers.PilihJadwalAsisten)
			protected.DELETE("/admin/asisten-kelas/:jadwal_id/:asisten_id", controllers.DeleteAsistenFromJadwal)

			protected.POST("/presensi", controllers.CreatePresensi)
			protected.GET("/presensi", controllers.GetAllPresensi)

			protected.POST("/sanggah", controllers.BuatSanggah)

			protected.GET("/asisten-kelas", controllers.GetJadwalAsisten)
			protected.GET("/api/asisten-kelas/user/:user_id", controllers.GetJadwalAsistenById)
			protected.GET("/rekapitulasi", controllers.GetRekapitulasi)

		}
		admin := api.Group("/admin")
		admin.Use(middlewares.AuthMiddleware(), middlewares.AdminMiddleware())
		{
			admin.POST("/users", controllers.Register)
			admin.GET("/users", controllers.GetUsers)
			admin.PUT("/users/:id", controllers.UpdateUser)
			admin.PUT("/users/:id/status", controllers.UpdateUserStatus)
			admin.DELETE("/users/:id", controllers.DeleteUser)

			admin.GET("/program-studi", controllers.GetAllProgramStudi)
			admin.POST("/program-studi", controllers.CreateProgramStudi)
			admin.PUT("/program-studi/:id", controllers.UpdateProgramStudi)
			admin.DELETE("/program-studi/:id", controllers.DeleteProgramStudi)

			admin.GET("/mata-kuliah", controllers.GetAllMataKuliah)
			admin.POST("/mata-kuliah", controllers.CreateMataKuliah)
			admin.PUT("/mata-kuliah/:id", controllers.UpdateMataKuliah)
			admin.DELETE("/mata-kuliah/:id", controllers.DeleteMataKuliah)

			admin.GET("/dosen", controllers.GetAllDosen)
			admin.POST("/dosen", controllers.CreateDosen)
			admin.PUT("/dosen/:id", controllers.UpdateDosen)
			admin.DELETE("/dosen/:id", controllers.DeleteDosen)

			admin.GET("/jadwal", controllers.GetAllJadwal)
			admin.POST("/jadwal", controllers.CreateJadwal)
			admin.PUT("/jadwal/:id", controllers.UpdateJadwal)
			admin.DELETE("/jadwal/:id", controllers.DeleteJadwal)

			admin.POST("/asisten-kelas", controllers.AdminPilihJadwalAsisten)
			admin.GET("/asisten-kelas", controllers.GetJadwalAsisten)
			admin.PUT("/asisten-kelas/:id", controllers.UpdateAsistenKelas)
			admin.DELETE("/admin/asisten-kelas/:jadwal_id/:asisten_id", controllers.DeleteAsistenFromJadwal)

			admin.GET("/presensi", controllers.GetAllPresensi)

			admin.GET("/rekapitulasi", controllers.GetRekapitulasi)
			admin.POST("/rekapitulasi", controllers.SetTipeHonor)
			admin.PUT("/rekapitulasi/:id", controllers.UpdateRekapitulasi)
			admin.DELETE("/rekapitulasi/:id", controllers.DeleteRekapitulasi)
		}

	}
}
