import React from "react";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiTrendingUp, FiClock, FiBell, FiUsers } from "react-icons/fi";
import Layout from "../components/Layout";

export default function HomePage() {
  const announcements = [
    {
      title: "Ada Jadwal Asisten!",
      description: "Pengantar Ilmu Komputer",
      icon: <FiClock className="text-xl" />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Pengumuman!",
      description: "Diberitahukan kepada seluruh asisten mata kuliah Pemrograman...",
      icon: <FiBell className="text-xl" />,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Meeting Rutin",
      description: "Akan diadakan meeting rutin hari Jumat pukul 16.00",
      icon: <FiUsers className="text-xl" />,
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  const recentActivities = [
    {
      title: "Pembaruan terbaru pada modul praktikum",
      time: "2 jam yang lalu"
    },
    {
      title: "Presensi dibuka untuk sesi praktikum minggu ini",
      time: "1 hari yang lalu"
    },
    {
      title: "Materi tambahan telah diupload",
      time: "3 hari yang lalu"
    }
  ];

  return (
    <Layout>
      <motion.main 
        className="flex-1 p-4 sm:p-6 overflow-x-hidden max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header Section */}
        <motion.header 
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Selamat Datang!</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Berikut update terbaru untuk Anda</p>
        </motion.header>
        
        {/* Announcements Grid */}
        <section className="mb-8 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Pengumuman</h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((item, index) => (
              <motion.article
                key={index}
                className={`bg-gradient-to-r from-blue-700 to-indigo-900 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden ${index === announcements.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                </div>
                <p className="text-xs md:text-sm opacity-90 mb-4">{item.description}</p>
                <motion.button
                  className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Lihat Detail <FiArrowUpRight className="text-xs" />
                </motion.button>
                
              </motion.article>
            ))}
          </div>
        </section>

        {/* Recent Activities */}
        <motion.section 
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="p-5 sm:p-6 border-b">
            <div className="flex items-center gap-3">
              <FiTrendingUp className="text-blue-600 text-xl" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Aktivitas Terkini</h3>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentActivities.map((activity, index) => (
              <motion.article
                key={index}
                className="p-4 sm:p-5 hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-full flex-shrink-0 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm sm:text-base font-medium text-gray-800 mb-1">{activity.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>
      </motion.main>
    </Layout>
  );
}