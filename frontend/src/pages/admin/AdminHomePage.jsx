import React from "react";
import SidebarMenu from "../../components/Sidebar";
import { motion } from "framer-motion";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminHomePage() {
  // Data statistik
  const stats = [
    { title: "Total Asisten", value: "42", change: "+5%", trend: "up" },
    { title: "Mata Kuliah", value: "12", change: "+2", trend: "up" },
    { title: "Praktikum Aktif", value: "8", change: "0%", trend: "neutral" },
    { title: "Tugas Belum Diverifikasi", value: "7", change: "-2", trend: "down" }
  ];

  // Aktivitas terbaru
  const recentActivities = [
    {
      id: 1,
      user: "Budi Santoso",
      action: "mengupload modul baru",
      course: "Pemrograman Lanjut",
      time: "10 menit lalu"
    },
    {
      id: 2,
      user: "Ani Wijaya",
      action: "melakukan verifikasi laporan",
      course: "Struktur Data",
      time: "1 jam lalu"
    },
    {
      id: 3,
      user: "Admin",
      action: "menambahkan asisten baru",
      course: "Basis Data",
      time: "3 jam lalu"
    }
  ];

  // Tugas yang perlu perhatian
  const urgentTasks = [
    {
      title: "Verifikasi Laporan",
      description: "3 laporan praktikum menunggu verifikasi",
      priority: "high"
    },
    {
      title: "Jadwal Baru",
      description: "Buat jadwal asisten untuk minggu depan",
      priority: "medium"
    },
    {
      title: "Update Modul",
      description: "Modul Algoritma perlu diperbarui",
      priority: "low"
    }
  ];

  return (
    <div className="flex min-h-screen min-w-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <motion.h1 
          className="text-3xl font-bold text-blue-900 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Dashboard Admin
        </motion.h1>
        
        {/* Statistik Utama */}
        <section className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-black bg-white p-6 rounded-xl shadow hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stat.trend === "up" ? "bg-green-100 text-green-800" : 
                  stat.trend === "down" ? "bg-red-100 text-red-800" : 
                  "bg-gray-100 text-gray-800"
                }`}>
                  {stat.change}
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Grafik dan Tugas Penting */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* Grafik Aktivitas */}
          <motion.div 
            className="lg:col-span-2 bg-white p-6 rounded-xl shadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Asisten</h3>
          </motion.div>

          {/* Tugas Prioritas */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tugas Prioritas</h3>
            <div className="space-y-4">
              {urgentTasks.map((task, index) => (
                <div 
                  key={index} 
                  className={`text-black p-4 rounded-lg border-l-4 ${
                    task.priority === "high" ? "border-red-500 bg-red-50" :
                    task.priority === "medium" ? "border-yellow-500 bg-yellow-50" :
                    "border-blue-500 bg-blue-50"
                  }`}
                >
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  <button className="text-white mt-2 text-xs bg-white hover:bg-gray-100 px-3 py-1 rounded-full transition-colors shadow">
                    Tindak Lanjut
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Bawah: Aktivitas Terbaru dan Distribusi */}
        <section className="grid gap-6 mt-6 lg:grid-cols-3">
          {/* Aktivitas Terbaru */}
          <motion.div 
            className="lg:col-span-2 bg-white p-6 rounded-xl shadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Sistem Terbaru</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      <span className="font-semibold">{activity.user}</span> {activity.action} untuk {activity.course}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-800">
                    Detail
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Distribusi Asisten */}
          <motion.div 
            className="bg-white p-6 rounded-xl shadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribusi Asisten</h3>
          </motion.div>
        </section>

        {/* Quick Actions */}
        <motion.div 
          className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg transition-colors flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-xs">Tambah Asisten</span>
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg transition-colors flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs">Buat Modul</span>
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg transition-colors flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">Atur Jadwal</span>
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg transition-colors flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs">Pengaturan</span>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}