import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import SidebarMenu from "../components/Sidebar";
import { FiPaperclip } from "react-icons/fi";


const PresensiPage = () => {
  const [user, setUser] = useState(null);
  const [jadwal, setJadwal] = useState(null);
  const [jadwalDipilih, setJadwalDipilih] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("hadir");
  const [isiMateri, setIsiMateri] = useState("");
  const [buktiKehadiran, setBuktiKehadiran] = useState("");
  const [buktiIzin, setBuktiIzin] = useState("");
  const [fileKehadiran, setFileKehadiran] = useState(null);
const [fileIzin, setFileIzin] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload);
        fetchPresensiData(payload.id, token);
      } catch (err) {
        console.error("Token tidak valid", err);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPresensiData = async (userId, token) => {
    try {
      const res = await axios.get("http://localhost:8080/api/asisten-kelas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let jadwalAsisten = Array.isArray(res.data) ? res.data[0] : res.data;

      console.log("API Response:", res.data);

      setJadwal(jadwalAsisten);
    } catch (err) {
      console.error("Gagal mengambil data jadwal", err);
    } finally {
      setLoading(false);
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "forum_asisten");
    formData.append("cloud_name", "azzerith");
  
    try {
      const res = await axios.post("https://api.cloudinary.com/v1_1/azzerith/image/upload", formData);
      return res.data.secure_url;
    } catch (err) {
      console.error("Upload Gagal", err);
      return null;
    }
  };
  

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const payload = {
      jadwal_id: jadwal.jadwal_id,
      jenis: "utama",
      status: status,
    };
  
    try {
      if (status === "hadir") {
        const uploadedURL = await uploadToCloudinary(fileKehadiran);
        if (!uploadedURL) return alert("Upload bukti kehadiran gagal.");
        payload.bukti_kehadiran = uploadedURL;
        payload.isi_materi = isiMateri;
      } else if (status === "izin") {
        const uploadedURL = await uploadToCloudinary(fileIzin);
        if (!uploadedURL) return alert("Upload bukti izin gagal.");
        payload.bukti_izin = uploadedURL;
      }
  
      await axios.post("http://localhost:8080/api/presensi", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      alert("Presensi berhasil dikirim");
    } catch (err) {
      console.error("Gagal mengirim presensi", err);
    }
  };
  

  if (loading) return <p>Loading...</p>;
  if (!jadwal || !jadwal.jadwal || !jadwal.jadwal.mata_kuliah)
    return <p>Tidak ada jadwal saat ini</p>;

  const jadwalInfo = jadwal?.jadwal;

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
              {jadwalInfo.mata_kuliah.nama} - {jadwalInfo.kelas}
            </h2>
          </div>
          <p className="text-sm opacity-90 mb-1">Dosen: {jadwalInfo.dosen.nama}</p>
          <p className="text-sm opacity-90">
            Jadwal: {jadwalInfo.hari}, {jadwalInfo.jam_mulai} - {jadwalInfo.jam_selesai} ({jadwalInfo.lab})
          </p>
        </motion.div>

        {/* Form Presensi */}
        {jadwalDipilih && (
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
};

export default PresensiPage;
