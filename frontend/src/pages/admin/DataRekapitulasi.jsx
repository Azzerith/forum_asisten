import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DataRekapitulasi = () => {
  const [rekapitulasiData, setRekapitulasiData] = useState([]);
  const [groupBy, setGroupBy] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [HonorModal, setHonorModal] = useState(false);
  const [HonorForm, setHonorForm] = useState({
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

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, [groupBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Ambil data presensi terlebih dahulu
      const presensiResponse = await fetch('http://localhost:8080/api/admin/presensi', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!presensiResponse.ok) {
        throw new Error('Failed to fetch presensi data');
      }
      
      const presensiData = await presensiResponse.json();
      
      // 2. Ambil data rekapitulasi
      const rekapResponse = await fetch('http://localhost:8080/api/admin/rekapitulasi', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      let rekapData = [];
      if (rekapResponse.ok) {
        const result = await rekapResponse.json();
        rekapData = result.data || [];
      }
      
      // 3. Gabungkan data
      const asistenInPresensi = [...new Set(presensiData.map(p => p.asisten_id))];
      
      const mergedData = asistenInPresensi.map(asistenId => {
        // Cari data asisten dari presensi
        const presensiAsisten = presensiData.find(p => p.asisten_id === asistenId);
        const asisten = presensiAsisten.asisten;
        
        // Cari data rekapitulasi
        const existingRekap = rekapData.find(r => r.asisten_id === asistenId);
        
        // Hitung jumlah kehadiran dari presensi
        const hadir = presensiData.filter(p => 
          p.asisten_id === asistenId && 
          p.status === 'hadir' && 
          p.jenis === 'utama'
        ).length;
        
        const izin = presensiData.filter(p => 
          p.asisten_id === asistenId && 
          p.status === 'izin' && 
          p.jenis === 'utama'
        ).length;
        
        const alpha = presensiData.filter(p => 
          p.asisten_id === asistenId && 
          p.status === 'alpha' && 
          p.jenis === 'utama'
        ).length;
        
        const pengganti = presensiData.filter(p => 
          p.asisten_id === asistenId && 
          p.status === 'hadir' && 
          p.jenis === 'pengganti'
        ).length;
        
        return {
          id: existingRekap?.id || null,
          asisten_id: asistenId,
          asisten: asisten,
          tipe_honor: existingRekap?.tipe_honor || null,
          honor_pertemuan: existingRekap?.honor_pertemuan || 0,
          jumlah_hadir: hadir,
          jumlah_izin: izin,
          jumlah_alpha: alpha,
          jumlah_pengganti: pengganti,
          total_honor: existingRekap ? 
            existingRekap.honor_pertemuan * (hadir + pengganti) : 
            0
        };
      });
      
      setRekapitulasiData(mergedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data rekapitulasi');
      setLoading(false);
    }
  };
  
  // Fungsi untuk submit set honor baru
  const submitHonor = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/rekapitulasi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          asisten_id: HonorForm.asisten_id,
          tipe_honor: HonorForm.tipe_honor
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to set honor type');
      }
  
      toast.success('Tipe honor berhasil diset');
      setHonorModal(false);
      fetchData();
    } catch (error) {
      console.error('Error setting honor type:', error);
      toast.error('Gagal menyet tipe honor');
    }
  };

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

  const handleDelete = (item) => {
    setCurrentItem(item);
    setDeleteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const submitUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/rekapitulasi/${currentItem.asisten_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          asisten_id: currentItem.asisten_id,
          jumlah_hadir: formData.jumlah_hadir,
          jumlah_izin: formData.jumlah_izin,
          jumlah_alpha: formData.jumlah_alpha,
          jumlah_pengganti: formData.jumlah_pengganti,
          tipe_honor: formData.tipe_honor
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to update rekapitulasi');
      }
  
      toast.success('Data rekapitulasi berhasil diperbarui');
      setEditModal(false);
      fetchData();
    } catch (error) {
      console.error('Error updating data:', error);
      toast.error('Gagal memperbarui data rekapitulasi');
    }
  };

  const submitDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/rekapitulasi/${currentItem.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete rekapitulasi');
      }

      toast.success('Data rekapitulasi berhasil dihapus');
      setDeleteModal(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error);
      toast.error('Gagal menghapus data rekapitulasi');
    }
  };

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

        {/* Filter Section */}
        <motion.div
          className="mb-8 bg-white p-6 rounded-xl shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Filter Data</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setGroupBy('all')}
                className={`px-4 py-2 rounded-lg ${groupBy === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Semua Data
              </button>
              <button
                onClick={() => setGroupBy('matkul')}
                className={`px-4 py-2 rounded-lg ${groupBy === 'matkul' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Kelompokkan per Mata Kuliah
              </button>
            </div>
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {groupBy === 'matkul' ? 'Rekapitulasi per Mata Kuliah' : 'Semua Data Rekapitulasi'}
        </h2>
        <div className="flex space-x-2">
        <button
            onClick={() => setHonorModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
            + Set Honor Baru
            </button>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Refresh Data
            </button>
          </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asisten</th>
                    {groupBy === 'matkul' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Kuliah</th>
                    )}
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
                      {groupBy === 'matkul' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.mata_kuliah?.nama || '-'} ({item.mata_kuliah?.kode || '-'})
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
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={groupBy === 'matkul' ? 8 : 7} className="px-6 py-4 text-sm font-medium text-gray-900">
                      Total Honor Keseluruhan
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      Rp {rekapitulasiData.reduce((sum, item) => sum + item.total_honor, 0).toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </motion.div>
        {/* Modal Set Honor Baru */}
{HonorModal && (
  <div className="text-black fixed inset-0 drop-shadow-2xl bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
    <motion.div 
      className="bg-white p-6 rounded-lg w-full max-w-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="text-xl font-semibold mb-4">Set Tipe Honor Baru</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Asisten</label>
          <select
            name="asisten_id"
            value={HonorForm.asisten_id}
            onChange={(e) => setHonorForm({...HonorForm, asisten_id: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Pilih Asisten</option>
            {rekapitulasiData
              .filter(item => !item.tipe_honor) // Hanya tampilkan yang belum punya honor
              .map(item => (
                <option key={item.asisten.id} value={item.asisten.id}>
                  {item.asisten.nama} ({item.asisten.nim})
                </option>
              ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="tipe_honor" className="block text-sm font-medium text-gray-700">Tipe Honor</label>
          <select
            id="tipe_honor"
            name="tipe_honor"
            value={HonorForm.tipe_honor}
            onChange={(e) => setHonorForm({...HonorForm, tipe_honor: e.target.value})}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Simpan
        </button>
      </div>
    </motion.div>
  </div>
)}

        {/* Edit Modal */}
        {editModal && (
          <div className="fixed inset-0 drop-shadow-2xl bg-opacity-30 backdrop-blur-sm text-black flex items-center justify-center z-50">
            <motion.div 
              className="bg-white p-6 rounded-lg w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h2 className="text-xl font-semibold mb-4">Edit Rekapitulasi</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Asisten</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {currentItem?.asisten.nama} ({currentItem?.asisten.nim})
                  </p>
                </div>
                
                <div>
                  <label htmlFor="jumlah_hadir" className="block text-sm font-medium text-gray-700">Jumlah Hadir</label>
                  <input
                    type="number"
                    id="jumlah_hadir"
                    name="jumlah_hadir"
                    value={formData.jumlah_hadir}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="jumlah_izin" className="block text-sm font-medium text-gray-700">Jumlah Izin</label>
                  <input
                    type="number"
                    id="jumlah_izin"
                    name="jumlah_izin"
                    value={formData.jumlah_izin}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="jumlah_alpha" className="block text-sm font-medium text-gray-700">Jumlah Alpha</label>
                  <input
                    type="number"
                    id="jumlah_alpha"
                    name="jumlah_alpha"
                    value={formData.jumlah_alpha}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="jumlah_pengganti" className="block text-sm font-medium text-gray-700">Jumlah Pengganti</label>
                  <input
                    type="number"
                    id="jumlah_pengganti"
                    name="jumlah_pengganti"
                    value={formData.jumlah_pengganti}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="tipe_honor" className="block text-sm font-medium text-gray-700">Tipe Honor</label>
                  <select
                    id="tipe_honor"
                    name="tipe_honor"
                    value={formData.tipe_honor}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="A">Tipe A</option>
                    <option value="B">Tipe B</option>
                    <option value="C">Tipe C</option>
                    <option value="D">Tipe D</option>
                    <option value="E">Tipe E</option>
                  </select>
                </div>
                {/* <div>
                  <label htmlFor="honor_pertemuan" className="block text-sm font-medium text-gray-700">Honor per Pertemuan</label>
                  <input
                    type="number"
                    id="honor_pertemuan"
                    name="honor_pertemuan"
                    value={formData.honor_pertemuan}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div> */}
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
            </motion.div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              className="bg-white p-6 rounded-lg w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h2 className="text-xl font-semibold mb-4">Konfirmasi Hapus</h2>
              <p className="mb-4">
                Apakah Anda yakin ingin menghapus rekapitulasi untuk asisten <strong>{currentItem?.asisten.nama}</strong>?
              </p>
              
              <div className="mt-6 flex justify-end space-x-3">
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
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DataRekapitulasi;