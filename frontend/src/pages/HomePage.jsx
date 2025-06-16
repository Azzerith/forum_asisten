import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiArrowUpRight, 
  FiTrendingUp, 
  FiClock, 
  FiBell, 
  FiUsers,
  FiBook,
  FiCheckCircle,
  FiAlertCircle,
  FiAlertTriangle
} from "react-icons/fi";
import Layout from "../components/Layout";
import axios from "axios";

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [userStatus, setUserStatus] = useState('aktif');
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userActions, setUserActions] = useState([]);

  // Get user from token
  useEffect(() => {
    const loadUser = async () => {
      setIsUserLoading(true);
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setUserStatus((parsedUser.status || 'aktif').toLowerCase());
          return;
        }
  
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUser(payload);
          localStorage.setItem('user', JSON.stringify(payload));
          setUserStatus((payload.status || 'aktif').toLowerCase());
        }
      } catch (err) {
        console.error("Error loading user:", err);
        setUserStatus('aktif');
      } finally {
        setIsUserLoading(false);
      }
    };
  
    loadUser();
  }, []);

  // Helper function to format time ago
  const formatTimeAgo = (date) => {
    // If date is not a Date object, try to parse it
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    // If still invalid, return default message
    if (isNaN(date.getTime())) {
      return "Waktu tidak tersedia";
    }
  
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    // Calculate time differences
    const seconds = Math.floor(diffInSeconds % 60);
    const minutes = Math.floor((diffInSeconds / 60) % 60);
    const hours = Math.floor((diffInSeconds / (60 * 60)) % 24);
    const days = Math.floor(diffInSeconds / (60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
  
    // Format output
    if (years > 0) return `${years} tahun yang lalu`;
    if (months > 0) return `${months} bulan yang lalu`;
    if (days > 0) return `${days} hari yang lalu`;
    if (hours > 0) return `${hours} jam yang lalu`;
    if (minutes > 0) return `${minutes} menit yang lalu`;
    return `${seconds} detik yang lalu`;
  };
  
  const calculateTimeDifference = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    // Hitung perbedaan waktu
    const seconds = Math.floor(diffInSeconds % 60);
    const minutes = Math.floor((diffInSeconds / 60) % 60);
    const hours = Math.floor((diffInSeconds / (60 * 60)) % 24);
    const days = Math.floor(diffInSeconds / (60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
  
    // Format output
    if (years > 0) return `${years} tahun yang lalu`;
    if (months > 0) return `${months} bulan yang lalu`;
    if (days > 0) return `${days} hari yang lalu`;
    if (hours > 0) return `${hours} jam yang lalu`;
    if (minutes > 0) return `${minutes} menit yang lalu`;
    return `${seconds} detik yang lalu`;
  };

  // Fetch user recent activities
  useEffect(() => {
    if (!user?.id || userStatus === 'non-aktif') return;
  
    const fetchUserActivities = async () => {
      try {
        setLoading(true);
        
        // Hanya fetch presensi saja (tidak perlu fetch jadwal)
        const presensiRes = await axios.get(`${import.meta.env.VITE_REACT_APP_BASEURL}/api/presensi?limit=20`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
    
        // Get current user ID
        const currentUserId = user?.id || JSON.parse(atob(localStorage.getItem("token").split(".")[1])).id;
    
        // Filter presensi untuk user saat ini yang memiliki waktu_input
        const userPresensi = presensiRes.data.filter(item => 
          (Number(item.user_id) === Number(currentUserId)) || 
          (Number(item.asisten_id) === Number(currentUserId)) &&
          item.waktu_input // Pastikan ada waktu_input
        );
    
        // Format data presensi
        const formattedActivities = userPresensi.map(item => {
          // Gunakan waktu_input sebagai acuan waktu
          const createdAt = new Date(item.waktu_input);
          
          // Validasi tanggal
          if (isNaN(createdAt.getTime())) {
            console.warn('Invalid date in presensi:', item.waktu_input);
            return null;
          }
          
          return {
            type: 'presensi',
            id: item.id,
            title: `Presensi ${item.status || 'tidak diketahui'}`,
            description: `${item.jadwal?.mata_kuliah?.nama || 'Mata Kuliah'} - ${item.jadwal?.kelas || 'Kelas'}`,
            time: formatTimeAgo(createdAt),
            date: createdAt.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            rawDate: createdAt.toISOString().split('T')[0],
            icon: <FiCheckCircle className="text-green-500" />,
            createdAt: createdAt.getTime()
          };
        }).filter(Boolean);
    
        // Urutkan berdasarkan tanggal terbaru
        formattedActivities.sort((a, b) => b.createdAt - a.createdAt);
    
        // Kelompokkan berdasarkan tanggal
        const groupedActivities = formattedActivities.reduce((acc, activity) => {
          if (!acc[activity.rawDate]) {
            acc[activity.rawDate] = {
              date: activity.date,
              activities: []
            };
          }
          acc[activity.rawDate].activities.push(activity);
          return acc;
        }, {});
    
        // Konversi ke array dan urutkan
        const sortedGroupedActivities = Object.values(groupedActivities)
          .sort((a, b) => new Date(b.activities[0].rawDate) - new Date(a.activities[0].rawDate));
    
        setRecentActivities(sortedGroupedActivities);
    
      } catch (error) {
        console.error("Error fetching activities:", error);
        setRecentActivities([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserActivities();
  }, [user?.id, userStatus]);

  // Fetch user schedules
  useEffect(() => {
    if (!user?.id || userStatus === 'non-aktif') return;

    const fetchSchedules = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BASEURL}/api/asisten-kelas?asisten_id=${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
        });

        const allSchedules = Array.isArray(res.data) ? res.data : [res.data];
        const userSchedules = allSchedules.filter(
          (item) => item.asisten_id === Number(user.id) || item.asisten?.id === Number(user.id)
        );

        const today = new Date();
        const currentDay = today.toLocaleDateString("id-ID", { weekday: "long" }).toLowerCase();
        
        // Filter schedules for today
        const todaySchedules = userSchedules.filter(schedule => {
          const scheduleDay = schedule.jadwal?.hari?.toLowerCase() || schedule.hari?.toLowerCase();
          return scheduleDay === currentDay;
        });

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
  }, [user?.id, userStatus]);

  const handleActivityDetail = (activity) => {
    // Implement your detail handling logic here
    console.log("Activity detail:", activity);
  };

  if (isUserLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  if (!user?.id) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500">User tidak terdeteksi</p>
        </div>
      </Layout>
    );
  }

  if (userStatus === 'non-aktif') {
    return (
      <Layout>
        <main className="flex-1 p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-2">Selamat Datang</h1>
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-red-200">
              <div className="p-6 md:p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <FiAlertCircle className="text-red-500 text-2xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Status Akun Non-Aktif</h2>
                  <p className="text-gray-600 mb-6">
                    Akun Anda saat ini berstatus non-aktif. Anda tidak dapat melakukan aksi pada halaman ini.
                    Silakan hubungi administrator untuk mengaktifkan akun Anda.
                  </p>
                  <div className="w-full bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        Status: Non-Aktif
                      </span>
                      <span className="text-gray-600 text-sm">
                        Nama: {user.nama}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Selamat Datang, {user.nama}!</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Berikut update terbaru untuk Anda</p>
        </motion.header>
        
        {/* Announcements Grid */}
        <section className="mb-8 sm:mb-10">
          {announcements.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ maxWidth: "1300px"}}>
              {announcements.map((item, index) => (
                <motion.article
                  key={index}
                  className={`relative ${item.urgent ? 'bg-gradient-to-r from-pink-600 to-violet-900' : 'bg-gradient-to-r from-blue-600 to-indigo-700'} text-white p-5 rounded-xl shadow-lg overflow-hidden z-0`}
                  style={{ maxHeight: "200px" }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{item.icon}</span>
                      <h2 className="text-lg font-semibold">{item.title}</h2>
                    </div>
                    <p className="text-xs md:text-sm opacity-90 mb-4">{item.description}</p>
                    {item.urgent ? (
                      <motion.button
                        className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.href = '/presensi'}
                      >
                        Presensi Sekarang <FiArrowUpRight className="text-xs" />
                      </motion.button>
                    )
                    : (
                      <div></div>
                    )}
                  </div>
                  
                  {item.urgent && (
                    <div className="absolute inset-0 overflow-hidden z-1">
                      <style jsx>{`
                        &::before {
                          content: '';
                          position: absolute;
                          top: 0;
                          left: -100%;
                          width: 100%;
                          height: 100%;
                          background: linear-gradient(
                            90deg,
                            transparent,
                            rgba(255, 255, 255, 0.4),
                            transparent
                          );
                          animation: shimmer 2s infinite;
                          z-index: 1;
                        }
                        
                        @keyframes shimmer {
                          100% {
                            left: 100%;
                          }
                        }
                      `}</style>
                    </div>
                  )}
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 text-yellow-600">
                <FiAlertTriangle className="text-xl" />
                <p>Tidak ada pengumuman saat ini</p>
              </div>
            </div>
          )}
        </section>

        {/* Recent Activities */}
        <motion.section 
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => window.location.href = '/rekapitulasi'}
        >
          <div className="p-5 sm:p-6 border-b border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Aktivitas Terkini</h3>
            <p className="text-sm text-gray-500 mt-1">Riwayat aktivitas terbaru Anda</p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {recentActivities.length > 0 ? (
              <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
                {recentActivities.map((group, groupIndex) => (
                  <div key={groupIndex} className="py-2">
                    <div className="px-5 py-3 text-sm font-medium text-gray-500 sticky top-0 bg-gray-50 z-10">
                      {group.date}
                    </div>
                    {group.activities.map((activity, index) => (
                      <motion.div
                        key={`${activity.type}-${activity.id}`}
                        className="p-4 sm:p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        onClick={() => handleActivityDetail(activity)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-100 text-blue-600 p-2 rounded-full flex-shrink-0 mt-1">
                            {activity.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-medium text-gray-800 mb-1">
                              {activity.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.time}
                            </p>
                          </div>
                          <button 
                            className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivityDetail(activity);
                            }}
                          >
                            Detail
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                className="p-4 sm:p-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada aktivitas terbaru</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>
      </motion.main>
    </Layout>
  );
}