import React, { useState, useEffect, useMemo } from 'react';
import Layout from "../components/Layout";
import { motion } from 'framer-motion';
import { FiChevronDown, FiChevronUp, FiCheck, FiClock, FiX, FiUser, FiDollarSign, FiSearch, FiCalendar, FiBook, FiEye, FiDownload } from 'react-icons/fi';

const RekapitulasiPage = () => {
  const [presensiData, setPresensiData] = useState([]);
  const [rekapitulasiData, setRekapitulasiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [groupBy, setGroupBy] = useState('date');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [currentPresensi, setCurrentPresensi] = useState(null);
  const tableHeaders = [
    { name: 'Mata Kuliah', mobileName: 'Matkul', class: 'px-1 py-1 max-w-[90px] sm:max-w-[150px]' },
    { name: 'Hari/Jam', mobileName: 'Hari/Jam', class: 'px-1 py-1 max-w-[70px] sm:max-w-[120px]' },
    { name: 'Kelas/Lab', mobileName: 'Kls/Lab', class: 'px-1 py-1 max-w-[50px] sm:max-w-[80px]' },
    { name: 'Status', mobileName: 'Sts', class: 'px-1 py-1' },
    { name: 'Tanggal', mobileName: 'Tgl', class: 'px-1 py-1' },
    { name: 'Aksi', mobileName: 'Act', class: 'px-1 py-1' }
  ];
  
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // Color mappings
  const statusColors = {
    hadir: 'bg-green-100 text-green-800',
    izin: 'bg-yellow-100 text-yellow-800',
    alpha: 'bg-red-100 text-red-800'
  };

  const tipeHonorColors = {
    A: 'bg-red-100 text-red-800',
    B: 'bg-orange-100 text-orange-800',
    C: 'bg-yellow-100 text-yellow-800',
    D: 'bg-green-100 text-green-800',
    E: 'bg-blue-100 text-blue-800'
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user || !user.id) {
          throw new Error('User data not found');
        }

        // Fetch both data sources in parallel
        const [presensiResponse, rekapitulasiResponse] = await Promise.all([
          fetch(`http://localhost:8080/api/presensi?asisten_id=${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetch(`http://localhost:8080/api/rekapitulasi?asisten_id=${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
        ]);

        if (!presensiResponse.ok || !rekapitulasiResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [presensiResult, rekapitulasiResult] = await Promise.all([
          presensiResponse.json(),
          rekapitulasiResponse.json()
        ]);

        // Filter data by user ID
        const presensiData = Array.isArray(presensiResult) ? 
          presensiResult.filter(item => item.asisten && item.asisten.id === user.id) : 
          presensiResult.data ? presensiResult.data.filter(item => item.asisten && item.asisten.id === user.id) : [];
        
        const rekapitulasiData = Array.isArray(rekapitulasiResult) ? 
          rekapitulasiResult.filter(item => item.asisten && item.asisten.id === user.id) : 
          rekapitulasiResult.data ? rekapitulasiResult.data.filter(item => item.asisten && item.asisten.id === user.id) : [];

        setPresensiData(presensiData);
        setRekapitulasiData(rekapitulasiData);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process data for grouping by mata kuliah
  const groupedByMataKuliah = useMemo(() => {
    if (!dataLoaded) return {};
    
    const grouped = {};
    
    if (!Array.isArray(presensiData)) return grouped;

    presensiData.forEach(item => {
      if (item && item.jadwal && item.jadwal.mata_kuliah) {
        const matkulId = item.jadwal.mata_kuliah.id;
        const matkulName = item.jadwal.mata_kuliah.nama;
        const matkulKode = item.jadwal.mata_kuliah.kode;
        
        if (!grouped[matkulId]) {
          grouped[matkulId] = {
            mataKuliah: {
              id: matkulId,
              nama: matkulName,
              kode: matkulKode
            },
            jadwal: item.jadwal,
            presensi: [],
            stats: {
              hadir: 0,
              izin: 0,
              alpha: 0,
              pengganti: 0
            }
          };
        }
        
        grouped[matkulId].presensi.push(item);
        
        // Update stats
        if (item.status === 'hadir') grouped[matkulId].stats.hadir++;
        if (item.status === 'izin') grouped[matkulId].stats.izin++;
        if (item.status === 'alpha') grouped[matkulId].stats.alpha++;
        if (item.jenis === 'pengganti') grouped[matkulId].stats.pengganti++;
      }
    });

    return grouped;
  }, [presensiData, dataLoaded]);

  // Filter and sort presensi data
  const filteredPresensi = useMemo(() => {
    if (!dataLoaded) return [];
    
    let result = [...presensiData];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.jadwal?.mata_kuliah?.nama?.toLowerCase().includes(term)) ||
        (item.jadwal?.kelas?.toLowerCase().includes(term)) ||
        (item.status?.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.waktu_input);
      const dateB = new Date(b.waktu_input);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    
    return result;
  }, [presensiData, searchTerm, sortOrder, dataLoaded]);

  // Group presensi by selected option
  const groupPresensi = () => {
    if (!dataLoaded) return {};
    
    const grouped = {};
    
    filteredPresensi.forEach(item => {
      let key, mataKuliah, date;
      
      if (groupBy === 'matkul') {
        mataKuliah = item.jadwal?.mata_kuliah?.nama || 'Unknown';
        key = mataKuliah;
      } else {
        // Group by date (YYYY-MM-DD)
        date = new Date(item.waktu_input).toISOString().split('T')[0];
        key = date;
      }
      
      if (!grouped[key]) {
        grouped[key] = {
          key,
          mataKuliah: groupBy === 'matkul' ? mataKuliah : null,
          date: groupBy === 'date' ? date : null,
          items: []
        };
      }
      
      grouped[key].items.push(item);
    });
    
    return grouped;
  };

  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const groupedPresensi = groupPresensi();

  const openDetailModal = (presensi) => {
    setCurrentPresensi(presensi);
    setShowModal(true);
  };

  // Mobile-friendly stats grid
  const StatsGrid = ({ rekapitulasiData }) => (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
      {rekapitulasiData.map((item) => (
        <React.Fragment key={item.id}>
          <div className="bg-green-50 p-2 rounded-lg border border-green-100 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600">Hadir</p>
                <p className="text-xs font-bold text-green-700 sm:text-sm">{item.jumlah_hadir}</p>
              </div>
              <div className="p-1 bg-green-100 rounded-full text-green-600">
                <FiCheck className="w-3 h-3" />
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-100 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600">Izin</p>
                <p className="text-xs font-bold text-yellow-700 sm:text-sm">{item.jumlah_izin}</p>
              </div>
              <div className="p-1 bg-yellow-100 rounded-full text-yellow-600">
                <FiClock className="w-3 h-3" />
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-2 rounded-lg border border-red-100 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600">Alpha</p>
                <p className="text-xs font-bold text-red-700 sm:text-sm">{item.jumlah_alpha}</p>
              </div>
              <div className="p-1 bg-red-100 rounded-full text-red-600">
                <FiX className="w-3 h-3" />
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-2 rounded-lg border border-purple-100 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600">Pengganti</p>
                <p className="text-xs font-bold text-purple-700 sm:text-sm">{item.jumlah_pengganti}</p>
              </div>
              <div className="p-1 bg-purple-100 rounded-full text-purple-600">
                <FiUser className="w-3 h-3" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600">Honor/Pertemuan</p>
                <p className="text-xs font-bold text-blue-700 sm:text-sm">Rp {item.honor_pertemuan.toLocaleString()}</p>
              </div>
              <div className="p-1 bg-blue-100 rounded-full text-blue-600">
                <FiDollarSign className="w-3 h-3" />
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-100 sm:p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-600">Total Honor</p>
                <p className="text-xs font-bold text-indigo-700 sm:text-sm">Rp {item.total_honor.toLocaleString()}</p>
              </div>
              <div className="p-1 bg-indigo-100 rounded-full text-indigo-600">
                <FiDollarSign className="w-3 h-3" />
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );

  const PresensiTableRow = ({ item }) => (
    <tr key={item.id} className="hover:bg-gray-50 text-xs sm:text-sm">
      {/* Mata Kuliah */}
      <td className="px-2 py-2 max-w-[120px] sm:max-w-[200px] truncate">
        <div className="flex items-center">
          <FiBook className="flex-shrink-0 text-purple-600 mr-1 sm:mr-2 text-xs sm:text-sm" />
          <div>
            <div className="font-medium">
              <span className="hidden sm:inline">{item.jadwal?.mata_kuliah?.nama || 'N/A'}</span>
              <span className="sm:hidden">
                {item.jadwal?.mata_kuliah?.nama 
                  ? item.jadwal.mata_kuliah.nama.split(' ')[0] + (item.jadwal.mata_kuliah.nama.split(' ').length > 1 ? '...' : '')
                  : 'N/A'}
              </span>
            </div>
            <div className="text-gray-500">
              <span className="hidden sm:inline">{item.jenis}</span>
              <span className="sm:hidden">{item.jenis?.charAt(0)}</span>
            </div>
          </div>
        </div>
      </td>
  
      {/* Hari/Jam */}
      <td className="px-2 py-2 max-w-[100px] sm:max-w-[150px]">
        <div>
          <div className="font-medium">
            <span className="hidden sm:inline">{item.jadwal?.hari}</span>
            <span className="sm:hidden">{item.jadwal?.hari?.substring(0, 3)}</span>
          </div>
          <div className="flex items-center text-gray-500">
            <FiClock className="mr-1" />
            <span className="hidden sm:inline">{item.jadwal?.jam_mulai} - {item.jadwal?.jam_selesai}</span>
            <span className="sm:hidden">{item.jadwal?.jam_mulai?.replace(':00', '')}</span>
          </div>
        </div>
      </td>
  
      {/* Kelas/Lab */}
      <td className="px-2 py-2 max-w-[80px] sm:max-w-[120px]">
        <div>
          <span className="hidden sm:inline">{item.jadwal?.kelas}</span>
          <span className="sm:hidden">{item.jadwal?.kelas?.replace('Kelas ', 'Kl.')}</span>
        </div>
        <div className="text-gray-500">
          <span className="hidden sm:inline">{item.jadwal?.lab}</span>
          <span className="sm:hidden">{item.jadwal?.lab?.split(' ').map(w => w[0]).join('')}</span>
        </div>
      </td>
  
      {/* Status */}
      <td className="px-2 py-2">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[item.status] || 'bg-gray-100 text-gray-800'}`}>
          <span className="hidden sm:inline">{item.status}</span>
          <span className="sm:hidden">
            {item.status === 'hadir' ? 'H' : 
             item.status === 'izin' ? 'I' : 
             item.status === 'alpha' ? 'A' : item.status?.charAt(0)}
          </span>
        </span>
      </td>
  
      {/* Tanggal */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className="text-gray-700">
          {new Date(item.waktu_input).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
        </div>
        <div className="text-gray-500 sm:hidden text-xs">
          {new Date(item.waktu_input).toLocaleDateString('id-ID', { year: '2-digit' })}
        </div>
      </td>
  
      {/* Aksi */}
      <td className="px-2 py-2">
        <button
          onClick={() => openDetailModal(item)}
          className="text-blue-600 hover:text-blue-900 flex items-center justify-center sm:justify-start"
        >
          <FiEye className="mr-0 sm:mr-1" />
          <span className="hidden sm:inline">Detail</span>
        </button>
      </td>
    </tr>
  );

  const SearchAndFilterControls = () => (
    <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2 w-full">
      <div className="relative flex-1 min-w-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400 text-sm" />
        </div>
        <input
          type="text"
          placeholder="Cari..."
          className="text-xs pl-8 pr-2 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:space-x-2">
        <select
          className="text-xs text-gray-700 border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
        >
          <option value="date">Tanggal</option>
          <option value="matkul">Matkul</option>
        </select>
        <select
          className="text-xs text-gray-700 border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="desc">Terbaru</option>
          <option value="asc">Terlama</option>
        </select>
      </div>
    </div>
  );

  if (loading || !dataLoaded) {
    return (
      <Layout>
        <main className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Memuat data rekapitulasi...</p>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.main 
        className="flex-1 p-4 sm:p-6 overflow-x-hidden max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* <motion.h1 
          className="text-2xl md:text-3xl font-bold text-blue-900 mb-4 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Rekapitulasi Kehadiran
        </motion.h1> */}

        {/* Presensi Stats Section */}
        {rekapitulasiData.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 * index }}
            className="mb-6 md:mb-8 bg-white rounded-xl shadow-md p-4 md:p-6"
          >
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6 pb-2 border-gray-100">
              Statistik Presensi
            </h3>
            
            <StatsGrid rekapitulasiData={[item]} />
            
            {/* Tipe Honor */}
            <div className="mt-3 md:mt-4">
              <span className={`px-2 py-1 text-xs md:text-sm leading-5 font-semibold rounded-full ${tipeHonorColors[item.tipe_honor] || 'bg-gray-100 text-gray-800'}`}>
                Tipe Honor: {item.tipe_honor}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Riwayat Presensi Section */}
        <motion.div
          className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-800">Riwayat Presensi</h3>
            <SearchAndFilterControls />
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {Object.values(groupedPresensi).map((group) => {
              const isExpanded = expandedGroups[group.key] !== false;

              return (
                <div key={group.key}>
                  <div 
                    className="text-black flex justify-between items-center p-3 md:p-4 bg-gray-200 cursor-pointer hover:bg-gray-400"
                    onClick={() => toggleGroup(group.key)}
                  >
                    <div>
                      {groupBy === "matkul" ? (
                        <>
                          <h3 className="text-base md:text-lg font-medium line-clamp-1">{group.mataKuliah}</h3>
                          <p className="text-xs md:text-sm text-gray-600">{group.items.length} presensi</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-base md:text-lg font-medium line-clamp-1">
                            {new Date(group.date).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-600">
                            {group.items.length} presensi
                          </p>
                        </>
                      )}
                    </div>
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                  
                  {isExpanded && (
                    <div className="overflow-x-auto text-xs">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                        {tableHeaders.map((header) => (
                            <th key={header.name} className={`${header.class} text-left text-[0.6rem] sm:text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                              <span className="hidden sm:inline">{header.name}</span>
                              <span className="sm:hidden">{header.mobileName}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {group.items.map((item) => (
                          <PresensiTableRow key={item.id} item={item} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Modal for Detail */}
        {showModal && currentPresensi && (
          <div className="fixed inset-0 drop-shadow-2xl bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b px-4 py-3 md:px-6 md:py-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detail Presensi
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <FiX className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              </div>
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                  <div>
                    <h4 className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Mata Kuliah</h4>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <FiBook className="text-purple-600 text-lg" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm md:text-base font-medium text-gray-900">
                          {currentPresensi.jadwal?.mata_kuliah?.nama || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentPresensi.jenis}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
                    <div className="bg-gray-50 p-2 md:p-4 rounded-lg">
                      <h4 className="text-xs md:text-sm font-medium text-gray-500 mb-1">Hari/Jam</h4>
                      <div className="flex items-center">
                        <FiCalendar className="text-gray-400 mr-1 md:mr-2 text-sm" />
                        <div>
                          <p className="text-xs md:text-sm font-medium text-gray-900">
                            {currentPresensi.jadwal?.hari}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <FiClock className="mr-1" />
                            {currentPresensi.jadwal?.jam_mulai} - {currentPresensi.jadwal?.jam_selesai}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-2 md:p-4 rounded-lg">
                      <h4 className="text-xs md:text-sm font-medium text-gray-500 mb-1">Kelas/Lab</h4>
                      <p className="text-xs md:text-sm font-medium text-gray-900">
                        {currentPresensi.jadwal?.kelas}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentPresensi.jadwal?.lab}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-2 md:p-4 rounded-lg">
                      <h4 className="text-xs md:text-sm font-medium text-gray-500 mb-1">Status</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[currentPresensi.status] || 'bg-gray-100 text-gray-800'}`}>
                        {currentPresensi.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:gap-6 mb-4 md:mb-6">
                  {currentPresensi.isi_materi && (
                    <div>
                      <h4 className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">Isi Materi</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs md:text-sm text-gray-700">{currentPresensi.isi_materi}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs md:text-sm font-medium text-gray-500 mb-1 md:mb-2">
                      {currentPresensi.status === 'izin' ? 'Bukti Izin' : 'Bukti Kehadiran'}
                    </h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {currentPresensi.bukti_kehadiran || currentPresensi.bukti_izin ? (
                        <div className="flex flex-col">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-600">
                              {currentPresensi.status === 'izin' ? 'Bukti izin' : 'Bukti kehadiran'}
                            </span>
                            <a 
                              href={currentPresensi.bukti_kehadiran || currentPresensi.bukti_izin} 
                              download
                              className="flex items-center text-blue-600 hover:text-blue-800 text-xs md:text-sm"
                            >
                              <FiDownload className="mr-1" />
                              Download
                            </a>
                          </div>
                          <div className="flex items-center justify-center">
                            <img 
                              src={currentPresensi.bukti_kehadiran || currentPresensi.bukti_izin} 
                              alt={currentPresensi.status === 'izin' ? 'Bukti izin' : 'Bukti kehadiran'}
                              className="max-h-48 md:max-h-64 w-auto object-contain"
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = "https://via.placeholder.com/400x300?text=Gagal+memuat+gambar";
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">Tidak ada bukti</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1 md:px-4 md:py-2 border border-gray-300 rounded-md text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.main>
    </Layout>
  );
};

export default RekapitulasiPage;