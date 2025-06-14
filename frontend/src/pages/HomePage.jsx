import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiTrendingUp, FiClock, FiBell, FiUsers } from "react-icons/fi";
import Layout from "../components/Layout";
import axios from "axios";

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [recentActivities, setRecentActivities] = useState([
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
  ]);

  // Get user from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({ user_id: payload.user_id, ...payload });
      } catch (err) {
        console.error("Token parsing error:", err);
      }
    }
  }, []);

  // Check if schedule is within time range
  const isWithinTimeRange = (schedule, minutesBefore = 0, minutesAfter = 0) => {
    const today = new Date();
    const currentDay = today.toLocaleDateString("id-ID", { weekday: "long" }).toLowerCase();
    const currentTime = today.getHours() * 60 + today.getMinutes();
    
    const scheduleDay = schedule.jadwal?.hari?.toLowerCase() || schedule.hari?.toLowerCase();
    if (scheduleDay !== currentDay) return false;
    
    const [startHour, startMinute] = (schedule.jadwal?.jam_mulai || schedule.jam_mulai).split(':').map(Number);
    const [endHour, endMinute] = (schedule.jadwal?.jam_selesai || schedule.jam_selesai).split(':').map(Number);
    
    const scheduleStart = startHour * 60 + startMinute;
    const scheduleEnd = endHour * 60 + endMinute;
    
    return (currentTime >= (scheduleStart - minutesBefore)) && 
           (currentTime <= (scheduleEnd + minutesAfter));
  };

  // Fetch user schedules
  useEffect(() => {
    if (!user?.user_id) return;

    const fetchSchedules = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/asisten-kelas", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const allSchedules = Array.isArray(res.data) ? res.data : [res.data];
        const userSchedules = allSchedules.filter(
          (item) => item.asisten_id === Number(user.user_id) || item.asisten?.id === Number(user.user_id)
        );

        const today = new Date();
        const currentDay = today.toLocaleDateString("id-ID", { weekday: "long" }).toLowerCase();
        
        // Filter schedules for today
        const todaySchedules = userSchedules.filter(schedule => {
          const scheduleDay = schedule.jadwal?.hari?.toLowerCase() || schedule.hari?.toLowerCase();
          return scheduleDay === currentDay;
        });

        // Generate announcements based on schedules
        const newAnnouncements = [];
        
        todaySchedules.forEach(schedule => {
          const matkul = schedule.jadwal?.mata_kuliah?.nama || schedule.mata_kuliah?.nama;
          const kelas = schedule.jadwal?.kelas || schedule.kelas;
          const startTime = schedule.jadwal?.jam_mulai || schedule.jam_mulai;
          const endTime = schedule.jadwal?.jam_selesai || schedule.jam_selesai;
          
          // Check if presensi time is now (within 30 minutes before/after)
          if (isWithinTimeRange(schedule, 30, 30)) {
            newAnnouncements.push({
              title: "Waktu Presensi!",
              description: `Segera lakukan presensi untuk ${matkul} - ${kelas}`,
              icon: <FiClock className="text-xl" />,
              color: "bg-blue-100 text-blue-600",
              urgent: true
            });
          }
          
          // Check if presensi time is within 1 hour
          if (isWithinTimeRange(schedule, 60, 0)) {
            newAnnouncements.push({
              title: "Pengingat Presensi",
              description: `Presensi untuk ${matkul} - ${kelas} akan dimulai pukul ${startTime}`,
              icon: <FiBell className="text-xl" />,
              color: "bg-orange-100 text-orange-600"
            });
          }
        });

        // Add default announcements if no schedule-based announcements
        if (newAnnouncements.length === 0) {
          newAnnouncements.push(
            {
              title: "Rapat Koordinator",
              description: "Akan diadakan rapat koor rutin 3 minggu sekali pada Hari Jumat pukul 10.00",
              icon: <FiUsers className="text-xl" />,
              color: "bg-indigo-100 text-indigo-600"
            },
            {
              title: "Pengumuman!",
              description: "1. Ambil jadwal terlebih dahulu sesuai ketentuan Forum Asisten. 2. Selalu pastikan anda telah presensi sesuai jadwal yang anda ambil. 3. Cek secara berkala hasil rekapitulasi",
              icon: <FiBell className="text-xl" />,
              color: "bg-purple-100 text-purple-600"
            }
          );
        }

        setAnnouncements(newAnnouncements);
      } catch (err) {
        console.error("Failed to fetch schedules", err);
        // Fallback to default announcements
        setAnnouncements([
          {
            title: "Meeting Rutin",
            description: "Akan diadakan meeting rutin hari Jumat pukul 16.00",
            icon: <FiUsers className="text-xl" />,
            color: "bg-indigo-100 text-indigo-600"
          },
          {
            title: "Pengumuman!",
            description: "Diberitahukan kepada seluruh asisten mata kuliah Pemrograman...",
            icon: <FiBell className="text-xl" />,
            color: "bg-purple-100 text-purple-600"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [user?.user_id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

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
          {/* <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">Pengumuman & Notifikasi</h2> */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((item, index) => (
              <motion.article
                key={index}
                className={`bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden`}
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
                {item.urgent && (
                  <motion.button
                    className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/presensi'}
                  >
                    Presensi Sekarang <FiArrowUpRight className="text-xs" />
                  </motion.button>
                )}
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
          <div className="p-5 sm:p-6">
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