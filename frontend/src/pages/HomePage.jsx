import React from "react";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiTrendingUp } from "react-icons/fi";
import Layout from "../components/Layout";

export default function HomePage() {
  const announcements = [
    {
      title: "Ada Jadwal Asisten!",
      description: "Pengantar Ilmu Komputer",
      icon: "⏰",
      color: "from-blue-600 to-blue-700"
    },
    {
      title: "Pengumuman!",
      description: "Diberitahukan kepada seluruh asisten mata kuliah Pemrograman...",
      icon: "📢",
      color: "from-purple-600 to-purple-700"
    },
    {
      title: "Meeting Rutin",
      description: "Akan diadakan meeting rutin hari Jumat pukul 16.00",
      icon: "👥",
      color: "from-indigo-600 to-indigo-700"
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
      <motion.div 
        className="flex-1 p-4 md:p-6 overflow-x-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h1 
          className="text-2xl md:text-3xl font-bold text-blue-900 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Selamat Datang!
        </motion.h1>
        
        {/* Announcements Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {announcements.map((item, index) => (
            <motion.div
              key={index}
              className={`bg-gradient-to-r ${item.color} text-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow`}
              initial={{ opacity: 0, scale: 0.9 }}
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
            </motion.div>
          ))}
        </section>

        {/* Recent Activities */}
        <motion.div 
          className="bg-white p-5 md:p-6 rounded-xl shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Aktivitas Terkini</h3>
          </div>
          
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}