import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "../../components/Layout";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminHomePage() {
  const [stats, setStats] = useState([
    { title: "Total Asisten", value: "0", change: "0%", trend: "neutral" },
    { title: "Mata Kuliah", value: "0", change: "0", trend: "neutral" },
    { title: "Praktikum Aktif", value: "0", change: "0%", trend: "neutral" },
    { title: "Presensi Hari Ini", value: "0", change: "0", trend: "neutral" }
  ]);

  const [recentActivities, setRecentActivities] = useState([]);
  const [urgentTasks, setUrgentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const headers = {
          Authorization: `Bearer ${token}`
        };

        // Fetch all data in parallel
        const [usersRes, coursesRes, schedulesRes, presencesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/users`, { headers }),
          axios.get(`${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/mata-kuliah`, { headers }),
          axios.get(`${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/jadwal`, { headers }),
          axios.get(`${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/presensi?limit=20`, { headers })
        ]);

        // Process users data
        const activeAssistants = usersRes.data.filter(user => 
          user.role === "asisten" && user.status === "aktif"
        ).length;

        // Process courses data
        const totalCourses = coursesRes.data.length;

        // Process schedules data (Praktikum Aktif)
        const activePracticums = schedulesRes.data.length;

        // Process presences data
        const today = new Date();
        const todayDateString = today.toISOString().split('T')[0];
        
        const todayPresences = presencesRes.data.filter(presence => {
          const presenceDate = new Date(presence.waktu_input).toISOString().split('T')[0];
          return presenceDate === todayDateString;
        }).length;

        // Update stats
        setStats([
          { 
            title: "Total Asisten", 
            value: activeAssistants.toString(), 
            change: "+0%", 
            trend: "neutral" 
          },
          { 
            title: "Mata Kuliah", 
            value: totalCourses.toString(), 
            change: "+0", 
            trend: "neutral" 
          },
          { 
            title: "Praktikum Aktif", 
            value: activePracticums.toString(), 
            change: "0%", 
            trend: "neutral" 
          },
          { 
            title: "Presensi Hari Ini", 
            value: todayPresences.toString(), 
            change: "+0", 
            trend: "neutral" 
          }
        ]);

        // Format and group recent activities from presences
        const formattedActivities = presencesRes.data
          .sort((a, b) => new Date(b.waktu_input) - new Date(a.waktu_input)) // Sort by newest first
          .map(presence => ({
            id: presence.id,
            user: presence.asisten.nama,
            action: `melakukan presensi ${presence.status}`,
            course: presence.jadwal.mata_kuliah.nama,
            time: formatTimeAgo(presence.waktu_input),
            date: new Date(presence.waktu_input).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            rawDate: new Date(presence.waktu_input).toISOString().split('T')[0],
            rawTime: new Date(presence.waktu_input).toISOString()
          }));

        // Group activities by date
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

        // Convert to array and sort by date (newest first)
        const sortedGroupedActivities = Object.values(groupedActivities)
          .sort((a, b) => new Date(b.activities[0].rawTime) - new Date(a.activities[0].rawTime));

        setRecentActivities(sortedGroupedActivities);

        // Set urgent tasks based on data
        setUrgentTasks([
          {
            title: "Verifikasi Presensi",
            description: `${todayPresences} presensi hari ini perlu diverifikasi`,
            priority: todayPresences > 0 ? "high" : "low"
          },
          {
            title: "Kelola Jadwal Praktikum",
            description: `${activePracticums} jadwal aktif`,
            priority: "medium"
          },
          {
            title: "Update Materi",
            description: `${totalCourses} mata kuliah tersedia`,
            priority: "low"
          }
        ]);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} detik yang lalu`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
  };

  const handleActivityDetail = () => {
    navigate(`/admin/data-presensi`);
  };

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
              className="text-white bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-xl shadow hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-white">{stat.title}</p>
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

        <section className="grid gap-6 lg:grid-cols-3">
          {/* Aktivitas Presensi dengan Scroll Independen */}
          <motion.div 
            className="lg:col-span-2 bg-white p-6 rounded-xl shadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Presensi Terkini</h3>
            {recentActivities.length > 0 ? (
              <div 
                className="space-y-6 overflow-y-auto"
                style={{ maxHeight: "330px" }}
              >
                {recentActivities.map((group, groupIndex) => (
                  <div key={groupIndex} className="space-y-4">
                    <div className="text-sm font-medium text-gray-500 pb-2 sticky top-0 bg-white z-10">
                      {group.date}
                    </div>
                    {group.activities.map((activity) => (
                      <div 
                         
                        className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() => handleActivityDetail()}
                      >
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-full flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">
                            <span className="font-semibold">{activity.user}</span> {activity.action} untuk {activity.course}
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                        <button 
                          className="text-xs cursor-pointer text-blue-600 hover:text-blue-800 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivityDetail();
                          }}
                        >
                          Detail
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Tidak ada aktivitas presensi terkini</p>
            )}
          </motion.div>

          {/* Tugas Prioritas section remains the same... */}
        </section>
      </main>
    </Layout>
  );
}