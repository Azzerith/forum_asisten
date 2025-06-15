import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { motion } from "framer-motion";
import axios from "axios";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiUser, FiMail, FiKey } from "react-icons/fi";

export default function DataUser() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    nim: "",
    email: "",
    password: "",
    role: "asisten",
    status: "aktif"
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
      alert(`Gagal mengambil data: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus user ini?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(prev => prev.filter(u => u.id !== id));
      alert("User berhasil dihapus");
    } catch (error) {
      console.error("Gagal menghapus user:", error);
      alert(`Gagal menghapus: ${error.response?.data?.message || error.message}`);
    }
  };

  const toggleStatus = async (user) => {
    const currentStatus = user.status.toLowerCase();
    const newStatus = currentStatus === "aktif" ? "non-aktif" : "aktif";
    
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/admin/users/${user.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, status: newStatus } : u
      ));
    } catch (error) {
      console.error("Gagal mengubah status:", error);
      alert(`Gagal mengubah status: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nama.trim()) newErrors.nama = "Nama wajib diisi";
    if (!formData.nim.trim()) newErrors.nim = "NIM wajib diisi";
    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email tidak valid";
    }
    if (!selectedUser && !formData.password.trim()) {
      newErrors.password = "Password wajib diisi";
    } else if (!selectedUser && formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      let response;
      
      if (selectedUser) {
        // Update existing user - tanpa password jika tidak diubah
        const updateData = {
          nama: formData.nama,
          nim: formData.nim,
          email: formData.email,
          role: formData.role,
          status: formData.status
        };
        response = await axios.put(
          `http://localhost:8080/api/admin/users/${selectedUser.id}`,
          updateData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new user
        response = await axios.post(
          "http://localhost:8080/api/admin/users",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      alert(selectedUser ? "User berhasil diperbarui" : "User berhasil ditambahkan");
      fetchUsers();
      setShowForm(false);
    } catch (error) {
      console.error("Gagal menyimpan user:", error);
      let errorMessage = "Terjadi kesalahan saat menyimpan data";
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = "Data yang dimasukkan tidak valid";
        } else if (error.response.status === 409) {
          errorMessage = "Email atau NIM sudah terdaftar";
        } else {
          errorMessage = error.response.data.message || errorMessage;
        }
      }
      
      alert(`Gagal: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nim.includes(searchTerm)
  );

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        nama: selectedUser.nama,
        nim: selectedUser.nim,
        email: selectedUser.email,
        password: "", // Kosongkan password saat edit
        role: selectedUser.role,
        status: selectedUser.status
      });
    } else {
      setFormData({
        nama: "",
        nim: "",
        email: "",
        password: "",
        role: "asisten",
        status: "aktif"
      });
    }
  }, [selectedUser]);

  return (
    <Layout>
      <main className="flex-1 p-6 overflow-x-hidden">
        <motion.h1 
          className="text-3xl font-bold text-blue-900 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Data User
        </motion.h1>

        <motion.div 
          className="bg-white p-6 rounded-xl shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari user..."
                className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              onClick={() => {
                setSelectedUser(null);
                setShowForm(true);
              }}
            >
              <FiPlus className="mr-2" />
              Tambah User
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 space-y-6 overflow-y-auto" style={{ maxHeight: "450px" }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.nama}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.nim}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            user.role.toLowerCase() === "koordinator" ? "bg-purple-100 text-purple-800" :
                            user.role.toLowerCase() === "admin" ? "bg-yellow-100 text-yellow-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`mr-2 text-sm ${
                              user.status.toLowerCase() === "aktif" ? "text-green-600" : "text-red-600"
                            }`}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={user.status.toLowerCase() === "aktif"}
                                onChange={() => toggleStatus(user)}
                              />
                              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                              <span className="ml-2 text-sm font-medium text-gray-700">
                                {user.status.toLowerCase() === "aktif" ? "Aktif" : "Non-Aktif"}
                              </span>
                            </label>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowForm(true);
                              }}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Hapus"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Tidak ada data user yang ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {showForm && (
          <motion.div 
            className="fixed inset-0 drop-shadow-2xl bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedUser ? "Edit User" : "Tambah User Baru"}
                </h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-black">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="nama"
                      className={`pl-10 w-full px-4 py-2 border ${errors.nama ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      value={formData.nama}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                  <input
                    type="text"
                    name="nim"
                    className={`w-full px-4 py-2 border ${errors.nim ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={formData.nim}
                    onChange={handleInputChange}
                  />
                  {errors.nim && <p className="mt-1 text-sm text-red-600">{errors.nim}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      className={`pl-10 w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {!selectedUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiKey className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="password"
                        className={`pl-10 w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      name="role"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value="asisten">Asisten</option>
                      <option value="admin">Admin</option>
                      <option value="koordinator">Koordinator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="non-aktif">Non-Aktif</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowForm(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <FiCheck className="mr-2" />
                        Simpan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </main>
    </Layout>
  );
}