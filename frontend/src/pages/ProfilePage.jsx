import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiBook, FiEdit, FiArrowLeft, FiCheck, FiX, FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
// import SidebarMenu from "../components/Sidebar";

export default function ProfilePage() {
  const [user, setUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [presensiData, setPresensiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload);
        fetchPresensiData(payload.id);
      } catch (err) {
        console.error("Token tidak valid", err);
      }
    }
  }, []);

  const fetchPresensiData = async (asistenId) => {
    try {
      const response = await fetch("http://localhost:8080/api/presensi");
      const data = await response.json();
      // Filter data berdasarkan asisten_id yang login
      const filteredData = data.filter(item => item.asisten_id === asistenId);
      setPresensiData(filteredData);
      setLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data presensi:", error);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  // Hitung statistik presensi
  const countPresensi = () => {
    const stats = {
      hadir: 0,
      izin: 0,
      alpha: 0,
      pengganti: 0
    };

    presensiData.forEach(item => {
      if (item.jenis === "pengganti") {
        stats.pengganti++;
      }
      if (item.status === "hadir") stats.hadir++;
      if (item.status === "izin") stats.izin++;
      if (item.status === "alpha") stats.alpha++;
    });

    return stats;
  };

  const presensiStats = countPresensi();

  return (
    <div className="min-h-screen min-w-screen bg-gray-50 p-6">
      {/* <SidebarMenu /> */}
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
          <div></div> {/* Spacer untuk alignment */}
          <motion.button
            onClick={handleEdit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            <FiEdit className="w-5 h-5" />
            {isEditing ? "Simpan Perubahan" : "Edit Profil"}
          </motion.button>
        </div>

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
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center text-blue-900 text-4xl font-bold">
                  {user.nama?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
              <h2 className="text-center mt-4 text-xl font-semibold text-gray-800">
                {user.nama || "Nama Pengguna"}
              </h2>
              <p className="text-center text-gray-500">{user.nim || "NIM"}</p>
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
                      defaultValue={user.nama || ""}
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
                      defaultValue={user.email || ""}
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
                      defaultValue={user.nim || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="font-medium text-gray-800">
                      {user.nim || "-"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Presensi Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">
            Statistik Presensi
          </h3>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Hadir</p>
                    <p className="text-2xl font-bold text-green-700">{presensiStats.hadir}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <FiCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">Izin</p>
                    <p className="text-2xl font-bold text-yellow-700">{presensiStats.izin}</p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                    <FiClock className="w-5 h-5" />
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Alpha</p>
                    <p className="text-2xl font-bold text-red-700">{presensiStats.alpha}</p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-full text-red-600">
                    <FiX className="w-5 h-5" />
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Pengganti</p>
                    <p className="text-2xl font-bold text-blue-700">{presensiStats.pengganti}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                    <FiUser className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Informasi Tambahan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-900">Role</p>
              <p className="font-medium text-gray-900">Asisten Dosen</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-900">Bergabung Sejak</p>
              <p className="font-medium text-gray-900">Januari 2023</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}