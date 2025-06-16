import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiUser, FiMail, FiKey, FiLoader, FiPhone } from "react-icons/fi";

export default function DataUser() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    nim: "",
    email: "",
    password: "",
    role: "asisten",
    status: "aktif",
    telepon: "",
  });
  const [errors, setErrors] = useState({});
  const [currentUserRole, setCurrentUserRole] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);

  const token = localStorage.getItem("token");

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserRole(payload.role);
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/users`, {
        headers: getAuthHeaders(),
      });
      setUsers(response.data || []);
      setFilteredUsers(response.data || []);
    } catch (error) {
      showError(`Gagal mengambil data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nim.includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telepon.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus user ini?")) return;
    
    try {
      setSubmitting(true);
      await axios.delete(`${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/users/${id}`, {
        headers: getAuthHeaders(),
      });
      const updatedUsers = users.filter(u => u.id !== id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      showSuccess("User berhasil dihapus");
    } catch (error) {
      showError(`Gagal menghapus: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status.toLowerCase() === "aktif" ? "non-aktif" : "aktif";
    
    try {
      setSubmitting(true);
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/users/${user.id}/status`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, status: newStatus } : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      showSuccess(`Status berhasil diubah menjadi ${newStatus}`);
    } catch (error) {
      showError(`Gagal mengubah status: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    if (!formData.telepon.trim()) {
      newErrors.telepon = "Nomor telepon wajib diisi";
    } else if (!/^[0-9]+$/.test(formData.telepon)) {
      newErrors.telepon = "Nomor telepon harus angka";
    }
    
    // Only validate password if it's a new user or password field is shown for editing
    if ((!selectedUser || showPasswordField) && !formData.password.trim()) {
      newErrors.password = "Password wajib diisi";
    } else if ((!selectedUser || showPasswordField) && formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const dataToSend = {
        nama: formData.nama,
        nim: formData.nim,
        email: formData.email,
        telepon: formData.telepon,
        role: formData.role,
        status: formData.status
      };

      // Include password only if it's a new user or password field is shown
      if (!selectedUser || showPasswordField) {
        dataToSend.password = formData.password;
      }

      if (selectedUser) {
        // Update user
        await axios.put(
          `${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/users/${selectedUser.id}`,
          dataToSend,
          { headers: getAuthHeaders() }
        );
        showSuccess("User berhasil diperbarui");
      } else {
        // Create new user
        await axios.post(
          `${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/users`,
          dataToSend,
          { headers: getAuthHeaders() }
        );
        showSuccess("User berhasil ditambahkan");
      }
      fetchUsers();
      setShowForm(false);
      setShowPasswordField(false);
    } catch (error) {
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
      showError(errorMessage);
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

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        nama: selectedUser.nama,
        nim: selectedUser.nim,
        email: selectedUser.email,
        telepon: selectedUser.telepon,
        password: "",
        role: selectedUser.role,
        status: selectedUser.status
      });
      setShowPasswordField(false);
    } else {
      setFormData({
        nama: "",
        nim: "",
        email: "",
        telepon: "",
        password: "",
        role: "asisten",
        status: "aktif"
      });
    }
  }, [selectedUser]);

  const adminUsers = filteredUsers.filter(user => user.role === 'admin');
  const asistenUsers = filteredUsers.filter(user => user.role === 'asisten');

  const UserCard = ({ user, currentUserRole, onEdit, onDelete, onToggleStatus, submitting }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="py-4 flex justify-between items-center hover:bg-gray-50 px-3 rounded-lg transition-colors"
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-800 truncate">{user.nama || "-"}</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
          <p className="text-sm text-gray-500">NIM: {user.nim}</p>
          <p className="text-sm text-gray-500">Email: {user.email}</p>
          <p className="text-sm text-gray-500 hidden sm:inline">Telp: {user.telepon}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {currentUserRole === 'admin' && (
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              user.status.toLowerCase() === "aktif" ? "text-green-600" : "text-red-600"
            }`}>
              {user.status.toLowerCase() === "aktif" ? "Aktif" : "Non-Aktif"}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={user.status.toLowerCase() === "aktif"}
                onChange={onToggleStatus}
                disabled={submitting}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
        )}
        
        {currentUserRole === 'admin' && (
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Edit"
              disabled={submitting}
            >
              <FiEdit2 size={18} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Hapus"
              disabled={submitting}
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <Layout>
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header with Search and Add Button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-900">Data User</h1>
            
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari user..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {currentUserRole === 'admin' && (
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setShowForm(true);
                  }}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  <FiPlus className="mr-2" />
                  Tambah User
                </button>
              )}
            </div>
          </div>

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
          {showForm && (
            <motion.div
              className="bg-white p-6 rounded-xl shadow-md mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedUser ? "Edit User" : "Tambah User Baru"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="nama"
                      className={`pl-10 w-full p-3 border ${
                        errors.nama ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                      value={formData.nama}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                  </div>
                  {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                  <input
                    type="text"
                    name="nim"
                    className={`w-full p-3 border ${
                      errors.nim ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                    value={formData.nim}
                    onChange={handleInputChange}
                    disabled={submitting}
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
                      className={`pl-10 w-full p-3 border ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="telepon"
                      className={`pl-10 w-full p-3 border ${
                        errors.telepon ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                      value={formData.telepon}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                  </div>
                  {errors.telepon && <p className="mt-1 text-sm text-red-600">{errors.telepon}</p>}
                </div>

                {/* Password field - always shown for new user, toggleable for edit */}
                {(!selectedUser || showPasswordField) && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      {selectedUser && (
                        <button
                          type="button"
                          onClick={() => setShowPasswordField(false)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Sembunyikan
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiKey className="text-gray-400" />
                      </div>
                      <input
                        type="password"
                        name="password"
                        className={`pl-10 w-full p-3 border ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={submitting}
                        placeholder={selectedUser ? "Masukkan password baru" : ""}
                      />
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>
                )}

                {selectedUser && !showPasswordField && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowPasswordField(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ubah Password
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      name="role"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={submitting}
                    >
                      <option value="asisten">Asisten</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={submitting}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="non-aktif">Non-Aktif</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className={`flex items-center justify-center px-5 py-2.5 rounded-lg ${
                      selectedUser ? "bg-indigo-600 hover:bg-indigo-700" : "bg-blue-600 hover:bg-blue-700"
                    } text-white transition-colors ${
                      submitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <FiLoader className="animate-spin mr-2" />
                    ) : selectedUser ? (
                      <>
                        <FiCheck className="mr-2" />
                        Simpan Perubahan
                      </>
                    ) : (
                      <>
                        <FiPlus className="mr-2" />
                        Tambah User
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setSelectedUser(null);
                      setShowPasswordField(false);
                    }}
                    className="flex items-center justify-center px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                    disabled={submitting}
                  >
                    <FiX className="mr-2" />
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* User Lists - Side by Side Layout */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Asisten Users List - Wider */}
            {asistenUsers.length > 0 && (
              <motion.div
                className="flex-1 bg-white p-4 md:p-6 rounded-xl shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
                    <span className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full mr-2"></span>
                    Asisten
                  </h2>
                  <span className="bg-blue-100 text-blue-800 text-xs md:text-sm font-medium px-2 md:px-3 py-1 rounded-full">
                    {asistenUsers.length} Asisten
                  </span>
                </div>

                <div className="divide-y divide-gray-200 overflow-y-auto" style={{ maxHeight: "400px" }}>
                  <AnimatePresence>
                    {asistenUsers.map((user) => (
                      <UserCard 
                        key={user.id} 
                        user={user} 
                        currentUserRole={currentUserRole}
                        onEdit={() => {
                          setSelectedUser(user);
                          setShowForm(true);
                        }}
                        onDelete={() => handleDeleteUser(user.id)}
                        onToggleStatus={() => toggleStatus(user)}
                        submitting={submitting}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Admin Users List - Narrower (only shows if admin exists and current user is admin) */}
            {currentUserRole === 'admin' && adminUsers.length > 0 && (
              <motion.div
                className="w-full lg:w-80 xl:w-96 bg-white p-4 md:p-6 rounded-xl shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
                    <span className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full mr-2"></span>
                    Admin
                  </h2>
                  <span className="bg-red-100 text-red-800 text-xs md:text-sm font-medium px-2 md:px-3 py-1 rounded-full">
                    {adminUsers.length} Admin
                  </span>
                </div>

                <div className="divide-y divide-gray-200 overflow-y-auto" style={{ maxHeight: "400px" }}>
                  <AnimatePresence>
                    {adminUsers.map((user) => (
                      <UserCard 
                        key={user.id} 
                        user={user} 
                        currentUserRole={currentUserRole}
                        onEdit={() => {
                          setSelectedUser(user);
                          setShowForm(true);
                        }}
                        onDelete={() => handleDeleteUser(user.id)}
                        onToggleStatus={() => toggleStatus(user)}
                        submitting={submitting}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>
    </Layout>
  );
}