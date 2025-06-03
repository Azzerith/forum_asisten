import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import SidebarMenu from "../components/Sidebar";

const PresensiPage = () => {
  const [user, setUser] = useState(null);
  const [jadwal, setJadwal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("hadir");
  const [isiMateri, setIsiMateri] = useState("");
  const [buktiKehadiran, setBuktiKehadiran] = useState("");
  const [buktiIzin, setBuktiIzin] = useState("");

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

        // ==== FAKE LOGIC UNTUK TESTING ====
        // Paksa data jadwal agar seolah-olah sedang aktif
        let jadwalAsisten = Array.isArray(res.data) ? res.data[0] : res.data;

        if (jadwalAsisten && jadwalAsisten.jadwal) {
          jadwalAsisten = {
            ...jadwalAsisten,
            jadwal: {
              ...jadwalAsisten.jadwal,
              hari: "Rabu",
              jam_mulai: "08:50",
              jam_selesai: "10:40",
            },
          };
        }

        console.log("API Response:", res.data);

        // ==== AKHIR FAKE LOGIC ====

        //production
        //const jadwalAsisten = res.data;
        setJadwal(jadwalAsisten);
        } catch (err) {
        console.error("Gagal mengambil data jadwal", err);
        } finally {
        setLoading(false);
        }
    };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const payload = {
      jadwal_id: jadwal.jadwal_id,
      jenis: "utama",
      status: status,
    };

    if (status === "hadir") {
      payload.bukti_kehadiran = buktiKehadiran;
      payload.isi_materi = isiMateri;
    } else if (status === "izin") {
      payload.bukti_izin = buktiIzin;
    }

    try {
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
if (!jadwal || !jadwal.jadwal || !jadwal.jadwal.mata_kuliah) return <p>Tidak ada jadwal saat ini</p>;


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

        <motion.div
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 mb-6 shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="flex items-center gap-4 mb-2">
            <span className="text-3xl">⏰</span>
            <h2 className="text-xl font-semibold">{jadwalInfo.mata_kuliah.nama} - {jadwalInfo.kelas}</h2>
          </div>
          <p className="text-sm opacity-90 mb-1">Dosen: {jadwalInfo.dosen.nama}</p>
          <p className="text-sm opacity-90">
            Jadwal: {jadwalInfo.hari}, {jadwalInfo.jam_mulai} - {jadwalInfo.jam_selesai} ({jadwalInfo.lab})
          </p>
        </motion.div>

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
              className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="hadir">Hadir</option>
              <option value="izin">Izin</option>
            </select>
          </div>

          {status === "hadir" && (
            <>
              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-700">Bukti Kehadiran (URL Gambar)</label>
                <input
                  type="text"
                  value={buktiKehadiran}
                  onChange={(e) => setBuktiKehadiran(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-2 text-gray-700">Isi Materi</label>
                <textarea
                  value={isiMateri}
                  onChange={(e) => setIsiMateri(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  rows="4"
                ></textarea>
              </div>
            </>
          )}

          {status === "izin" && (
            <div className="mb-4">
              <label className="block font-medium mb-2 text-gray-700">Bukti Izin (URL Gambar)</label>
              <input
                type="text"
                value={buktiIzin}
                onChange={(e) => setBuktiIzin(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          )}

          <motion.button
            onClick={handleSubmit}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium text-lg ${
              status === "izin" ? "bg-gradient-to-r from-red-600 to-red-700" : "bg-gradient-to-r from-blue-600 to-blue-700"
            } shadow-md`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {status === "izin" ? "Ajukan Izin" : "Submit Presensi"}
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
};

export default PresensiPage;