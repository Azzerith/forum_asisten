import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarMenu from "../components/Sidebar";
import { FiCheckCircle, FiPaperclip } from "react-icons/fi";
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
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    
    // Pastikan struktur data sesuai dengan respons API
    const jadwalHari = jadwalItem.jadwal?.hari || jadwalItem.hari;
    const jamMulai = jadwalItem.jadwal?.jam_mulai || jadwalItem.jam_mulai;
    const jamSelesai = jadwalItem.jadwal?.jam_selesai || jadwalItem.jam_selesai;
    
    // Konversi jam ke menit untuk perbandingan
    const [mulaiHour, mulaiMinute] = jamMulai.split(':').map(Number);
    const [selesaiHour, selesaiMinute] = jamSelesai.split(':').map(Number);
    
    const totalCurrent = currentHour * 60 + currentMinute;
    const totalMulai = mulaiHour * 60 + mulaiMinute;
    const totalSelesai = selesaiHour * 60 + selesaiMinute;
    
    return (
      jadwalHari.toLowerCase() === hari.toLowerCase() &&
      totalCurrent >= totalMulai - 30 && // 30 menit sebelum jadwal
      totalCurrent <= totalSelesai + 30   // 30 menit setelah jadwal
    );
  };

  const handleSubmit = async () => {
    try {
      // Implementasi submit presensi
      console.log("Submitting presensi...");
      // ... logika submit
    } catch (error) {
      console.error("Gagal submit presensi:", error);
      setError(error.response?.data?.error || error.message || "Gagal submit presensi");
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
    
        const allJadwal = Array.isArray(res.data) ? res.data : [res.data];
        console.log("All jadwal:", allJadwal);
    
        const userJadwal = allJadwal.filter((item) => 
          item.asisten_id === Number(user.user_id) || 
          item.asisten?.id === Number(user.user_id)
        );
        
        const currentJadwal = userJadwal.find((item) => isTodaySchedule(item));
    
        console.log("Filtered jadwal for today:", currentJadwal);
        if (currentJadwal) {
          setJadwal(currentJadwal);
          setJadwalDipilih(true); // Otomatis pilih jadwal jika ditemukan
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

  // UI jika tidak ada jadwal hari ini
  if (!jadwal) {
    return (
      <div className="flex min-h-screen min-w-screen bg-gray-50">
        <SidebarMenu />
        <main className="flex-1 flex items-center justify-center p-6">
          <motion.div
            className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Tidak Ada Jadwal Hari Ini
            </h2>
            <p className="text-gray-600 mb-4">
              Kamu tidak memiliki jadwal mengajar pada hari dan jam ini. Silakan
              cek kembali nanti atau hubungi koordinator jika ada kesalahan.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all"
            >
              Muat Ulang
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  // UI jika jadwal ditemukan
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

        {/* Jadwal */}
        <motion.div
          onClick={() => setJadwalDipilih(true)}
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
          Jadwal: {jadwal.jadwal?.hari }, {jadwal.jadwal?.jam_mulai} - {jadwal.jadwal?.jam_selesai} , 
              {jadwal.jadwal?.lab}
            </p>
        </motion.div>

        {/* Form Presensi */}
        {jadwalDipilih && jadwal &&(
          <motion.div
            className="bg-white p-6 rounded-xl shadow mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
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
      <div className="mb-4">
        <label className="block font-medium mb-2 text-gray-700">Upload Bukti Kehadiran (Foto tanggal di komputer dosen)</label>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all">
          <FiPaperclip className="mr-2" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFileKehadiran(e.target.files[0])}
              className="hidden"
            />
          </label>
          {fileKehadiran && (
            <img
              src={URL.createObjectURL(fileKehadiran)}
              alt="Preview Kehadiran"
              className="w-20 h-20 object-cover rounded border"
            />
          )}
        </div>
      </div>
    </div>

    <div className="mb-4">
      <label className="block font-medium mb-2 text-gray-700">Isi Materi</label>
      <textarea
        value={isiMateri}
        onChange={(e) => setIsiMateri(e.target.value)}
        className="text-black w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        rows="4"
      ></textarea>
    </div>
  </>
)}

{status === "izin" && (
  <div className="mb-4">
    <div className="mb-4">
  <label className="block font-medium mb-2 text-gray-700">Upload Bukti Izin</label>
  <div className="flex items-center gap-4">
    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-all">
      📤 Pilih Gambar
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFileIzin(e.target.files[0])}
        className="hidden"
      />
    </label>
    {fileIzin && (
      <img
        src={URL.createObjectURL(fileIzin)}
        alt="Preview Izin"
        className="w-20 h-20 object-cover rounded border"
      />
    )}
  </div>
</div>

  </div>
)}


            <motion.button
              onClick={handleSubmit}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium text-lg ${
                status === "izin"
                  ? "bg-gradient-to-r from-red-600 to-red-700"
                  : "bg-gradient-to-r from-blue-600 to-blue-700"
              } shadow-md`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {status === "izin" ? "Ajukan Izin" : "Submit Presensi"}
            </motion.button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
