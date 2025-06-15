import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheck, FiLoader, FiSearch } from "react-icons/fi";

export default function DataProdi() {
  const [Prodi, setProdi] = useState([]);
  const [filteredProdi, setFilteredProdi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editProdiId, setEditProdiId] = useState(null);
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
    const fetchProdi = async () => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("http://localhost:8080/api/admin/program-studi", {
          headers: getAuthHeaders(),
        });
        setProdi(response.data || []);
        setFilteredProdi(response.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchProdi();
  }, [token]);

  // Filter Prodi based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProdi(Prodi);
    } else {
      const filtered = Prodi.filter(d =>
        d.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toString().includes(searchTerm)
      );
      setFilteredProdi(filtered);
    }
  }, [searchTerm, Prodi]);

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus data Program Studi ini?")) return;
    try {
      setSubmitting(true);
      await axios.delete(`http://localhost:8080/api/admin/program-studi/${id}`, {
        headers: getAuthHeaders(),
      });
      const updatedProdi = Prodi.filter((d) => d.id !== id);
      setProdi(updatedProdi);
      setFilteredProdi(updatedProdi);
      showSuccess("Program Studi berhasil dihapus");
    } catch (err) {
      showError(`Gagal menghapus Program Studi: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (d) => {
    setEditProdiId(d.id);
    setFormData({ nama: d.nama || "" });
  };

  const cancelEdit = () => {
    setEditProdiId(null);
    setFormData({ nama: "" });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      showError("Nama Program Studi harus diisi");
      return;
    }
    try {
      setSubmitting(true);
      await axios.put(`http://localhost:8080/api/admin/program-studi/${editProdiId}`, formData, {
        headers: getAuthHeaders(),
      });
      const updatedProdi = Prodi.map((d) => (d.id === editProdiId ? { ...d, ...formData } : d));
      setProdi(updatedProdi);
      setFilteredProdi(updatedProdi);
      cancelEdit();
      showSuccess("Prodi berhasil diupdate");
    } catch (err) {
      showError(`Gagal mengupdate Prodi: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddProdi = async () => {
    if (!formData.nama.trim()) {
      showError("Nama Program Studi harus diisi");
      return;
    }
    try {
      setSubmitting(true);
      const response = await axios.post("http://localhost:8080/api/admin/program-studi", formData, {
        headers: getAuthHeaders(),
      });
      const updatedProdi = [...Prodi, response.data];
      setProdi(updatedProdi);
      setFilteredProdi(updatedProdi);
      setFormData({ nama: "" });
      showSuccess("Program Studi berhasil ditambahkan");
    } catch (err) {
      showError(`Gagal menambah Program Studi: ${err.response?.data?.message || err.message}`);
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
    <Layout>
      <main className="flex-1 p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-blue-900 mb-6">Data Program Studi</h1>

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
              {editProdiId ? "Edit Program Studi" : "Tambah Program Studi Baru"}
            </h2>

            <form
              onSubmit={editProdiId ? handleEditSubmit : (e) => {
                e.preventDefault();
                handleAddProdi();
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Program Studi
                </label>
                <input
                  id="nama"
                  type="text"
                  placeholder="Masukkan nama Prodi"
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
                    editProdiId 
                      ? "bg-indigo-600 hover:bg-indigo-700" 
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white transition-colors ${
                    submitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <FiLoader className="animate-spin mr-2" />
                  ) : editProdiId ? (
                    <>
                      <FiCheck className="mr-2" />
                      Simpan Perubahan
                    </>
                  ) : (
                    <>
                      <FiPlus className="mr-2" />
                      Tambah Program Studi
                    </>
                  )}
                </button>
                
                {editProdiId && (
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

          {/* Prodi List */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-800">Daftar Prodi</h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap">
                  {filteredProdi.length} Program Studi
                </span>
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari Prodi..."
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
            ) : filteredProdi.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                </div>
                <p className="text-gray-500">
                  {searchTerm ? "Tidak ditemukan Prodi yang sesuai" : "Belum ada data Prodi."}
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
              <div className="divide-y divide-gray-200 overflow-y-auto" style={{ maxHeight: "200px" }}>
                <AnimatePresence>
                  {filteredProdi.map((d) => (
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
    </Layout>
  );
}