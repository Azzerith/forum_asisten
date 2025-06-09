import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarMenu from "../components/Sidebar";
import { FiClock, FiCalendar, FiBook, FiUser, FiHome, FiAlertCircle, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function JadwalAsistenPage() {
  const [schedules, setSchedules] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]); // Menyimpan semua jadwal untuk mencari asisten lain
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Get user from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log("Token payload:", payload);
        setUser({
          id: payload.user_id,
          ...payload
        });
      } catch (err) {
        console.error("Token parsing error:", err);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!user?.user_id) return;

    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);
    
        const response = await axios.get(
          "http://localhost:8080/api/asisten-kelas",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json"
            }
          }
        );
    
        const allSchedulesData = response.data;
        setAllSchedules(allSchedulesData);
    
        // Filter jadwal untuk user yang login
        const userSchedules = allSchedulesData.filter(
          item => item.asisten_id === Number(user.user_id)
        );
    
        console.log("Filtered schedules:", userSchedules);
        setSchedules(userSchedules);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.error || err.message || "Failed to load schedules");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedules();
  }, [user?.id]);

  // Fungsi untuk mendapatkan daftar asisten yang mengambil jadwal yang sama
  const getAssistantsForSchedule = (jadwalId) => {
    const assistants = allSchedules
      .filter(item => item.jadwal_id === jadwalId)
      .map(item => item.user.nama);
    
    // Filter out the current user if needed
    // const otherAssistants = assistants.filter(name => name !== user?.nama);
    
    // Jika hanya ada 1 asisten (user sendiri), tambahkan "-"
    if (assistants.length === 1) {
      return [assistants[0], "-"];
    }
    
    return assistants.slice(0, 2); // Ambil maksimal 2 asisten
  };

  if (loading) {
    return (
      <div className="flex min-h-screen min-w-screen bg-gray-50">
        <SidebarMenu />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data jadwal...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen min-w-screen bg-gray-50">
        <SidebarMenu />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center text-red-500">
            <p>Gagal memuat data: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-w-screen bg-gray-50">
      <SidebarMenu />
      <main className="flex-1 p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Jadwal Saya</h1>
            <p className="text-gray-600">Daftar jadwal yang Anda ambil sebagai asisten</p>
          </div>
          <button 
            onClick={() => navigate("/mata-kuliah")}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiHome className="mr-2" /> Kembali ke Mata Kuliah
          </button>
        </div>

        {schedules.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <p className="text-gray-500">Anda belum mengambil jadwal sebagai asisten.</p>
            <button
              onClick={() => navigate("/mata-kuliah")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ambil Jadwal Sekarang
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Kuliah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari/Jam</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas/Lab</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asisten</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedules.map((item) => {
                    const assistants = getAssistantsForSchedule(item.jadwal_id);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FiBook className="text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.jadwal.mata_kuliah.nama}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.jadwal.mata_kuliah.kode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiCalendar className="text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.jadwal.hari}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <FiClock className="mr-1" />
                                {item.jadwal.jam_mulai} - {item.jadwal.jam_selesai}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.jadwal.kelas}</div>
                          <div className="text-sm text-gray-500">{item.jadwal.lab}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiUser className="text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {item.jadwal.dosen.nama}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiUsers className="text-gray-400 mr-2" />
                            <div>
                              {assistants.map((name, index) => (
                                <div key={index} className="text-sm text-gray-900">
                                  {name}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Semester {item.jadwal.semester}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}