import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiBook, FiEdit, FiArrowLeft, FiCheck, FiX, FiPhone, FiCamera } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProfilePage() {
  const [user, setUser] = useState({
    id: "",
    nama: "",
    email: "",
    nim: "",
    telepon: "",
    photo: null,
    role: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({
    nama: "",
    email: "",
    nim: "",
    telepon: "",
    photo: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [success, setSuccess] = useState({ show: false, message: '' });
const [error, setError] = useState({ show: false, message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Anda harus login terlebih dahulu");
        setLoading(false);
        return;
      }

      try {
        // Get user ID from token
        const payload = JSON.parse(atob(token.split(".")[1]));
        
        // Fetch complete user data from API
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BASEURL}/api/users/${payload.user_id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          const userData = response.data.data;
          setUser({
            id: userData.id,
            nama: userData.nama || "",
            email: userData.email || "",
            nim: userData.nim || "",
            telepon: userData.telepon || "",
            photo: userData.photo || null,
            role: userData.role || "asisten"
          });
          setEditData({
            nama: userData.nama || "",
            email: userData.email || "",
            nim: userData.nim || "",
            telepon: userData.telepon || "",
            photo: userData.photo || null
          });
          if (userData.photo) {
            setPhotoPreview(userData.photo);
          }
        } else {
          setError("Gagal memuat data pengguna");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.response?.data?.message || "Terjadi kesalahan saat memuat profil");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadToCloudinary = async (file) => {
    if (!file) {
      throw new Error('No file provided');
    }
  
    if (!file.type.match('image.*')) {
      throw new Error('Hanya file gambar yang diperbolehkan');
    }
  
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Ukuran file terlalu besar (maksimal 10MB)');
    }
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'forum_asisten');
    formData.append('api_key', '455624144262999');
  
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/azzerith/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );
  
      if (!response.data.secure_url) {
        throw new Error('No URL returned from Cloudinary');
      }
  
      return response.data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    } finally {
      setUploadProgress(0);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
  
      // Store the file object in editData
      setEditData(prev => ({ ...prev, photo: file }));
    } catch (error) {
      setError({ show: true, message: error.message });
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError({ show: true, message: "Anda harus login terlebih dahulu" });
      return;
    }
  
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('nama', editData.nama);
      formData.append('email', editData.email);
      formData.append('nim', editData.nim || '');
      formData.append('telepon', editData.telepon || '');
  
      // If photo is a file (new upload), add it to formData
      if (editData.photo instanceof File) {
        formData.append('photo', editData.photo);
      } else if (typeof editData.photo === 'string') {
        formData.append('photo_url', editData.photo);
      }
  
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_BASEURL}/api/users/${user.id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      if (response.data.message === "User berhasil diperbarui") {
        // Update local state
        setUser(prev => ({
          ...prev,
          ...editData
        }));
        
        setPhotoPreview(editData.photo);
        setIsEditing(false);
        
        setSuccess({ show: true, message: response.data.message });
        setError({ show: false, message: '' });
        
        setTimeout(() => setSuccess(prev => ({ ...prev, show: false })), 3000);
      }
    } catch (error) {
      console.error('Update error:', error);
      setError({ 
        show: true,
        message: error.response?.data?.error || "Gagal memperbarui profil"
      });
      setSuccess({ show: false, message: '' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
  //         <strong className="font-bold">Error!</strong>
  //         <span className="block sm:inline"> {error.message}</span>
  //         <button 
  //           onClick={() => navigate('/login')}
  //           className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
  //         >
  //           Kembali ke Login
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  {error.show && (
    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <strong className="font-bold">Error!</strong>
      <span className="block sm:inline"> {error.message}</span>
    </div>
  )}
  
  {success.show && (
    <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
      <strong className="font-bold">Sukses!</strong>
      <span className="block sm:inline"> {success.message}</span>
    </div>
  )}

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header dengan tombol back */}
        <div className="flex items-center mb-6">
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mr-4 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-700" />
          </motion.button>
          <h1 className="text-3xl font-bold text-blue-900">Profil Pengguna</h1>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div></div>
          {isEditing ? (
            <div className="flex gap-2">
              <motion.button
                onClick={() => setIsEditing(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition-colors"
              >
                <FiX className="w-5 h-5" />
                Batal
              </motion.button>
              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                <FiCheck className="w-5 h-5" />
                {loading ? 'Menyimpan...' : 'Simpan'}
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={() => setIsEditing(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              <FiEdit className="w-5 h-5" />
              Edit Profil
            </motion.button>
          )}
        </div>
{/* 
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )} */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md overflow-hidden col-span-1"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-24"></div>
            <div className="px-6 pb-6 -mt-12">
              <div className="flex justify-center relative">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-blue-900 text-4xl font-bold">
                      {user.nama?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100">
                    <FiCamera className="w-5 h-5 text-blue-600" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              <h2 className="text-center mt-4 text-xl font-semibold text-gray-800">
                {user.nama || "Nama Pengguna"}
              </h2>
              <p className="text-center text-gray-500">{user.nim || "NIM"}</p>
              <p className="text-center text-sm text-gray-500 mt-1 capitalize">
                {user.role || "asisten"}
              </p>
            </div>
          </motion.div>

          {/* Profile Details */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6 col-span-1 md:col-span-2"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">
              Informasi Profil
            </h3>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FiUser className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Nama Lengkap</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="nama"
                      value={editData.nama}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">
                      {user.nama || "-"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FiMail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">
                      {user.email || "-"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FiBook className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">NIM</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="nim"
                      value={editData.nim}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">
                      {user.nim || "-"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FiPhone className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Nomor Telepon</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="telepon"
                      value={editData.telepon}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Masukkan nomor telepon"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">
                      {user.telepon || "-"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}