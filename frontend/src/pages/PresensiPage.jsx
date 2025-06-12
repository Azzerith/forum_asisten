import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarMenu from "../components/Sidebar";
import { FiCheckCircle, FiPaperclip, FiPlus, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PresensiPage() {
  const [jadwal, setJadwal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [status, setStatus] = useState("hadir");
  const [fileKehadiran, setFileKehadiran] = useState(null);
  const [fileIzin, setFileIzin] = useState(null);
  const [isiMateri, setIsiMateri] = useState("");
  const [jadwalDipilih, setJadwalDipilih] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPresensiLain, setShowPresensiLain] = useState(false);
  const [allJadwal, setAllJadwal] = useState([]);
  const [selectedJadwalLain, setSelectedJadwalLain] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [jenisPresensi, setJenisPresensi] = useState("utama");

  // Ambil user dari token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Token payload:", payload);
        setUser({ user_id: payload.user_id, ...payload });
      } catch (err) {
        console.error("Token parsing error:", err);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Fungsi bantu: cek apakah jadwal hari ini
  const isTodaySchedule = (jadwalItem) => {
    const today = new Date();
    const hari = today.toLocaleDateString("id-ID", { weekday: "long" });
    
    const jadwalHari = jadwalItem.jadwal?.hari || jadwalItem.hari;
    const jamMulai = jadwalItem.jadwal?.jam_mulai || jadwalItem.jam_mulai;
    const jamSelesai = jadwalItem.jadwal?.jam_selesai || jadwalItem.jam_selesai;
    
    const [mulaiHour, mulaiMinute] = jamMulai.split(':').map(Number);
    const [selesaiHour, selesaiMinute] = jamSelesai.split(':').map(Number);
    
    const totalMulai = mulaiHour * 60 + mulaiMinute;
    const totalSelesai = selesaiHour * 60 + selesaiMinute;
    const totalCurrent = today.getHours() * 60 + today.getMinutes();
    
    if (jadwalHari.toLowerCase() !== hari.toLowerCase()) {
      return false;
    }
    
    return (totalCurrent >= (totalMulai - 30)) && 
           (totalCurrent <= (totalSelesai + 30));
  };

  const uploadToCloudinary = async (file) => {
    if (!file) {
      throw new Error('No file provided');
    }
  
    if (!file.type.match('image.*')) {
      throw new Error('Hanya file gambar yang diperbolehkan');
    }
  
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Ukuran file terlalu besar (maksimal 5MB)');
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
            console.log(`Upload progress: ${progress}%`);
          },
        }
      );
  
      if (!response.data.secure_url) {
        throw new Error('No URL returned from Cloudinary');
      }
  
      return response.data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(
        error.response?.data?.error?.message || 
        error.message || 
        'Gagal mengupload gambar'
      );
    }
  };

  const handleSubmit = async (isPresensiLain = false) => {
    const jadwalToUse = isPresensiLain ? selectedJadwalLain : jadwal;
    
    if (!jadwalToUse) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (status === "hadir" && !fileKehadiran) {
        throw new Error("Bukti kehadiran diperlukan");
      }
      if (status === "izin" && !fileIzin) {
        throw new Error("Bukti izin diperlukan");
      }
  
      let buktiKehadiranUrl = null;
      let buktiIzinUrl = null;
  
      if (status === "hadir") {
        buktiKehadiranUrl = await uploadToCloudinary(fileKehadiran);
      } else if (status === "izin") {
        buktiIzinUrl = await uploadToCloudinary(fileIzin);
      }
  
      const presensiData = {
        jadwal_id: jadwalToUse.jadwal?.id || jadwalToUse.id,
        jenis: jenisPresensi,
        status: status,
        ...(status === "hadir" && {
          bukti_kehadiran: buktiKehadiranUrl,
          isi_materi: isiMateri
        }),
        ...(status === "izin" && {
          bukti_izin: buktiIzinUrl
        })
      };
  
      const response = await axios.post(
        "http://localhost:8080/api/presensi",
        presensiData,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      console.log("Presensi berhasil:", response.data);
      alert("Presensi berhasil dikirim!");
      setShowForm(false);
      setShowPresensiLain(false);
      setFileKehadiran(null);
      setFileIzin(null);
      setIsiMateri("");
      setSelectedJadwalLain(null);
    } catch (error) {
      console.error("Gagal submit presensi:", error);
      setError(
        error.response?.data?.error || 
        error.message || 
        "Gagal submit presensi"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ambil data presensi/jadwal asisten
  useEffect(() => {
    if (!user?.user_id) return;

    const fetchPresensiData = async () => {
      try {
        setLoading(true);
        setError(null);
    
        const res = await axios.get("http://localhost:8080/api/asisten-kelas", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
    
        const allJadwalData = Array.isArray(res.data) ? res.data : [res.data];
        setAllJadwal(allJadwalData);
        console.log("All jadwal:", allJadwalData);
    
        const userJadwal = allJadwalData.filter((item) => 
          item.asisten_id === Number(user.user_id) || 
          item.asisten?.id === Number(user.user_id)
        );
        
        const today = new Date();
        const currentTimeInMinutes = today.getHours() * 60 + today.getMinutes();
        
        const todayJadwal = userJadwal
          .filter((item) => isTodaySchedule(item))
          .sort((a, b) => {
            const jamMulaiA = a.jadwal?.jam_mulai || a.jam_mulai;
            const jamMulaiB = b.jadwal?.jam_mulai || b.jam_mulai;
            return jamMulaiA.localeCompare(jamMulaiB);
          });
        
        let currentJadwal = null;
        for (const jadwal of todayJadwal) {
          const jamMulai = jadwal.jadwal?.jam_mulai || jadwal.jam_mulai;
          const jamSelesai = jadwal.jadwal?.jam_selesai || jadwal.jam_selesai;
          
          const [mulaiHour, mulaiMinute] = jamMulai.split(':').map(Number);
          const [selesaiHour, selesaiMinute] = jamSelesai.split(':').map(Number);
          
          const totalMulai = mulaiHour * 60 + mulaiMinute;
          const totalSelesai = selesaiHour * 60 + selesaiMinute;
          
          if (currentTimeInMinutes >= (totalMulai - 30) && 
              currentTimeInMinutes <= (totalSelesai + 30)) {
            currentJadwal = jadwal;
            if (currentTimeInMinutes >= totalMulai && 
                currentTimeInMinutes <= totalSelesai) {
              break;
            }
          }
        }
        
        console.log("Current jadwal:", currentJadwal);
        if (currentJadwal) {
          setJadwal(currentJadwal);
          setJadwalDipilih(true);
        } else {
          setJadwal(null);
          setJadwalDipilih(false);
        }
      } catch (err) {
        console.error("Gagal mengambil data jadwal", err);
        setError(err.response?.data?.error || err.message || "Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    };

    fetchPresensiData();
  }, [user?.user_id]);

  const filteredJadwal = allJadwal.filter(jadwal => {
    const searchLower = searchTerm.toLowerCase();
    const mataKuliah = jadwal.jadwal?.mata_kuliah?.nama || jadwal.mata_kuliah?.nama || "";
    const kelas = jadwal.jadwal?.kelas || jadwal.kelas || "";
    const dosen = jadwal.jadwal?.dosen?.nama || jadwal.dosen?.nama || "";
    
    return (
      mataKuliah.toLowerCase().includes(searchLower) ||
      kelas.toLowerCase().includes(searchLower) ||
      dosen.toLowerCase().includes(searchLower)
    );
  });

  // UI saat loading
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarMenu />
        <main className="flex-1 p-6 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data presensi...</p>
          </div>
        </main>
      </div>
    );
  }

  // UI saat error
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarMenu />
        <main className="flex-1 p-6 flex justify-center items-center">
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
        <motion.h1
          className="text-3xl font-bold text-blue-900 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Presensi Asisten
        </motion.h1>

        {/* Tombol Presensi Lain */}
        <motion.button
          onClick={() => {
            setShowPresensiLain(!showPresensiLain);
            setShowForm(false);
          }}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus />
          Presensi Lain
        </motion.button>

        {/* Form Presensi Lain */}
        {showPresensiLain && (
          <motion.div
            className="bg-white p-6 rounded-xl shadow mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Presensi Lain</h2>
            
            <div className="mb-4">
              <label className="block font-medium mb-2 text-gray-700">Cari Jadwal</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari berdasarkan mata kuliah, kelas, atau dosen..."
                  className="text-black w-full border border-gray-300 px-4 py-2 rounded-lg pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {searchTerm && (
              <div className="text-gray-600 mb-4 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredJadwal.length > 0 ? (
                  filteredJadwal.map((item) => (
                    <div
                      key={item.jadwal?.id || item.id}
                      onClick={() => {
                        setSelectedJadwalLain(item);
                        setSearchTerm("");
                      }}
                      className={`p-3 hover:bg-blue-50 cursor-pointer ${
                        selectedJadwalLain?.jadwal?.id === item.jadwal?.id ? 'bg-blue-100' : ''
                      }`}
                    >
                      <div className="font-medium">
                        {item.jadwal?.mata_kuliah?.nama} - {item.jadwal?.kelas}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.jadwal?.hari}, {item.jadwal?.jam_mulai} - {item.jadwal?.jam_selesai}
                      </div>
                      <div className="text-sm text-gray-500">
                        Dosen: {item.jadwal?.dosen?.nama}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-gray-500">Tidak ditemukan jadwal</div>
                )}
              </div>
            )}

            {selectedJadwalLain && (
              <div className="text-white mb-4 bg-blue-600 p-4 rounded-lg">
                <h3 className="font-medium mb-1">
                  {selectedJadwalLain.jadwal?.mata_kuliah?.nama} - {selectedJadwalLain.jadwal?.kelas}
                </h3>
                <p className="text-sm text-white mb-1">
                  {selectedJadwalLain.jadwal?.hari}, {selectedJadwalLain.jadwal?.jam_mulai} - {selectedJadwalLain.jadwal?.jam_selesai}
                </p>
                <p className="text-sm text-white">
                  Dosen: {selectedJadwalLain.jadwal?.dosen?.nama}
                </p>
                <motion.button
                  onClick={() => setSelectedJadwalLain(null)}
                  className="cursor-pointer inline-flex items-center px-4 py-2 mt-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all"
                >
                  Batalkan pilihan
                </motion.button>
              </div>
            )}

            <div className="mb-4">
              <label className="block font-medium mb-2 text-gray-700">Jenis Presensi</label>
              <select
                value={jenisPresensi}
                onChange={(e) => setJenisPresensi(e.target.value)}
                className="text-black w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="utama">Utama</option>
                <option value="pengganti">Pengganti</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-medium mb-2 text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="text-black w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="hadir">Hadir</option>
                <option value="izin">Izin</option>
              </select>
            </div>

            {status === "hadir" && (
              <>
                <div className="mb-4">
                  <label className="block font-medium mb-2 text-gray-700">
                    Upload Bukti Kehadiran (Foto tanggal di komputer dosen)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all">
                      <FiPaperclip className="mr-2" />
                      Pilih File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFileKehadiran(e.target.files[0])}
                        className="hidden"
                        required
                      />
                    </label>
                    {fileKehadiran && (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(fileKehadiran)}
                          alt="Preview Kehadiran"
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          onClick={() => setFileKehadiran(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2 text-gray-700">Isi Materi</label>
                  <textarea
                    value={isiMateri}
                    onChange={(e) => setIsiMateri(e.target.value)}
                    className="text-black w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    rows="4"
                    placeholder="Masukkan materi yang diajarkan..."
                    required
                  ></textarea>
                </div>
              </>
            )}

            {status === "izin" && (
              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-700">Upload Bukti Izin</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all">
                    <FiPaperclip className="mr-2" />
                    Pilih File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFileIzin(e.target.files[0])}
                      className="hidden"
                      required
                    />
                  </label>
                  {fileIzin && (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(fileIzin)}
                        alt="Preview Izin"
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        onClick={() => setFileIzin(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <motion.button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || !selectedJadwalLain}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium text-lg ${
                status === "izin"
                  ? "bg-gradient-to-r from-red-600 to-red-700"
                  : "bg-gradient-to-r from-green-600 to-green-700"
              } shadow-md disabled:opacity-70`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : status === "izin" ? (
                "Ajukan Izin"
              ) : (
                "Submit Presensi Lain"
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Jadwal Hari Ini */}
        {jadwal ? (
          <motion.div
            onClick={() => setShowForm(!showForm)}
            className="cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 mb-6 shadow-lg hover:scale-[1.01] transition-transform"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="flex items-center gap-4 mb-2">
              <span className="text-3xl">⏰</span>
              <h2 className="text-xl font-semibold">
                {jadwal.jadwal?.mata_kuliah?.nama} - {jadwal.jadwal?.kelas}
              </h2>
            </div>
            <p className="text-sm opacity-90 mb-1">
              Dosen: {jadwal.jadwal?.dosen?.nama}
            </p>
            <p className="text-sm opacity-90">
              Jadwal: {jadwal.jadwal?.hari}, {jadwal.jadwal?.jam_mulai} - {jadwal.jadwal?.jam_selesai}, 
              {jadwal.jadwal?.lab}
            </p>
            <div className="mt-3 text-sm">
              {showForm ? "▲ Tutup form presensi" : "▼ Klik untuk presensi"}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Tidak Ada Jadwal Hari Ini
            </h2>
            <p className="text-gray-600 mb-4">
              Kamu tidak memiliki jadwal mengajar pada hari dan jam ini. 
              Gunakan tombol "Presensi Lain" di atas jika ingin melakukan presensi di luar jadwal.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all"
            >
              Muat Ulang
            </button>
          </motion.div>
        )}

        {/* Form Presensi Reguler */}
        {showForm && (
          <motion.div
            className="bg-white p-6 rounded-xl shadow mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block font-medium mb-2 text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="text-black w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="hadir">Hadir</option>
                <option value="izin">Izin</option>
              </select>
            </div>

            {status === "hadir" && (
              <>
                <div className="mb-4">
                  <label className="block font-medium mb-2 text-gray-700">
                    Upload Bukti Kehadiran (Foto tanggal di komputer dosen)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all">
                      <FiPaperclip className="mr-2" />
                      Pilih File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFileKehadiran(e.target.files[0])}
                        className="hidden"
                        required
                      />
                    </label>
                    {fileKehadiran && (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(fileKehadiran)}
                          alt="Preview Kehadiran"
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          onClick={() => setFileKehadiran(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2 text-gray-700">Isi Materi</label>
                  <textarea
                    value={isiMateri}
                    onChange={(e) => setIsiMateri(e.target.value)}
                    className="text-black w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    rows="4"
                    placeholder="Masukkan materi yang diajarkan..."
                    required
                  ></textarea>
                </div>
              </>
            )}

            {status === "izin" && (
              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-700">Upload Bukti Izin</label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all">
                    <FiPaperclip className="mr-2" />
                    Pilih File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFileIzin(e.target.files[0])}
                      className="hidden"
                      required
                    />
                  </label>
                  {fileIzin && (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(fileIzin)}
                        alt="Preview Izin"
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        onClick={() => setFileIzin(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <motion.button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium text-lg ${
                status === "izin"
                  ? "bg-gradient-to-r from-red-600 to-red-700"
                  : "bg-gradient-to-r from-blue-600 to-blue-700"
              } shadow-md disabled:opacity-70`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : status === "izin" ? (
                "Ajukan Izin"
              ) : (
                "Submit Presensi"
              )}
            </motion.button>
          </motion.div>
        )}
      </main>
    </div>
  );
}