import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiCalendar, FiBook, FiUser, FiEdit2, FiTrash2, FiPlus, FiX, FiCheck, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function DataJadwal() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [mataKuliahList, setMataKuliahList] = useState([]);
  const [dosenList, setDosenList] = useState([]);
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(null);

  // Time slots and labs
  const timeSlots = [
    "08:50 - 10:30",
    "10:40 - 12:20",
    "12:30 - 14:10",
    "14:20 - 16:00",
    "16:15 - 17:55",
    "18:05 - 18:55",
    "19:05 - 19:55"
  ];
  const labs = ["Lab 1", "Lab 2", "Lab 3", "Lab 4", "Lab 5", "Lab 6"];
  const days = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];

  // Form state
  const [formData, setFormData] = useState({
    mata_kuliah_id: "",
    dosen_id: "",
    hari: "SENIN",
    jam_mulai: "",
    jam_selesai: "",
    lab: "Lab 1",
    kelas: "",
    semester: ""
  });

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== "admin") {
        navigate("/unauthorized");
        return;
      }
      setUser({
        id: payload.user_id,
        role: payload.role,
        ...payload
      });
    } catch (err) {
      console.error("Token parsing error:", err);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  // Fetch data
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch schedules
        const schedulesRes = await axios.get("http://localhost:8080/api/admin/jadwal", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        // Fetch mata kuliah
        const mataKuliahRes = await axios.get("http://localhost:8080/api/admin/mata-kuliah", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        // Fetch dosen
        const dosenRes = await axios.get("http://localhost:8080/api/admin/dosen", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        setSchedules(schedulesRes.data);
        setMataKuliahList(mataKuliahRes.data);
        setDosenList(dosenRes.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle time slot selection
  const handleTimeSlotChange = (timeSlot) => {
    const [jam_mulai, jam_selesai] = timeSlot.split(" - ");
    setFormData({
      ...formData,
      jam_mulai,
      jam_selesai
    });
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Open modal for adding new schedule
  const openAddModal = () => {
    setEditMode(false);
    setCurrentSchedule(null);
    setFormData({
      mata_kuliah_id: "",
      dosen_id: "",
      hari: "SENIN",
      jam_mulai: "",
      jam_selesai: "",
      lab: "Lab 1",
      kelas: "",
      semester: ""
    });
    setShowModal(true);
  };

  // Open modal for editing schedule
  const openEditModal = (schedule) => {
    setEditMode(true);
    setCurrentSchedule(schedule);
    setFormData({
      mata_kuliah_id: schedule.mata_kuliah_id,
      dosen_id: schedule.dosen_id,
      hari: schedule.hari,
      jam_mulai: schedule.jam_mulai,
      jam_selesai: schedule.jam_selesai,
      lab: schedule.lab,
      kelas: schedule.kelas,
      semester: schedule.semester
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
  
      // Validasi data sebelum dikirim
      if (!formData.mata_kuliah_id || !formData.dosen_id || !formData.hari || 
          !formData.jam_mulai || !formData.jam_selesai || !formData.lab || 
          !formData.kelas || !formData.semester) {
        setError("Harap isi semua field yang diperlukan");
        return;
      }
  
      // Format data sesuai kebutuhan backend
      const payload = {
        mata_kuliah_id: parseInt(formData.mata_kuliah_id),
        dosen_id: parseInt(formData.dosen_id),
        hari: formData.hari,
        jam_mulai: formData.jam_mulai,
        jam_selesai: formData.jam_selesai,
        lab: formData.lab,
        kelas: formData.kelas,
        semester: parseInt(formData.semester)
      };
  
      if (editMode) {
        // Update existing schedule
        await axios.put(
          `http://localhost:8080/api/admin/jadwal/${currentSchedule.id}`,
          payload,
          { 
            headers: { 
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Create new schedule
        await axios.post(
          "http://localhost:8080/api/admin/jadwal",
          payload,
          { 
            headers: { 
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              'Content-Type': 'application/json'
            } 
          }
        );
      }
  
      // Refresh data
      const response = await axios.get("http://localhost:8080/api/admin/jadwal", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setSchedules(response.data);
      setShowModal(false);
    } catch (err) {
      console.error("Submit error:", err);
      // Tampilkan pesan error dari backend jika ada
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           "Gagal menyimpan data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) return;

    try {
      setLoading(true);
      await axios.delete(`http://localhost:8080/api/admin/jadwal/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      // Refresh data
      const response = await axios.get("http://localhost:8080/api/admin/jadwal", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setSchedules(response.data);
      showSuccess("Jadwal berhasil dihapus")
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Gagal menghapus data");
      showError("Gagal menghapus jadwal")
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengelompokkan jadwal
  const groupSchedules = () => {
    const grouped = {};
    
    schedules.forEach(schedule => {
      const programStudi = schedule.mata_kuliah?.program_studi?.nama || 'Lainnya';
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

  const [expandedGroups, setExpandedGroups] = useState({});
  
  const toggleGroup = (programStudi, semester) => {
    const key = `${programStudi}-${semester}`;
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const groupedSchedules = groupSchedules();

  if (loading) {
    return (
      <Layout>
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        </main>
      </Layout>
    );
  }

const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  return (
     <Layout>
      <main className="flex-1 p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Data Jadwal</h1>
            
            <p className="text-gray-600">Kelola jadwal perkuliahan</p>
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
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2" /> Tambah Jadwal
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            
          {Object.entries(groupedSchedules).map(([programStudi, semesters]) => (
            <div key={programStudi} className="mb-6">
              <h2 className="text-white text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 p-4" >{programStudi}</h2>
              
              {Object.entries(semesters).map(([semester, schedules]) => {
                const key = `${programStudi}-${semester}`;
                const isExpanded = expandedGroups[key] !== false; // Default expanded
                
                return (
                  <div key={key}>
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
                                        {item.mata_kuliah?.nama || 'N/A'}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {item.mata_kuliah?.kode || 'N/A'}
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
                                      {item.dosen?.nama || 'N/A'}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() => openEditModal(item)}
                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                  >
                                    <FiEdit2 className="inline mr-1" /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id)}
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

        {/* Modal for Add/Edit */}
        {showModal && (
          <div className="fixed inset-0 drop-shadow-2xl bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white text-black rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center  px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editMode ? "Edit Jadwal" : "Tambah Jadwal"}
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
                    Mata Kuliah
                  </label>
                  <select
                    name="mata_kuliah_id"
                    value={formData.mata_kuliah_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Pilih Mata Kuliah</option>
                    {mataKuliahList.map((mk) => (
                      <option key={mk.id} value={mk.id}>
                        {mk.kode} - {mk.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosen
                  </label>
                  <select
                    name="dosen_id"
                    value={formData.dosen_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Pilih Dosen</option>
                    {dosenList.map((dosen) => (
                      <option key={dosen.id} value={dosen.id}>
                        {dosen.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hari
                  </label>
                  <select
                    name="hari"
                    value={formData.hari}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu
                  </label>
                  <select
                    onChange={(e) => handleTimeSlotChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Pilih Waktu</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lab
                  </label>
                  <select
                    name="lab"
                    value={formData.lab}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {labs.map((lab) => (
                      <option key={lab} value={lab}>
                        {lab}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelas
                  </label>
                  <input
                    type="text"
                    name="kelas"
                    value={formData.kelas}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Semester
                  </label>
                  <input
                    type="number"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    min="1"
                    max="8"
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
      </main>
    </Layout>
  );
}