import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { FiX, FiClock, FiCalendar, FiBook, FiUser, FiHome, FiAlertCircle, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function JadwalAsistenPage() {
  const [schedules, setSchedules] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
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

  // Mobile-friendly schedule row component
  const ScheduleRow = ({ item }) => {
    const assistants = getAssistantsForSchedule(item.jadwal_id);
    
    return (
      <div className="border-b border-gray-200 p-4 md:p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FiBook className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm md:text-base font-medium text-gray-900 truncate">
              {item.jadwal.mata_kuliah.nama}
            </div>
            <div className="text-xs text-gray-500">
              {item.jadwal.mata_kuliah.kode}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-500">Hari/Jam</div>
            <div className="flex items-center mt-1">
              <FiCalendar className="text-gray-400 mr-2 text-sm" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {item.jadwal.hari}
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <FiClock className="mr-1" />
                  {item.jadwal.jam_mulai} - {item.jadwal.jam_selesai}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Kelas/Lab</div>
            <div className="mt-1">
              <div className="text-sm text-gray-900">{item.jadwal.kelas}</div>
              <div className="text-xs text-gray-500">{item.jadwal.lab}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Dosen</div>
            <div className="flex items-center mt-1">
              <FiUser className="text-gray-400 mr-2 text-sm" />
              <div className="text-sm text-gray-900">
                {item.jadwal.dosen.nama}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Asisten</div>
            <div className="flex items-center mt-1">
              <FiUsers className="text-gray-400 mr-2 text-sm" />
              <div>
                {assistants.map((name, index) => (
                  <div key={index} className="text-sm text-gray-900">
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Semester {item.jadwal.semester}
          </span>
        </div>
      </div>
    );
  };

  const getAssistantsForSchedule = (jadwalId) => {
    const assistants = allSchedules
      .filter(item => item.jadwal_id === jadwalId)
      .map(item => item.user.nama);
    
    if (assistants.length === 1) {
      return [assistants[0], "-"];
    }
    
    return assistants.slice(0, 2);
  };

  if (loading) {
    return (
      <Layout>
        <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data jadwal...</p>
          </div>
        </main>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
          <div className="text-center text-red-500 max-w-md">
            <FiAlertCircle className="mx-auto h-12 w-12 mb-4" />
            <p className="mb-4">Gagal memuat data: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm md:text-base"
            >
              Coba Lagi
            </button>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
        {/* <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Jadwal Saya</h1>
            <p className="text-xs md:text-sm text-gray-600">Daftar jadwal yang Anda ambil sebagai asisten</p>
          </div>
        </div> */}

        {schedules.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <p className="text-gray-500 mb-4">Anda belum mengambil jadwal sebagai asisten.</p>
            <button
              onClick={() => navigate("/mata-kuliah")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
            >
              Ambil Jadwal Sekarang
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
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

            {/* Mobile List */}
            <div className="md:hidden">
              {schedules.map((item) => (
                <ScheduleRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}