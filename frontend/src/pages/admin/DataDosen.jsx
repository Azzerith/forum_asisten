import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheck, FiLoader, FiSearch } from "react-icons/fi";

export default function DataDosen() {
  const [dosen, setDosen] = useState([]);
  const [filteredDosen, setFilteredDosen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDosenId, setEditDosenId] = useState(null);
  const [formData, setFormData] = useState({ nama: "" });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  useEffect(() => {
    const fetchDosen = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("http://localhost:8080/api/admin/dosen", {
          headers: getAuthHeaders(),
        });
        setDosen(response.data || []);
        setFilteredDosen(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchDosen();
  }, [token]);

  // Filter dosen based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDosen(dosen);
    } else {
      const filtered = dosen.filter(d =>
        d.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toString().includes(searchTerm)
      );
      setFilteredDosen(filtered);
    }
  }, [searchTerm, dosen]);

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus data dosen ini?")) return;
    try {
      setSubmitting(true);
      await axios.delete(`http://localhost:8080/api/admin/dosen/${id}`, {
        headers: getAuthHeaders(),
      });
      const updatedDosen = dosen.filter((d) => d.id !== id);
      setDosen(updatedDosen);
      setFilteredDosen(updatedDosen);
      showSuccess("Dosen berhasil dihapus");
    } catch (err) {
      showError(`Gagal menghapus dosen: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (d) => {
    setEditDosenId(d.id);
    setFormData({ nama: d.nama || "" });
  };

  const cancelEdit = () => {
    setEditDosenId(null);
    setFormData({ nama: "" });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      showError("Nama dosen harus diisi");
      return;
    }
    try {
      setSubmitting(true);
      await axios.put(`http://localhost:8080/api/admin/dosen/${editDosenId}`, formData, {
        headers: getAuthHeaders(),
      });
      const updatedDosen = dosen.map((d) => (d.id === editDosenId ? { ...d, ...formData } : d));
      setDosen(updatedDosen);
      setFilteredDosen(updatedDosen);
      cancelEdit();
      showSuccess("Dosen berhasil diupdate");
    } catch (err) {
      showError(`Gagal mengupdate dosen: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDosen = async () => {
    if (!formData.nama.trim()) {
      showError("Nama dosen harus diisi");
      return;
    }
    try {
      setSubmitting(true);
      const response = await axios.post("http://localhost:8080/api/admin/dosen", formData, {
        headers: getAuthHeaders(),
      });
      const updatedDosen = [...dosen, response.data];
      setDosen(updatedDosen);
      setFilteredDosen(updatedDosen);
      setFormData({ nama: "" });
      showSuccess("Dosen berhasil ditambahkan");
    } catch (err) {
      showError(`Gagal menambah dosen: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
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

  return (
    <div className="flex min-h-screen min-w-screen bg-gray-50">
      {/* Fixed Sidebar */}
        <AdminSidebar />

      {/* Main Content with padding to account for fixed sidebar */}
      <main className="flex-1 p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Dosen</h1>

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

          {/* Form Section */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-md mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editDosenId ? "Edit Dosen" : "Tambah Dosen Baru"}
            </h2>

            <form
              onSubmit={editDosenId ? handleEditSubmit : (e) => {
                e.preventDefault();
                handleAddDosen();
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Dosen
                </label>
                <input
                  id="nama"
                  type="text"
                  placeholder="Masukkan nama dosen"
                  className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={formData.nama}
                  onChange={(e) => setFormData({ nama: e.target.value })}
                  disabled={submitting}
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className={`flex items-center justify-center px-5 py-2.5 rounded-lg ${
                    editDosenId 
                      ? "bg-indigo-600 hover:bg-indigo-700" 
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white transition-colors ${
                    submitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <FiLoader className="animate-spin mr-2" />
                  ) : editDosenId ? (
                    <>
                      <FiCheck className="mr-2" />
                      Simpan Perubahan
                    </>
                  ) : (
                    <>
                      <FiPlus className="mr-2" />
                      Tambah Dosen
                    </>
                  )}
                </button>
                
                {editDosenId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex items-center justify-center px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-white rounded-lg transition-colors"
                    disabled={submitting}
                  >
                    <FiX className="mr-2" />
                    Batal
                  </button>
                )}
              </div>
            </form>
          </motion.div>

          {/* Dosen List */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Daftar Dosen</h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap">
                  {filteredDosen.length} Dosen
                </span>
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari dosen..."
                    className=" text-black block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredDosen.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <p className="text-gray-500">
                  {searchTerm ? "Tidak ditemukan dosen yang sesuai" : "Belum ada data dosen."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Reset pencarian
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredDosen.map((d) => (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-black py-4 flex justify-between items-center hover:bg-gray-50 px-3 rounded-lg transition-colors"
                    >
                      <div>
                        <h3 className="font-medium text-gray-800">{d.nama || "-"}</h3>
                        <p className="text-sm text-gray-500">ID: {d.id}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(d)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Edit"
                          disabled={submitting}
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Hapus"
                          disabled={submitting}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}