package routes

import (
	"forum_asisten/controllers"
	"forum_asisten/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.POST("/register", controllers.Register)
		api.POST("/login", controllers.Login)
		api.GET("/program-studi", controllers.GetAllProgramStudi)
		api.GET("/mata-kuliah", controllers.GetAllMataKuliah)
		api.GET("/dosen", controllers.GetAllDosen)
		api.GET("/jadwal", controllers.GetAllJadwal)
		api.GET("/asisten-kelas", controllers.GetJadwalAsisten)
		api.GET("/presensi", controllers.GetAllPresensi)

		protected := api.Group("/")
		protected.Use(middlewares.AuthMiddleware())
		{
			protected.POST("/asisten-kelas", controllers.PilihJadwalAsisten)

			protected.POST("/presensi", controllers.CreatePresensi)
			
		}
		admin := api.Group("/admin")
		admin.Use(middlewares.AuthMiddleware(), middlewares.AdminMiddleware())
		{
			admin.POST("/program-studi", controllers.CreateProgramStudi)
			admin.PUT("/program-studi/:id", controllers.UpdateProgramStudi)
			admin.DELETE("/program-studi/:id", controllers.DeleteProgramStudi)

			admin.POST("/mata-kuliah", controllers.CreateMataKuliah)
			admin.PUT("/mata-kuliah/:id", controllers.UpdateMataKuliah)
			admin.DELETE("/mata-kuliah/:id", controllers.DeleteMataKuliah)

			admin.POST("/dosen", controllers.CreateDosen)
			admin.PUT("/dosen/:id", controllers.UpdateDosen)
			admin.DELETE("/dosen/:id", controllers.DeleteDosen)

			admin.POST("/jadwal", controllers.CreateJadwal)
			admin.PUT("/jadwal/:id", controllers.UpdateJadwal)
			admin.DELETE("/jadwal/:id", controllers.DeleteJadwal)

			admin.PUT("/asisten-kelas/:id", controllers.UpdateAsistenKelas)
			admin.DELETE("/asisten-kelas/:id", controllers.DeleteAsistenKelas)
		}

	}
}
