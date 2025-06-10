import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiX, 
  FiCheck, 
  FiChevronDown, 
  FiChevronUp,
  FiDownload,
  FiSearch
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DataRekapitulasi = () => {
  // State management
  const [rekapitulasiData, setRekapitulasiData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('all'); // 'all', 'matkul', or 'tipe'
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedGroups, setExpandedGroups] = useState({});
  
  // Modal states
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [honorModal, setHonorModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  
  // Form states
  const [honorForm, setHonorForm] = useState({
    asisten_id: '',
    tipe_honor: 'A'
  });
  
  const [formData, setFormData] = useState({
    jumlah_hadir: '',
    jumlah_izin: '',
    jumlah_alpha: '',
    jumlah_pengganti: '',
    tipe_honor: '',
    honor_pertemuan: ''
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
        
        // Process and merge data
        const mergedData = processMergedData(presensiResponse.data, rekapResponse.data?.data || []);
        setRekapitulasiData(mergedData);
        setFilteredData(mergedData);
        
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

  // Process and merge data from both endpoints
  const processMergedData = (presensiData, rekapData) => {
    const asistenInPresensi = [...new Set(presensiData.map(p => p.asisten_id))];
    
    return asistenInPresensi.map(asistenId => {
      const presensiAsisten = presensiData.find(p => p.asisten_id === asistenId);
      const existingRekap = rekapData.find(r => r.asisten_id === asistenId);
      
      // Calculate counts from presensi data
      const counts = calculatePresensiCounts(presensiData, asistenId);
      
      return {
        id: existingRekap?.id || null,
        asisten_id: asistenId,
        asisten: presensiAsisten.asisten,
        tipe_honor: existingRekap?.tipe_honor || null,
        honor_pertemuan: existingRekap?.honor_pertemuan || 0,
        ...counts,
        total_honor: existingRekap ? 
          existingRekap.honor_pertemuan * (counts.jumlah_hadir + counts.jumlah_pengganti) : 
          0
      };
    });
  };

  // Calculate various counts from presensi data
  const calculatePresensiCounts = (presensiData, asistenId) => {
    return {
      jumlah_hadir: presensiData.filter(p => 
        p.asisten_id === asistenId && 
        p.status === 'hadir' && 
        p.jenis === 'utama'
      ).length,
      jumlah_izin: presensiData.filter(p => 
        p.asisten_id === asistenId && 
        p.status === 'izin' && 
        p.jenis === 'utama'
      ).length,
      jumlah_alpha: presensiData.filter(p => 
        p.asisten_id === asistenId && 
        p.status === 'alpha' && 
        p.jenis === 'utama'
      ).length,
      jumlah_pengganti: presensiData.filter(p => 
        p.asisten_id === asistenId && 
        p.status === 'hadir' && 
        p.jenis === 'pengganti'
      ).length
    };
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...rekapitulasiData];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.asisten?.nama?.toLowerCase().includes(term) ||
        item.asisten?.nim?.toLowerCase().includes(term) ||
        (item.tipe_honor && `tipe ${item.tipe_honor}`.includes(term))
      );
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
  }, [rekapitulasiData, searchTerm, sortOrder]);

  // Group data by selected option
  const groupedData = useMemo(() => {
    const grouped = {};
    
    filteredData.forEach(item => {
      let key, label;
      
      if (groupBy === 'matkul') {
        // Group by mata kuliah (if available)
        const matkul = item.asisten?.mata_kuliah?.nama || 'Lainnya';
        key = `matkul-${matkul}`;
        label = matkul;
      } else if (groupBy === 'tipe') {
        // Group by honor type
        const tipe = item.tipe_honor || 'Belum di-set';
        key = `tipe-${tipe}`;
        label = `Tipe ${tipe}`;
      } else {
        // No grouping
        key = 'all';
        label = 'Semua Data';
      }
      
      if (!grouped[key]) {
        grouped[key] = {
          key,
          label,
          items: [],
          totalHonor: 0
        };
      }
      
      grouped[key].items.push(item);
      grouped[key].totalHonor += item.total_honor || 0;
    });
    
    return grouped;
  }, [filteredData, groupBy]);

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
          asisten_id: honorForm.asisten_id,
          tipe_honor: honorForm.tipe_honor
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      toast.success('Tipe honor berhasil diset');
      setHonorModal(false);
      
      // Refresh data
      const presensiResponse = await axios.get('http://localhost:8080/api/admin/presensi', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const rekapResponse = await axios.get('http://localhost:8080/api/admin/rekapitulasi', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const mergedData = processMergedData(presensiResponse.data, rekapResponse.data?.data || []);
      setRekapitulasiData(mergedData);
      
    } catch (err) {
      console.error('Error setting honor type:', err);
      toast.error(err.response?.data?.message || 'Gagal menyet tipe honor');
    }
  };

  // Handle rekapitulasi update
  const submitUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/admin/rekapitulasi/${currentItem.asisten_id}`,
        {
          asisten_id: currentItem.asisten_id,
          jumlah_hadir: formData.jumlah_hadir,
          jumlah_izin: formData.jumlah_izin,
          jumlah_alpha: formData.jumlah_alpha,
          jumlah_pengganti: formData.jumlah_pengganti,
          tipe_honor: formData.tipe_honor
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      toast.success('Data rekapitulasi berhasil diperbarui');
      setEditModal(false);
      
      // Refresh data
      const presensiResponse = await axios.get('http://localhost:8080/api/admin/presensi', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const rekapResponse = await axios.get('http://localhost:8080/api/admin/rekapitulasi', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const mergedData = processMergedData(presensiResponse.data, rekapResponse.data?.data || []);
      setRekapitulasiData(mergedData);
      
    } catch (err) {
      console.error('Error updating data:', err);
      toast.error(err.response?.data?.message || 'Gagal memperbarui data rekapitulasi');
    }
  };

  // Handle rekapitulasi deletion
  const submitDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/api/admin/rekapitulasi/${currentItem.id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      toast.success('Data rekapitulasi berhasil dihapus');
      setDeleteModal(false);
      
      // Refresh data
      const presensiResponse = await axios.get('http://localhost:8080/api/admin/presensi', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const rekapResponse = await axios.get('http://localhost:8080/api/admin/rekapitulasi', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const mergedData = processMergedData(presensiResponse.data, rekapResponse.data?.data || []);
      setRekapitulasiData(mergedData);
      
    } catch (err) {
      console.error('Error deleting data:', err);
      toast.error(err.response?.data?.message || 'Gagal menghapus data rekapitulasi');
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

  // Open edit modal
  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      jumlah_hadir: item.jumlah_hadir,
      jumlah_izin: item.jumlah_izin,
      jumlah_alpha: item.jumlah_alpha,
      jumlah_pengganti: item.jumlah_pengganti,
      tipe_honor: item.tipe_honor,
      honor_pertemuan: item.honor_pertemuan
    });
    setEditModal(true);
  };

  // Open delete modal
  const handleDelete = (item) => {
    setCurrentItem(item);
    setDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen min-w-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data rekapitulasi...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="text-gray-600 flex min-h-screen min-w-screen bg-gray-50">
      <AdminSidebar />
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
                  placeholder="Cari asisten atau tipe honor..."
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
                  <option value="all">Semua Data</option>
                  <option value="matkul">Mata Kuliah</option>
                  <option value="tipe">Tipe Honor</option>
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
          className="bg-white p-6 rounded-xl shadow"
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
            {Object.values(groupedData).map(group => (
              <div key={group.key} className="mb-6">
                {/* Group Header */}
                <div 
                  onClick={() => toggleGroup(group.key)}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="font-medium text-lg">
                      {group.label}
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {group.items.length} Asisten
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
                          {group.items.map((item, index) => (
                            <motion.tr
                              key={item.asisten_id}
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
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    <FiEdit2 />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Set Honor Modal */}
        {honorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                      {rekapitulasiData
                        .filter(item => !item.tipe_honor)
                        .map(item => (
                          <option key={item.asisten_id} value={item.asisten_id}>
                            {item.asisten.nama} ({item.asisten.nim})
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

        {/* Edit Modal */}
        {editModal && currentItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-lg w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Edit Rekapitulasi</h2>
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="jumlah_hadir" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Hadir</label>
                      <input
                        type="number"
                        id="jumlah_hadir"
                        name="jumlah_hadir"
                        value={formData.jumlah_hadir}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="jumlah_izin" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Izin</label>
                      <input
                        type="number"
                        id="jumlah_izin"
                        name="jumlah_izin"
                        value={formData.jumlah_izin}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="jumlah_alpha" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Alpha</label>
                      <input
                        type="number"
                        id="jumlah_alpha"
                        name="jumlah_alpha"
                        value={formData.jumlah_alpha}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="jumlah_pengganti" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Pengganti</label>
                      <input
                        type="number"
                        id="jumlah_pengganti"
                        name="jumlah_pengganti"
                        value={formData.jumlah_pengganti}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    </div>
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
                      <option value="A">Tipe A</option>
                      <option value="B">Tipe B</option>
                      <option value="C">Tipe C</option>
                      <option value="D">Tipe D</option>
                      <option value="E">Tipe E</option>
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

        {/* Delete Confirmation Modal */}
        {deleteModal && currentItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div 
              className="bg-white rounded-lg w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Konfirmasi Hapus</h2>
                  <button 
                    onClick={() => setDeleteModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={24} />
                  </button>
                </div>
                
                <p className="mb-6">
                  Apakah Anda yakin ingin menghapus rekapitulasi untuk asisten <strong>{currentItem.asisten.nama}</strong>?
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Batal
                  </button>
                  <button
                    onClick={submitDelete}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DataRekapitulasi;