import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { motion } from "framer-motion";
import axios from "axios";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiBook, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function DataMataKuliah() {
  const [mataKuliahList, setMataKuliahList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMataKuliah, setSelectedMataKuliah] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    kode: "",
    semester: 1,
    program_studi_id: ""
  });
  const [errors, setErrors] = useState({});
  const [programStudiList, setProgramStudiList] = useState([]);
  const [expandedProdi, setExpandedProdi] = useState({});

  useEffect(() => {
    fetchMataKuliah();
    fetchProgramStudi();
  }, []);

  const fetchMataKuliah = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/mata-kuliah`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMataKuliahList(response.data);
      // Initialize expanded state for each program studi
      const initialExpanded = {};
      response.data.forEach(mk => {
        initialExpanded[mk.program_studi.id] = true;
      });
      setExpandedProdi(initialExpanded);
    } catch (error) {
      console.error("Gagal mengambil data mata kuliah:", error);
      alert(`Gagal mengambil data: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgramStudi = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/program-studi`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProgramStudiList(response.data);
    } catch (error) {
      console.error("Gagal mengambil data program studi:", error);
    }
  };

  const toggleProdi = (prodiId) => {
    setExpandedProdi(prev => ({
      ...prev,
      [prodiId]: !prev[prodiId]
    }));
  };

  const handleDeleteMataKuliah = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus mata kuliah ini?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/mata-kuliah/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMataKuliahList(prev => prev.filter(mk => mk.id !== id));
      alert("Mata kuliah berhasil dihapus");
    } catch (error) {
      console.error("Gagal menghapus mata kuliah:", error);
      alert(`Gagal menghapus: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nama.trim()) newErrors.nama = "Nama wajib diisi";
    if (!formData.kode.trim()) newErrors.kode = "Kode wajib diisi";
    if (!formData.program_studi_id) newErrors.program_studi_id = "Program studi wajib dipilih";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
  
      // Konversi program_studi_id ke integer
      const payload = {
        ...formData,
        program_studi_id: parseInt(formData.program_studi_id, 10),
        semester: parseInt(formData.semester, 10), // jika perlu
      };
  
      let response;
  
      if (selectedMataKuliah) {
        response = await axios.put(
          `${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/mata-kuliah/${selectedMataKuliah.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_BASEURL}/api/admin/mata-kuliah`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
  
      alert(selectedMataKuliah ? "Mata kuliah berhasil diperbarui" : "Mata kuliah berhasil ditambahkan");
      fetchMataKuliah();
      setShowForm(false);
    } catch (error) {
      console.error("Gagal menyimpan mata kuliah:", error);
      let errorMessage = "Terjadi kesalahan saat menyimpan data";
  
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = "Data yang dimasukkan tidak valid";
        } else if (error.response.status === 409) {
          errorMessage = "Kode mata kuliah sudah terdaftar";
        } else {
          errorMessage = error.response.data.message || errorMessage;
        }
      }
  
      alert(`Gagal: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  

  // Group mata kuliah by program studi
  const groupedMataKuliah = mataKuliahList.reduce((acc, mk) => {
    const prodiId = mk.program_studi.id;
    if (!acc[prodiId]) {
      acc[prodiId] = {
        prodi: mk.program_studi,
        mataKuliah: []
      };
    }
    acc[prodiId].mataKuliah.push(mk);
    return acc;
  }, {});

  // Filter based on search term
  const filteredGroupedMataKuliah = Object.values(groupedMataKuliah)
    .map(group => ({
      ...group,
      mataKuliah: group.mataKuliah.filter(mk =>
        mk.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mk.kode.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter(group => group.mataKuliah.length > 0);

  useEffect(() => {
    if (selectedMataKuliah) {
      setFormData({
        nama: selectedMataKuliah.nama,
        kode: selectedMataKuliah.kode,
        semester: selectedMataKuliah.semester,
        program_studi_id: selectedMataKuliah.program_studi_id.toString()
      });
    } else {
      setFormData({
        nama: "",
        kode: "",
        semester: 1,
        program_studi_id: ""
      });
    }
  }, [selectedMataKuliah]);

  return (
    <Layout>
      <main className="flex-1 p-6 overflow-x-hidden">
        <motion.h1 
          className="text-3xl font-bold text-blue-900 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Data Mata Kuliah
        </motion.h1>

        <motion.div 
          className="bg-white p-6 rounded-xl shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari mata kuliah..."
                className="text-black w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              onClick={() => {
                setSelectedMataKuliah(null);
                setShowForm(true);
              }}
            >
              <FiPlus className="mr-2" />
              Tambah Mata Kuliah
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "450px" }}>
              {filteredGroupedMataKuliah.length > 0 ? (
                filteredGroupedMataKuliah.map(group => (
                  <div key={group.prodi.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-indigo-700 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleProdi(group.prodi.id)}
                    >
                      <h3 className="font-semibold text-lg text-white">
                        {group.prodi.nama}
                      </h3>
                      <div className="text-gray-500">
                        {expandedProdi[group.prodi.id] ? <FiChevronUp /> : <FiChevronDown />}
                      </div>
                    </div>
                    
                    {expandedProdi[group.prodi.id] && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {group.mataKuliah.map(mk => (
                              <tr key={mk.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{mk.kode}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">{mk.nama}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-700">Semester {mk.semester}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <button
                                      className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedMataKuliah(mk);
                                        setShowForm(true);
                                      }}
                                      title="Edit"
                                    >
                                      <FiEdit2 />
                                    </button>
                                    <button
                                      className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteMataKuliah(mk.id);
                                      }}
                                      title="Hapus"
                                    >
                                      <FiTrash2 />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-lg">
                  Tidak ada data mata kuliah yang ditemukan
                </div>
              )}
            </div>
          )}
        </motion.div>

        {showForm && (
          <motion.div 
            className="fixed inset-0 drop-shadow-2xl bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedMataKuliah ? "Edit Mata Kuliah" : "Tambah Mata Kuliah Baru"}
                </h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-black">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Mata Kuliah</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiBook className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="nama"
                      className={`pl-10 w-full px-4 py-2 border ${errors.nama ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      value={formData.nama}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Mata Kuliah</label>
                  <input
                    type="text"
                    name="kode"
                    className={`w-full px-4 py-2 border ${errors.kode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={formData.kode}
                    onChange={handleInputChange}
                  />
                  {errors.kode && <p className="mt-1 text-sm text-red-600">{errors.kode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select
                    name="semester"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.semester}
                    onChange={handleInputChange}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                  <select
                    name="program_studi_id"
                    className={`w-full px-4 py-2 border ${errors.program_studi_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={formData.program_studi_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Pilih Program Studi</option>
                    {programStudiList.map(prodi => (
                      <option key={prodi.id} value={prodi.id}>{prodi.nama}</option>
                    ))}
                  </select>
                  {errors.program_studi_id && <p className="mt-1 text-sm text-red-600">{errors.program_studi_id}</p>}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowForm(false)}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <FiCheck className="mr-2" />
                        Simpan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </main>
    </Layout>
  );
}