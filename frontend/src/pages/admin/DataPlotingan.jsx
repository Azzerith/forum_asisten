import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarMenu from "../../components/AdminSidebar";
import { 
  FiClock, 
  FiCalendar, 
  FiBook, 
  FiUser, 
  FiHome, 
  FiAlertCircle,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiUsers,
  FiX,
  FiCheck,
  FiChevronDown,
  FiChevronUp
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function DataPlotingan() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  // State for expanded groups
  const [expandedGroups, setExpandedGroups] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    jadwal_id: "",
    asisten_id: ""
  });

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

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const response = await axios.get(
        "http://localhost:8080/api/admin/asisten-kelas",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );
  
      setSchedules(response.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.error || err.message || "Failed to load schedules");
      if (err.response?.status === 403) {
        setError("Anda tidak memiliki akses ke halaman ini");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSchedules();
    }
  }, [user?.id]);

  // Group schedules by program studi and semester
  const groupSchedules = () => {
    const grouped = {};
    
    // First group by jadwal_id to combine assistants
    const combinedSchedules = {};
    schedules.forEach(schedule => {
      if (!combinedSchedules[schedule.jadwal_id]) {
        combinedSchedules[schedule.jadwal_id] = {
          ...schedule.jadwal,
          assistants: [schedule.user]
        };
      } else {
        combinedSchedules[schedule.jadwal_id].assistants.push(schedule.user);
      }
    });

    // Then group by program studi and semester
    Object.values(combinedSchedules).forEach(schedule => {
      const programStudi = schedule.mata_kuliah.program_studi?.nama || 'Lainnya';
      const semester = `Semester ${schedule.semester}`;
      
      if (!grouped[programStudi]) {
        grouped[programStudi] = {};
      }
      
      if (!grouped[programStudi][semester]) {
        grouped[programStudi][semester] = [];
      }
      
      grouped[programStudi][semester].push(schedule);
    });
    
    return grouped;
  };

  const groupedSchedules = groupSchedules();

  // Toggle group expansion
  const toggleGroup = (programStudi, semester) => {
    const key = `${programStudi}-${semester}`;
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Open edit modal
  const openEditModal = (schedule) => {
    setCurrentSchedule(schedule);
    setFormData({
      jadwal_id: schedule.jadwal_id,
      asisten_id: schedule.asisten_id
    });
    setShowModal(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (schedule) => {
    setScheduleToDelete(schedule);
    setShowDeleteModal(true);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (currentSchedule) {
        // Update existing schedule
        await axios.put(
          `http://localhost:8080/api/admin/asisten-kelas/${currentSchedule.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json"
            }
          }
        );
        setSuccessMessage("Jadwal asisten berhasil diperbarui");
      } else {
        // Create new schedule
        await axios.post(
          "http://localhost:8080/api/admin/asisten-kelas",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json"
            }
          }
        );
        setSuccessMessage("Jadwal asisten berhasil ditambahkan");
      }
      fetchSchedules();
      setShowModal(false);
    } catch (err) {
      console.error("Error saving schedule:", err);
      setError(err.response?.data?.error || "Gagal menyimpan jadwal asisten");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `http://localhost:8080/api/admin/asisten-kelas/${scheduleToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );
      setSuccessMessage("Jadwal asisten berhasil dihapus");
      fetchSchedules();
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error deleting schedule:", err);
      setError(err.response?.data?.error || "Gagal menghapus jadwal asisten");
    } finally {
      setLoading(false);
    }
  };

  // Show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Show error message
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  if (loading && schedules.length === 0) {
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

  if (error && schedules.length === 0) {
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
            <h1 className="text-2xl font-bold text-gray-800">Data Jadwal Asisten</h1>
            <p className="text-gray-600">Kelola jadwal asisten kelas/laboratorium</p>
            
            {/* Notification Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded"
                >
                  <p>{error}</p>
                </motion.div>
              )}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded"
                >
                  <p>{successMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={() => {
              setCurrentSchedule(null);
              setFormData({ jadwal_id: "", asisten_id: "" });
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2" /> Tambah Jadwal
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {Object.entries(groupedSchedules).map(([programStudi, semesters]) => (
            <div key={programStudi} className="mb-6">
              <h2 className="text-white text-xl font-semibold bg-gradient-to-b from-blue-700 to-indigo-700 p-4">
                {programStudi}
              </h2>
              
              {Object.entries(semesters).map(([semester, schedules]) => {
                const key = `${programStudi}-${semester}`;
                const isExpanded = expandedGroups[key] !== false; // Default expanded
                
                return (
                  <div key={key} className="border-b">
                    <div 
                      className="text-black flex justify-between items-center p-4 bg-gray-200 cursor-pointer hover:bg-gray-400"
                      onClick={() => toggleGroup(programStudi, semester)}
                    >
                      <h3 className="text-lg font-medium">{semester}</h3>
                      {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                    
                    {isExpanded && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Kuliah</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari/Jam</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas/Lab</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosen</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asisten</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {schedules.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                      <FiBook className="text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {item.mata_kuliah.nama}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {item.mata_kuliah.kode}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <FiCalendar className="text-gray-400 mr-2" />
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {item.hari}
                                      </div>
                                      <div className="text-sm text-gray-500 flex items-center">
                                        <FiClock className="mr-1" />
                                        {item.jam_mulai} - {item.jam_selesai}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">{item.kelas}</div>
                                  <div className="text-sm text-gray-500">{item.lab}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center">
                                    <FiUser className="text-gray-400 mr-2" />
                                    <div className="text-sm text-gray-900">
                                      {item.dosen.nama}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-2">
                                    {item.assistants.map((asisten, idx) => (
                                      <div key={idx} className="flex items-center">
                                        <FiUsers className="text-gray-400 mr-2" />
                                        <div className="text-sm text-gray-900">
                                          {asisten.nama} ({asisten.nim})
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() => openEditModal(item)}
                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                  >
                                    <FiEdit className="inline mr-1" /> Edit
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(item)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <FiTrash2 className="inline mr-1" /> Hapus
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 drop-shadow-2xl bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center border-b px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentSchedule ? "Edit Jadwal Asisten" : "Tambah Jadwal Asisten"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                  </div>
                )}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Jadwal
                  </label>
                  <input
                    type="text"
                    name="jadwal_id"
                    value={formData.jadwal_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Asisten
                  </label>
                  <input
                    type="text"
                    name="asisten_id"
                    value={formData.asisten_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiCheck className="inline mr-1" /> Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 drop-shadow-2xl bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center border-b px-6 py-4">
                <h3 className="text-lg font-medium text-red-600">
                  Konfirmasi Hapus
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <p className="mb-6">
                  Apakah Anda yakin ingin menghapus jadwal asisten untuk mata kuliah{" "}
                  <strong>{scheduleToDelete?.mata_kuliah.nama}</strong>?
                </p>
                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FiCheck className="inline mr-1" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}