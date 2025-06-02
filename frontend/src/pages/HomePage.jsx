import React from "react";
import SidebarMenu from "../components/Sidebar";
import { motion } from "framer-motion";

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

  return (
    <div className="flex min-h-screen min-w-screen bg-gray-50">
      <SidebarMenu />
      <main className="flex-1 p-6">
        <motion.h1 
          className="text-3xl font-bold text-blue-900 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Selamat Datang!
        </motion.h1>
        
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((item, index) => (
            <motion.div
              key={index}
              className={`bg-gradient-to-r ${item.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl">{item.icon}</span>
                <h2 className="text-xl font-semibold">{item.title}</h2>
              </div>
              <p className="text-sm opacity-90">{item.description}</p>
              <motion.button
                className="mt-4 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Lihat Detail
              </motion.button>
            </motion.div>
          ))}
        </section>

        <motion.div 
          className="mt-8 bg-white p-6 rounded-xl shadow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terkini</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Pembaruan terbaru pada modul praktikum</p>
                  <p className="text-xs text-gray-500">2 jam yang lalu</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}