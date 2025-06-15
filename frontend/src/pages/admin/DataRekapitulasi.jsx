import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Layout from "../../components/Layout";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEdit2, 
  FiPlus, 
  FiX, 
  FiChevronDown, 
  FiChevronUp,
  FiSearch
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DataRekapitulasi = () => {
  // State management
  const [presensiData, setPresensiData] = useState([]);
  const [rekapitulasiData, setRekapitulasiData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('none'); // 'none', 'all', 'matkul', or 'tipe'
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedGroups, setExpandedGroups] = useState({});
  
  // Modal states
  const [editModal, setEditModal] = useState(false);
  const [honorModal, setHonorModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  
  // Form states
  const [honorForm, setHonorForm] = useState({
    asisten_id: '',
    tipe_honor: 'A'
  });
  
  const [formData, setFormData] = useState({
    tipe_honor: ''
  });

  // Color mappings
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

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch presensi data
        const presensiResponse = await axios.get('http://localhost:8080/api/admin/presensi', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Fetch rekapitulasi data
        const rekapResponse = await axios.get('http://localhost:8080/api/admin/rekapitulasi', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        setPresensiData(presensiResponse.data);
        setRekapitulasiData(rekapResponse.data?.data || []);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Gagal memuat data rekapitulasi');
        toast.error('Gagal memuat data rekapitulasi');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process data for display
  const processDisplayData = useMemo(() => {
    if (!presensiData.length || !rekapitulasiData.length) return [];

    // Create a map to store all attendance by assistant and subject
    const asistenMatkulMap = {};

    // Process all presensi data
    presensiData.forEach(presensi => {
      const asistenId = presensi.asisten_id;
      const matkulId = presensi.jadwal?.mata_kuliah?.id || 'other';
      const matkulName = presensi.jadwal?.mata_kuliah?.nama || 'Lainnya';
      const matkulKode = presensi.jadwal?.mata_kuliah?.kode || '-';

      const key = `${asistenId}-${matkulId}`;
      
      if (!asistenMatkulMap[key]) {
        asistenMatkulMap[key] = {
          asisten_id: asistenId,
          asisten: presensi.asisten,
          mata_kuliah: {
            id: matkulId,
            nama: matkulName,
            kode: matkulKode
          },
          counts: {
            hadir: 0,
            izin: 0,
            alpha: 0,
            pengganti: 0
          }
        };
      }
      
      // Count based on status and type
      if (presensi.jenis === 'utama') {
        asistenMatkulMap[key].counts[presensi.status]++;
      } else if (presensi.jenis === 'pengganti' && presensi.status === 'hadir') {
        asistenMatkulMap[key].counts.pengganti++;
      }
    });

    // Merge with rekapitulasi data
    return Object.values(asistenMatkulMap).map(item => {
      const existingRekap = rekapitulasiData.find(r => r.asisten_id === item.asisten_id);
      
      return {
        id: existingRekap?.id || null,
        asisten_id: item.asisten_id,
        asisten: item.asisten,
        mata_kuliah: item.mata_kuliah,
        tipe_honor: existingRekap?.tipe_honor || null,
        honor_pertemuan: existingRekap?.honor_pertemuan || 0,
        jumlah_hadir: item.counts.hadir,
        jumlah_izin: item.counts.izin,
        jumlah_alpha: item.counts.alpha,
        jumlah_pengganti: item.counts.pengganti,
        total_honor: existingRekap ? 
          existingRekap.honor_pertemuan * (item.counts.hadir + item.counts.pengganti) : 
          0
      };
    });
  }, [presensiData, rekapitulasiData]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...processDisplayData];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.asisten?.nama?.toLowerCase().includes(term) ||
        item.asisten?.nim?.toLowerCase().includes(term) ||
        (item.tipe_honor && `tipe ${item.tipe_honor}`.includes(term)) ||
        item.mata_kuliah?.nama?.toLowerCase().includes(term));
      
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortOrder === 'asc') {
        return (a.total_honor || 0) - (b.total_honor || 0);
      } else {
        return (b.total_honor || 0) - (a.total_honor || 0);
      }
    });
    
    setFilteredData(result);
  }, [processDisplayData, searchTerm, sortOrder]);

  // Group data by selected option
  const groupedData = useMemo(() => {
    const grouped = {};
    
    if (groupBy === 'tipe') {
      // Group purely by honor type from rekapitulasiData
      rekapitulasiData.forEach(item => {
        const tipeKey = item.tipe_honor || 'unset';
        const label = `Tipe ${item.tipe_honor || 'Belum di-set'}`;
        
        if (!grouped[tipeKey]) {
          grouped[tipeKey] = {
            key: tipeKey,
            label,
            tipe_honor: item.tipe_honor,
            items: [],
            totalHonor: 0,
            totalAsisten: 0,
            honorPerMeeting: item.honor_pertemuan,
            asistenList: []
          };
        }
        
        grouped[tipeKey].items.push(item);
        grouped[tipeKey].totalHonor += item.total_honor || 0;
        grouped[tipeKey].totalAsisten += 1;
        grouped[tipeKey].asistenList.push({
          id: item.asisten_id,
          nama: item.asisten.nama,
          nim: item.asisten.nim
        });
      });
    } else {
      // Original grouping logic for other cases
      filteredData.forEach(item => {
        let key, label;
        
        if (groupBy === 'matkul') {
          key = `matkul-${item.mata_kuliah.id}`;
          label = item.mata_kuliah.nama;
        } else if (groupBy === 'all') {
          key = `asisten-${item.asisten_id}`;
          label = `${item.asisten.nama} (${item.asisten.nim})`;
        } else if (groupBy === 'none') {
          // No grouping, handled separately
          return;
        }
        
        if (!grouped[key]) {
          grouped[key] = {
            key,
            label,
            mata_kuliah: groupBy === 'matkul' ? item.mata_kuliah : null,
            items: [],
            totalHonor: 0,
            totalAsisten: 0,
            aggregatedCounts: {
              hadir: 0,
              izin: 0,
              alpha: 0,
              pengganti: 0
            }
          };
        }
        
        grouped[key].items.push(item);
        grouped[key].totalHonor += item.total_honor || 0;
        
        if (groupBy === 'all') {
          grouped[key].totalAsisten = 1;
          grouped[key].aggregatedCounts.hadir += item.jumlah_hadir;
          grouped[key].aggregatedCounts.izin += item.jumlah_izin;
          grouped[key].aggregatedCounts.alpha += item.jumlah_alpha;
          grouped[key].aggregatedCounts.pengganti += item.jumlah_pengganti;
        } else {
          grouped[key].totalAsisten = grouped[key].items.length;
        }
      });
    }
    
    return grouped;
  }, [filteredData, rekapitulasiData, groupBy]);

  // Toggle group expansion
  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle honor type submission
  const submitHonor = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/admin/rekapitulasi',
        {
          asisten_id: parseInt(honorForm.asisten_id),
          tipe_honor: honorForm.tipe_honor
        },
        {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      toast.success('Tipe honor berhasil diset');
      setHonorModal(false);
      
      // Refresh data
      const rekapResponse = await axios.get('http://localhost:8080/api/admin/rekapitulasi', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setRekapitulasiData(rekapResponse.data?.data || []);
      
    } catch (err) {
      console.error('Error setting honor type:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        toast.error(err.response.data?.error || 'Gagal menyet tipe honor');
      } else {
        toast.error('Gagal menyet tipe honor');
      }
    }
  };

  // Handle rekapitulasi update (only honor type)
const submitUpdate = async () => {
  try {
    await axios.put(
      `http://localhost:8080/api/admin/rekapitulasi/${currentItem.asisten_id}`,
      {
        asisten_id: currentItem.asisten_id,
        tipe_honor: formData.tipe_honor,
        jumlah_hadir: currentItem.jumlah_hadir,
        jumlah_izin: currentItem.jumlah_izin,
        jumlah_alpha: currentItem.jumlah_alpha,
        jumlah_pengganti: currentItem.jumlah_pengganti
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    );

    toast.success('Tipe honor berhasil diperbarui');
    setEditModal(false);
    
    // Refresh data
    const rekapResponse = await axios.get('http://localhost:8080/api/admin/rekapitulasi', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    
    setRekapitulasiData(rekapResponse.data?.data || []);
    
  } catch (err) {
    console.error('Error updating data:', err);
    toast.error(err.response?.data?.message || 'Gagal memperbarui tipe honor');
  }
};

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle honor form changes
  const handleHonorFormChange = (e) => {
    const { name, value } = e.target;
    setHonorForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Open edit modal (only when not grouped)
  const handleEdit = (item) => {
    if (groupBy !== 'none') return;
    
    setCurrentItem(item);
    setFormData({
      tipe_honor: item.tipe_honor || 'A'
    });
    setEditModal(true);
  };

  if (loading) {
    return (
      <Layout>
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data rekapitulasi...</p>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="flex-1 p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        
        <motion.h1 
          className="text-3xl font-bold text-blue-900 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Data Rekapitulasi
        </motion.h1>

        {/* Filter and Search Section */}
        <motion.div
          className="text-black mb-8 bg-white p-6 rounded-xl shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari asisten, mata kuliah, atau tipe honor..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center space-x-2">
                <label htmlFor="groupBy" className="text-sm font-medium text-gray-700">Kelompokkan:</label>
                <select
                  id="groupBy"
                  className="border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                >
                  <option value="none">Semua</option>
                  <option value="all">Per Asisten</option>
                  <option value="matkul">Per Mata Kuliah</option>
                  <option value="tipe">Per Tipe Honor</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label htmlFor="sortOrder" className="text-sm font-medium text-gray-700">Urutkan:</label>
                <select
                  id="sortOrder"
                  className="border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">Honor Tertinggi</option>
                  <option value="asc">Honor Terendah</option>
                </select>
              </div>
              
              <button
                onClick={() => setHonorModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <FiPlus /> Set Honor
              </button>
            </div>
          </div>
        </motion.div>

        {/* Data Display */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow overflow-y-auto" style={{ maxHeight: "445px" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
          {groupBy === 'none' ? (
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rekapitulasiData.map((item, index) => (
                  <tr key={`${item.asisten_id}-${index}`} className="hover:bg-gray-50">
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.tipe_honor ? 
                        tipeHonorColors[item.tipe_honor] || 'bg-gray-100 text-gray-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.tipe_honor ? `Tipe ${item.tipe_honor}` : 'Belum di-set'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rp {item.honor_pertemuan.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      Rp {item.total_honor.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FiEdit2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ):groupBy === 'tipe' ? (
            Object.values(groupedData).map(group => (
              <div key={group.key} className="mb-6">
                <div 
                  onClick={() => toggleGroup(group.key)}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="font-medium text-lg">
                      <span className={`px-3 py-1 rounded-full ${
                        group.tipe_honor ? 
                        tipeHonorColors[group.tipe_honor] || 'bg-gray-100 text-gray-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {group.label}
                      </span>
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {group.totalAsisten} Asisten
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Total Honor: Rp {group.totalHonor.toLocaleString()}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      Honor/Pertemuan: Rp {group.honorPerMeeting?.toLocaleString() || '0'}
                    </span>
                  </div>
                  {expandedGroups[group.key] ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                
                {/* Group Content */}
                <AnimatePresence>
                  {expandedGroups[group.key] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 overflow-hidden"
                    >
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asisten</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hadir</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Izin</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alpha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengganti</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Honor</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {group.items.map((item, index) => (
                            <motion.tr
                              key={`${item.asisten_id}-${index}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50"
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
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                Rp {item.total_honor.toLocaleString()}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          ):(
            Object.values(groupedData).map(group => (
              <div key={group.key} className="mb-6">
                <div 
                  onClick={() => toggleGroup(group.key)}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="font-medium text-lg">
                      {group.label}
                      {group.mata_kuliah?.kode && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({group.mata_kuliah.kode})
                        </span>
                      )}
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {group.totalAsisten} {groupBy === 'all' ? 'Mata Kuliah' : 'Asisten'}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Total Honor: Rp {group.totalHonor.toLocaleString()}
                    </span>
                  </div>
                  {expandedGroups[group.key] ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                
                {/* Group Content */}
                <AnimatePresence>
                  {expandedGroups[group.key] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 overflow-hidden"
                    >
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {groupBy === 'all' && (
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Kuliah</th>
                            )}
                            {groupBy !== 'all' && (
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asisten</th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hadir</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Izin</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alpha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengganti</th>
                            {groupBy !== 'tipe' && (
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe Honor</th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Honor</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {group.items.map((item, index) => (
                            <motion.tr
                              key={`${item.asisten_id}-${item.mata_kuliah.id}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50"
                            >
                              {groupBy === 'all' && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{item.mata_kuliah.nama}</div>
                                  <div className="text-sm text-gray-500">{item.mata_kuliah.kode}</div>
                                </td>
                              )}
                              {groupBy !== 'all' && (
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
                              )}
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
                              {groupBy !== 'tipe' && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    item.tipe_honor ? 
                                    tipeHonorColors[item.tipe_honor] || 'bg-gray-100 text-gray-800' : 
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {item.tipe_honor ? `Tipe ${item.tipe_honor}` : 'Belum di-set'}
                                  </span>
                                </td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                Rp {item.total_honor.toLocaleString()}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
          </div>
        </motion.div>

        {/* Set Honor Modal */}
        {honorModal && (
          <div className="fixed inset-0 drop-shadow-2xl bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-lg w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Set Tipe Honor Baru</h2>
                  <button 
                    onClick={() => setHonorModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asisten</label>
                    <select
                      name="asisten_id"
                      value={honorForm.asisten_id}
                      onChange={handleHonorFormChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Pilih Asisten</option>
                      {Array.from(new Set(processDisplayData.map(item => item.asisten_id)))
                        .map(asistenId => {
                          const asisten = processDisplayData.find(item => item.asisten_id === asistenId)?.asisten;
                          const hasHonor = rekapitulasiData.some(r => r.asisten_id === asistenId);
                          return { asistenId, asisten, hasHonor };
                        })
                        .filter(({ hasHonor }) => !hasHonor)
                        .map(({ asistenId, asisten }) => (
                          <option key={asistenId} value={asistenId}>
                            {asisten.nama} ({asisten.nim})
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Honor</label>
                    <select
                      name="tipe_honor"
                      value={honorForm.tipe_honor}
                      onChange={handleHonorFormChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="A">Tipe A (Rp 12,500)</option>
                      <option value="B">Tipe B (Rp 14,500)</option>
                      <option value="C">Tipe C (Rp 16,500)</option>
                      <option value="D">Tipe D (Rp 22,500)</option>
                      <option value="E">Tipe E (Rp 24,500)</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setHonorModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Batal
                  </button>
                  <button
                    onClick={submitHonor}
                    disabled={!honorForm.asisten_id}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                      !honorForm.asisten_id ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Modal (only for honor type) */}
        {editModal && currentItem && (
          <div className="fixed inset-0 drop-shadow-2xl bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-lg w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Edit Tipe Honor</h2>
                  <button 
                    onClick={() => setEditModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asisten</label>
                    <p className="text-sm text-gray-900">
                      {currentItem.asisten.nama} ({currentItem.asisten.nim})
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="tipe_honor" className="block text-sm font-medium text-gray-700 mb-1">Tipe Honor</label>
                    <select
                      id="tipe_honor"
                      name="tipe_honor"
                      value={formData.tipe_honor}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="A">Tipe A (Rp 12,500)</option>
                      <option value="B">Tipe B (Rp 14,500)</option>
                      <option value="C">Tipe C (Rp 16,500)</option>
                      <option value="D">Tipe D (Rp 22,500)</option>
                      <option value="E">Tipe E (Rp 24,500)</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Batal
                  </button>
                  <button
                    onClick={submitUpdate}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default DataRekapitulasi;