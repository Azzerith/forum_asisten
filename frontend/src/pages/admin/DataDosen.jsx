import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import { motion } from "framer-motion";

export default function DataDosen() {
  const [dosen, setDosen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDosenId, setEditDosenId] = useState(null);
  const [formData, setFormData] = useState({ nama: "" });
  const [submitting, setSubmitting] = useState(false);

  // Ambil token tiap render / useEffect supaya selalu update
  const token = localStorage.getItem("token");

  // Header auth
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  // Fetch data dosen
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
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchDosen();
  }, [token]);

  // Handle hapus dosen
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus data dosen ini?")) return;
    try {
      setSubmitting(true);
      await axios.delete(`http://localhost:8080/api/admin/dosen/${id}`, {
        headers: getAuthHeaders(),
      });
      setDosen((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(`Gagal menghapus dosen: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Mulai edit dosen
  const startEdit = (d) => {
    setEditDosenId(d.id);
    setFormData({ nama: d.nama || "" });
  };

  // Batal edit
  const cancelEdit = () => {
    setEditDosenId(null);
    setFormData({ nama: "" });
  };

  // Submit edit dosen
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      alert("Nama dosen harus diisi");
      return;
    }
    try {
      setSubmitting(true);
      await axios.put(`http://localhost:8080/api/admin/dosen/${editDosenId}`, formData, {
        headers: getAuthHeaders(),
      });
      setDosen((prev) =>
        prev.map((d) => (d.id === editDosenId ? { ...d, ...formData } : d))
      );
      cancelEdit();
    } catch (err) {
      alert(`Gagal mengupdate dosen: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Tambah dosen baru
  const handleAddDosen = async () => {
    if (!formData.nama.trim()) {
      alert("Nama dosen harus diisi");
      return;
    }
    try {
      setSubmitting(true);
      const response = await axios.post("http://localhost:8080/api/admin/dosen", formData, {
        headers: getAuthHeaders(),
      });
      setDosen((prev) => [...prev, response.data]);
      setFormData({ nama: "" });
    } catch (err) {
      alert(`Gagal menambah dosen: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <p className="p-6 text-center text-gray-600">Loading data dosen...</p>
    );

  if (error)
    return (
      <p className="p-6 text-center text-red-600">Error: {error}</p>
    );

  return (
    <div className="flex min-h-screen min-w-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <motion.h1
          className="text-3xl font-bold text-blue-900 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Data Dosen
        </motion.h1>

        <motion.div
          className="bg-white p-6 rounded-xl shadow max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editDosenId ? "Edit Dosen" : "Tambah Dosen"}
          </h2>

          <form
            onSubmit={editDosenId ? handleEditSubmit : (e) => {
              e.preventDefault();
              handleAddDosen();
            }}
            className="mb-6 space-y-4"
          >
            <input
              type="text"
              placeholder="Nama Dosen"
              className="w-full p-2 border rounded text-black"
              value={formData.nama}
              onChange={(e) => setFormData({ nama: e.target.value })}
              disabled={submitting}
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                  submitting ? "opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={submitting}
              >
                {editDosenId ? "Update" : "Tambah"}
              </button>
              {editDosenId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  disabled={submitting}
                >
                  Batal
                </button>
              )}
            </div>
          </form>

          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Daftar Dosen Pengampu
          </h2>
          <div className="space-y-4">
            {dosen.length === 0 && (
              <p className="text-gray-500">Belum ada data dosen.</p>
            )}
            {dosen.map((d) => (
              <div
                key={d.id}
                className="text-black p-4 border-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex justify-between items-center"
              >
                <h3 className="font-semibold text-lg">{d.nama || "-"}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(d)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit"
                    disabled={submitting}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Hapus"
                    disabled={submitting}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
