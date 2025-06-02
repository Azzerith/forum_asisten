import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarMenu from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronDown, FiChevronUp, FiClock, FiUser, FiUsers, FiBook, FiCalendar } from "react-icons/fi";

export default function MataKuliahPage() {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openSemesters, setOpenSemesters] = useState({});
  const [schedules, setSchedules] = useState([]);
  const [takenSchedules, setTakenSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8080/api/jadwal");
        setSchedules(response.data);
        
        // Fetch taken schedules
        const takenResponse = await axios.get("http://localhost:8080/api/asisten-kelas");
        setTakenSchedules(takenResponse.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Group schedules by program studi
  const programs = schedules.reduce((acc, schedule) => {
    const programId = schedule.mata_kuliah.program_studi.id;
    const existingProgram = acc.find(p => p.id === programId);
    
    if (existingProgram) {
      existingProgram.courses.push({
        id: schedule.mata_kuliah.id,
        name: schedule.mata_kuliah.nama,
        code: schedule.mata_kuliah.kode,
        semester: schedule.semester,
        schedules: [{
          id: schedule.id,
          day: schedule.hari,
          time: `${schedule.jam_mulai} - ${schedule.jam_selesai}`,
          lab: schedule.lab,
          dosen: schedule.dosen.nama,
          kelas: schedule.kelas,
          assistants: getAssistantsForSchedule(schedule.id)
        }]
      });
    } else {
      acc.push({
        id: programId,
        name: schedule.mata_kuliah.program_studi.nama,
        description: `Program studi ${schedule.mata_kuliah.program_studi.nama}`,
        color: programId === 1 ? "from-purple-600 to-purple-700" : "from-blue-600 to-blue-700",
        courses: [{
          id: schedule.mata_kuliah.id,
          name: schedule.mata_kuliah.nama,
          code: schedule.mata_kuliah.kode,
          semester: schedule.semester,
          schedules: [{
            id: schedule.id,
            day: schedule.hari,
            time: `${schedule.jam_mulai} - ${schedule.jam_selesai}`,
            lab: schedule.lab,
            dosen: schedule.dosen.nama,
            kelas: schedule.kelas,
            assistants: getAssistantsForSchedule(schedule.id)
          }]
        }]
      });
    }
    
    return acc;
  }, []);

  // Merge schedules for the same course
  programs.forEach(program => {
    const mergedCourses = [];
    program.courses.forEach(course => {
      const existingCourse = mergedCourses.find(c => c.id === course.id);
      if (existingCourse) {
        existingCourse.schedules.push(...course.schedules);
      } else {
        mergedCourses.push(course);
      }
    });
    program.courses = mergedCourses;
  });

  function getAssistantsForSchedule(jadwalId) {
    const assistants = takenSchedules
      .filter(item => item.jadwal_id === jadwalId)
      .map(item => item.user.nama);
    
    // Fill with "-" if less than 2 assistants
    while (assistants.length < 2) {
      assistants.push("-");
    }
    return assistants;
  }

  const toggleSemester = (semester) => {
    setOpenSemesters((prev) => ({ ...prev, [semester]: !prev[semester] }));
  };

  const isFull = (assistants) => assistants.filter(a => a !== "-").length >= 2;

  const handleTakeSchedule = async (schedule) => {
    try {
      await axios.post("http://localhost:8080/api/asisten-kelas", {
        jadwal_id: schedule.id
      });
      
      alert(`Berhasil mendaftar sebagai asisten untuk:\n${schedule.mata_kuliah.nama}\n${schedule.day} ${schedule.time}\nLab: ${schedule.lab}`);
      
      // Refresh data
      const response = await axios.get("http://localhost:8080/api/asisten-kelas");
      setTakenSchedules(response.data);
    } catch (err) {
      alert(`Gagal mendaftar: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarMenu />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data jadwal...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarMenu />
        <main className="flex-1 p-6 flex items-center justify-center">
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
    <div className="flex min-h-screen bg-gray-50">
      <SidebarMenu />
      <main className="flex-1 p-6">
        <AnimatePresence>
          {!selectedProgram ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-3xl mx-auto"
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Pilih Program Studi</h1>
              <p className="text-gray-600 mb-8">Silakan pilih program studi untuk melihat daftar mata kuliah</p>
              
              <div className="grid gap-6">
                {programs.map((program) => (
                  <motion.div
                    key={program.id}
                    whileHover={{ y: -5 }}
                    className={`bg-gradient-to-r ${program.color} text-white rounded-xl shadow-lg overflow-hidden cursor-pointer`}
                    onClick={() => setSelectedProgram(program)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-xl font-bold mb-2">{program.name}</h2>
                          <p className="text-sm opacity-90">{program.description}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-full">
                          <FiBook className="text-xl" />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          {program.courses.length} Mata Kuliah
                        </span>
                        <span className="text-xs opacity-90">
                          Semester {Math.min(...program.courses.map(c => c.semester))} - {Math.max(...program.courses.map(c => c.semester))}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : selectedCourse ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => setSelectedCourse(null)} 
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FiChevronLeft className="mr-1" /> Kembali
                </button>
                <h2 className="text-2xl font-bold ml-4 text-gray-800">{selectedCourse.name}</h2>
                <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {selectedCourse.code} • Semester {selectedCourse.semester}
                </span>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Jadwal Tersedia</h3>
                  <p className="text-sm text-gray-600">Pilih jadwal yang tersedia untuk mengambil mata kuliah ini</p>
                </div>

                <div className="divide-y divide-gray-200">
                  {selectedCourse.schedules.map((schedule) => (
                    <div key={schedule.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0">
                          <div className="flex items-center mb-2">
                            <FiCalendar className="text-blue-500 mr-2" />
                            <span className="font-medium text-gray-800">{schedule.day}, {schedule.time}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                              {schedule.lab}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                              Kelas {schedule.kelas}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-700">
                            <FiUser className="mr-2 text-gray-500" />
                            <span>{schedule.dosen}</span>
                          </div>
                          
                          <div className="text-sm">
                            <div className="flex items-center text-gray-700 mb-1">
                              <FiUsers className="mr-2 text-gray-500" />
                              <span>Asisten:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {schedule.assistants.map((assistant, i) => (
                                <span 
                                  key={i} 
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    assistant === "-" 
                                      ? "bg-gray-100 text-gray-500" 
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {assistant}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleTakeSchedule(schedule)}
                          disabled={isFull(schedule.assistants)}
                          className={`px-5 py-2 rounded-lg font-medium ${
                            isFull(schedule.assistants)
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          } transition-colors`}
                        >
                          {isFull(schedule.assistants) ? "Kuota Penuh" : "Daftar Sebagai Asisten"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => setSelectedProgram(null)} 
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FiChevronLeft className="mr-1" /> Kembali
                </button>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedProgram.name}</h2>
                  <p className="text-gray-600">{selectedProgram.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {Array.from(new Set(selectedProgram.courses.map(c => c.semester))).sort().map((semester) => {
                  const semesterCourses = selectedProgram.courses.filter((c) => c.semester === semester);
                  if (semesterCourses.length === 0) return null;

                  return (
                    <div key={semester} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                      <button
                        className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                        onClick={() => toggleSemester(semester)}
                      >
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-800">Semester {semester}</span>
                          <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {semesterCourses.length} Mata Kuliah
                          </span>
                        </div>
                        {openSemesters[semester] ? (
                          <FiChevronUp className="text-gray-500" />
                        ) : (
                          <FiChevronDown className="text-gray-500" />
                        )}
                      </button>

                      <AnimatePresence>
                        {openSemesters[semester] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-6 divide-y divide-gray-100"
                          >
                            {semesterCourses.map((course) => (
                              <div
                                key={course.id}
                                className="py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setSelectedCourse(course)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-gray-800">{course.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {course.code} • Semester {course.semester}
                                    </p>
                                  </div>
                                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                    S{semester}
                                  </span>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  {course.schedules.map((s) => (
                                    <div
                                      key={s.id}
                                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                                        isFull(s.assistants) ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      <FiClock className="mr-1" size={12} />
                                      {s.day} {s.time}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}