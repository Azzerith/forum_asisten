import React, { useState, useEffect } from 'react';
import SidebarMenu from '../components/Sidebar';
import { motion } from 'framer-motion';

const RekapitulasiPage = () => {
  const [presensiData, setPresensiData] = useState([]);
  const [rekapitulasiData, setRekapitulasiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token'); // Get JWT token from storage
    
        // Fetch attendance data with Authorization header
        const presensiResponse = await fetch('http://localhost:8080/api/presensi', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
    
        if (!presensiResponse.ok) {
          throw new Error('Failed to fetch presensi data');
        }
    
        const presensiResult = await presensiResponse.json();
        setPresensiData(presensiResult.data || []);
        console.log("Presensi result:", presensiResult);
    
        // Fetch honor data with Authorization header
        const rekapitulasiResponse = await fetch('http://localhost:8080/api/rekapitulasi', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
    
        if (!rekapitulasiResponse.ok) {
          throw new Error('Failed to fetch rekapitulasi data');
        }
    
        const rekapitulasiResult = await rekapitulasiResponse.json();
        setRekapitulasiData(rekapitulasiResult.data || []);
        console.log("Rekapitulasi result:", rekapitulasiResult);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group attendance data by mata kuliah
  const groupByMataKuliah = () => {
    console.log("presensiData:", presensiData);

    const grouped = {};
    
    // Add a check to ensure presensiData is an array
    if (!Array.isArray(presensiData)) {
      return [];
    }

    presensiData.forEach(item => {
      // Add null checks for nested properties
      if (item && item.jadwal && item.jadwal.mata_kuliah) {
        const matkulId = item.jadwal.mata_kuliah.id;
        if (!grouped[matkulId]) {
          grouped[matkulId] = {
            mataKuliah: item.jadwal.mata_kuliah,
            jadwal: item.jadwal,
            presensi: []
          };
        }
        grouped[matkulId].presensi.push(item);
      }
    });

    return Object.values(grouped);
  };

  const mataKuliahGroups = groupByMataKuliah();
  // console.log("Grouped Mata Kuliah:", mataKuliahGroups);

  const statusColors = {
    hadir: 'bg-green-100 text-green-800',
    izin: 'bg-yellow-100 text-yellow-800',
    alpha: 'bg-red-100 text-red-800'
  };

  const jenisColors = {
    utama: 'bg-blue-100 text-blue-800',
    pengganti: 'bg-purple-100 text-purple-800'
  };

  const tipeHonorColors = {
    A: 'bg-red-100 text-red-800',
    B: 'bg-orange-100 text-orange-800',
    C: 'bg-yellow-100 text-yellow-800',
    D: 'bg-green-100 text-green-800',
    E: 'bg-blue-100 text-blue-800'
  };

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
          Rekapitulasi Kehadiran
        </motion.h1>

        {/* Honor Summary Card */}
        <motion.div
          className="mb-8 bg-white p-6 rounded-xl shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Rekapitulasi Honor Asisten
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asisten</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hadir</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Izin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alpha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengganti</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe Honor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Honor/Pertemuan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Honor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rekapitulasiData.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{item.asisten.nama.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.asisten.nama}</div>
                          <div className="text-sm text-gray-500">{item.asisten.nim}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors.hadir}`}>
                        {item.jumlah_hadir}x
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors.izin}`}>
                        {item.jumlah_izin}x
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors.alpha}`}>
                        {item.jumlah_alpha}x
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${jenisColors.pengganti}`}>
                        {item.jumlah_pengganti}x
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tipeHonorColors[item.tipe_honor] || 'bg-gray-100 text-gray-800'}`}>
                        Tipe {item.tipe_honor}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rp {item.honor_pertemuan.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      Rp {item.total_honor.toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-sm font-medium text-gray-900">
                    Total Honor Keseluruhan
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">
                    Rp {rekapitulasiData.reduce((sum, item) => sum + item.total_honor, 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>

        {/* Attendance by Course Section */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            Rekapitulasi Per Mata Kuliah
          </h2>

          {mataKuliahGroups.map((group, index) => (
            <motion.div
              key={group.mataKuliah.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className={`mb-6 ${index > 0 ? 'pt-6 border-t border-gray-200' : ''}`}>
                <h3 className="text-lg font-medium text-gray-900">
                  {group.mataKuliah.nama} ({group.mataKuliah.kode})
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Kelas: {group.jadwal.kelas} | Lab: {group.jadwal.lab} | 
                  Hari: {group.jadwal.hari} | Jam: {group.jadwal.jam_mulai} - {group.jadwal.jam_selesai} | 
                  Dosen: {group.jadwal.dosen.nama}
                </p>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asisten</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materi</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bukti</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.presensi.map((item, idx) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.05 * idx }}
                          whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium">{item.asisten.nama.charAt(0)}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.asisten.nama}</div>
                                <div className="text-sm text-gray-500">{item.asisten.nim}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.waktu_input).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[item.status] || 'bg-gray-100 text-gray-800'}`}>
                              {item.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${jenisColors[item.jenis] || 'bg-gray-100 text-gray-800'}`}>
                              {item.jenis.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {item.isi_materi || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <motion.a
                              href={item.status === 'izin' ? item.bukti_izin : item.bukti_kehadiran}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Lihat
                            </motion.a>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default RekapitulasiPage;