import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiClock, 
  FiCalendar, 
  FiBook, 
  FiUser, 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiX, 
  FiCheck, 
  FiChevronDown, 
  FiChevronUp,
  FiDownload,
  FiEye,
  FiSearch
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function DataPresensi() {
  const [presensi, setPresensi] = useState([]);
  const [filteredPresensi, setFilteredPresensi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPresensi, setCurrentPresensi] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [groupBy, setGroupBy] = useState("date"); // 'matakuliah' or 'date'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'
  const [editingStatus, setEditingStatus] = useState(null);
  const [tempStatus, setTempStatus] = useState("");
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [presensiToDelete, setPresensiToDelete] = useState(null);

  // Status options
  const statusOptions = [
    { value: "hadir", label: "Hadir", color: "bg-green-100 text-green-800" },
    { value: "izin", label: "Izin", color: "bg-yellow-100 text-yellow-800" },
    { value: "alpha", label: "Alpha", color: "bg-red-100 text-red-800" }
  ];

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

        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/presensi`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        setPresensi(response.data);
        setFilteredPresensi(response.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Apply search filter and sorting
  useEffect(() => {
    let result = [...presensi];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.asisten?.nama?.toLowerCase().includes(term)) ||
        (item.asisten?.nim?.toLowerCase().includes(term)) ||
        (item.jadwal?.mata_kuliah?.nama?.toLowerCase().includes(term)) ||
        (item.jadwal?.kelas?.toLowerCase().includes(term)) ||
        (item.status?.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.waktu_input);
      const dateB = new Date(b.waktu_input);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredPresensi(result);
  }, [presensi, searchTerm, sortOrder]);

  // Group presensi by selected option
  const groupPresensi = () => {
    const grouped = {};
    
    filteredPresensi.forEach(item => {
      let key, programStudi, mataKuliah, date;
      
      if (groupBy === "matakuliah") {
        programStudi = item.jadwal?.mata_kuliah?.program_studi?.nama || 'Lainnya';
        mataKuliah = item.jadwal?.mata_kuliah?.nama || 'Unknown';
        key = `${programStudi}-${mataKuliah}`;
      } else {
        // Group by date (YYYY-MM-DD)
        date = new Date(item.waktu_input).toISOString().split('T')[0];
        key = date;
      }
      
      if (!grouped[key]) {
        grouped[key] = {
          key,
          programStudi: groupBy === "matakuliah" ? programStudi : null,
          mataKuliah: groupBy === "matakuliah" ? mataKuliah : null,
          date: groupBy === "date" ? date : null,
          items: []
        };
      }
      
      grouped[key].items.push(item);
    });
    
    return grouped;
  };

  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const groupedPresensi = groupPresensi();

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/presensi/${id}`,
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );
      
      // Update state after successful delete
      setPresensi(presensi.filter(item => item.id !== id));
      showSuccess("Presensi berhasil dihapus");
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Delete error:", err);
      showError(err.response?.data?.error || "Gagal menghapus presensi");
      setShowDeleteModal(false);
    }
  };

  const confirmDelete = (id) => {
    setPresensiToDelete(id);
    setShowDeleteModal(true);
  };

  const handleStatusEdit = (presensi) => {
    setEditingStatus(presensi.id);
    setTempStatus(presensi.status);
  };

  const cancelStatusEdit = () => {
    setEditingStatus(null);
    setTempStatus("");
  };

  const saveStatusEdit = async (id) => {
    try {
      setLoading(true);
      
      // Debug: log data sebelum dikirim
      console.log("Data yang akan dikirim:", {
        id,
        status: tempStatus,
        token: localStorage.getItem("token")
      });
  
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/presensi/${id}`,
        { status: tempStatus },
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );
  
      console.log("Response sukses:", response.data);
      
      // Update state
      const updated = presensi.map(item => 
        item.id === id ? { ...item, status: tempStatus } : item
      );
      setPresensi(updated);
      
      setEditingStatus(null);
      setTempStatus("");
      showSuccess("Status berhasil diperbarui");
    } catch (err) {
      console.error("Error detail:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      
      let errorMessage = "Gagal memperbarui status";
      if (err.response?.status === 401) {
        errorMessage = "Sesi habis, silakan login kembali";
        localStorage.removeItem("token");
        navigate("/login");
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const openDetailModal = (presensi) => {
    setCurrentPresensi(presensi);
    setShowModal(true);
  };

  if (loading) {
    return (
      <Layout>
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="flex-1 p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Data Presensi Asisten</h1>
            <p className="text-gray-600">Kelola data kehadiran asisten laboratorium</p>
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
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari asisten, NIM, matakuliah..."
                className="text-black pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Kelompokkan:</label>
              <select
                className="text-gray-700 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
              >
                <option value="matakuliah">Mata Kuliah</option>
                <option value="date">Tanggal</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Urutkan:</label>
              <select
                className="text-gray-700 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Terbaru</option>
                <option value="asc">Terlama</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden space-y-6 overflow-y-auto" style={{ maxHeight: "455px" }}>
          {Object.values(groupedPresensi).map((group) => {
            const isExpanded = expandedGroups[group.key] !== false;

            return (
              <div key={group.key}>
                <div 
                  className="text-black flex justify-between items-center p-4 bg-gray-200 cursor-pointer hover:bg-gray-400"
                  onClick={() => toggleGroup(group.key)}
                >
                  <div>
                    {groupBy === "matakuliah" ? (
                      <>
                        <h3 className="text-lg font-medium">{group.mataKuliah}</h3>
                        <p className="text-sm text-gray-600">{group.programStudi}</p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium">
                          {new Date(group.date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {group.items.length} presensi
                        </p>
                      </>
                    )}
                  </div>
                  {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asisten</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari/Jam</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas/Lab</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Input</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {group.items.map((item) => {
                          const status = statusOptions.find(s => s.value === item.status) || 
                                       { label: item.status, color: "bg-gray-100 text-gray-800" };
                          
                          return (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FiUser className="text-blue-600" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.asisten?.nama || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {item.asisten?.nim || 'N/A'} • {item.jenis}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <FiCalendar className="text-gray-400 mr-2" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.jadwal?.hari}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center">
                                      <FiClock className="mr-1" />
                                      {item.jadwal?.jam_mulai} - {item.jadwal?.jam_selesai}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{item.jadwal?.kelas}</div>
                                <div className="text-sm text-gray-500">{item.jadwal?.lab}</div>
                              </td>
                              <td className="px-6 py-4">
                                {editingStatus === item.id ? (
                                  <div className="flex items-center space-x-2">
                                    <select
                                      value={tempStatus}
                                      onChange={(e) => setTempStatus(e.target.value)}
                                      className="text-gray-700 border border-gray-300 rounded-md px-2 py-1 text-sm"
                                    >
                                      {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => saveStatusEdit(item.id)}
                                      className="text-green-600 hover:text-green-800"
                                    >
                                      <FiCheck />
                                    </button>
                                    <button
                                      onClick={cancelStatusEdit}
                                      className="text-red-600 hover:text-red-800"
                                    >
                                      <FiX />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                      {status.label}
                                    </span>
                                    <button
                                      onClick={() => handleStatusEdit(item)}
                                      className="ml-2 text-gray-500 hover:text-blue-600"
                                    >
                                      <FiEdit2 size={14} />
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(item.waktu_input).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => openDetailModal(item)}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                >
                                  <FiEye className="inline mr-1" /> Detail
                                </button>
                                <button
                                  onClick={() => confirmDelete(item.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FiTrash2 className="inline mr-1" /> Hapus
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal for Detail */}
        {showModal && currentPresensi && (
          <div className="fixed inset-0 drop-shadow-2xl bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white text-black rounded-lg shadow-xl w-full max-w-2xl">
              <div className="flex justify-between items-center  px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detail Presensi Asisten
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Asisten</h4>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiUser className="text-blue-600 text-xl" />
                      </div>
                      <div className="ml-4">
                        <p className="text-lg font-medium text-gray-900">
                          {currentPresensi.asisten?.nama || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {currentPresensi.asisten?.nim || 'N/A'} • {currentPresensi.jenis}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Mata Kuliah</h4>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <FiBook className="text-purple-600 text-xl" />
                      </div>
                      <div className="ml-4">
                        <p className="text-lg font-medium text-gray-900">
                          {currentPresensi.jadwal?.mata_kuliah?.nama || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {currentPresensi.jadwal?.mata_kuliah?.program_studi?.nama || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Hari/Jam</h4>
                    <div className="flex items-center">
                      <FiCalendar className="text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {currentPresensi.jadwal?.hari}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <FiClock className="mr-1" />
                          {currentPresensi.jadwal?.jam_mulai} - {currentPresensi.jadwal?.jam_selesai}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Kelas/Lab</h4>
                    <p className="text-sm font-medium text-gray-900">
                      {currentPresensi.jadwal?.kelas}
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentPresensi.jadwal?.lab}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                    {statusOptions.find(s => s.value === currentPresensi.status) ? (
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        statusOptions.find(s => s.value === currentPresensi.status).color
                      }`}>
                        {statusOptions.find(s => s.value === currentPresensi.status).label}
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                        {currentPresensi.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {currentPresensi.isi_materi && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Isi Materi</h4>
                      <div className="bg-gray-50 p-4 rounded-lg h-full">
                        <p className="text-gray-700">{currentPresensi.isi_materi}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      {currentPresensi.status === 'izin' ? 'Bukti Izin' : 'Bukti Kehadiran'}
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg h-full">
                      {currentPresensi.bukti_kehadiran || currentPresensi.bukti_izin ? (
                        <div className="flex flex-col h-full">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">
                              {currentPresensi.status === 'izin' ? 'Bukti izin' : 'Bukti kehadiran'}
                            </span>
                            <a 
                              href={currentPresensi.bukti_kehadiran || currentPresensi.bukti_izin} 
                              download
                              className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <FiDownload className="mr-1" />
                              Download
                            </a>
                          </div>
                          <div className="flex-1 flex items-center justify-center">
                            <img 
                              src={currentPresensi.bukti_kehadiran || currentPresensi.bukti_izin} 
                              alt={currentPresensi.status === 'izin' ? 'Bukti izin' : 'Bukti kehadiran'}
                              className="max-h-64 w-auto object-contain"
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = "https://via.placeholder.com/400x300?text=Gagal+memuat+gambar";
                              }}
                            />
                          </div>
                          {/* <p className="mt-2 text-xs text-gray-500 text-center">
                            Klik kanan pada gambar untuk opsi lainnya
                          </p> */}
                        </div>
                      ) : (
                        <p className="text-gray-500 h-full flex items-center justify-center">Tidak ada bukti</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showDeleteModal && (
    <div className="fixed inset-0 drop-shadow-2xl bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Konfirmasi Hapus</h3>
        <p className="mb-6">Apakah Anda yakin ingin menghapus presensi ini?</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={() => handleDelete(presensiToDelete)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  )}
      </main>
    </Layout>
  );
}