import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarMenu from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import ProgramSelectionView from "./MataKuliahPage2";
import { ProgramCoursesView, CourseDetailView } from "./MataKuliahPage3";

export default function MataKuliahPage() {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openSemesters, setOpenSemesters] = useState({});
  const [schedules, setSchedules] = useState([]);
  const [takenSchedules, setTakenSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Get user from localStorage or token
  useEffect(() => {
    const loadUser = () => {
      setIsUserLoading(true);
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          return;
        }

        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser(payload);
          localStorage.setItem('user', JSON.stringify(payload));
        }
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setIsUserLoading(false);
      }
    };

    loadUser();
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const [schedulesRes, takenRes] = await Promise.all([
          axios.get("http://localhost:8080/api/jadwal", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }),
          axios.get("http://localhost:8080/api/asisten-kelas", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          })
        ]);

        setSchedules(schedulesRes.data);
        setTakenSchedules(takenRes.data);
        console.log("Data loaded:", {
          schedules: schedulesRes.data,
          takenSchedules: takenRes.data
        });
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleCancelSchedule = async (scheduleId) => {
    try {
      // Find the assignment record
      const asistenKelas = takenSchedules.find(item => 
        item.jadwal.id === scheduleId &&  // Note: changed from jadwal_id to jadwal.id
        item.user.id === user?.id
      );
  
      if (!asistenKelas) {
        console.error("Assignment not found:", {
          scheduleId,
          userId: user?.id,
          takenSchedules
        });
        alert("Data tidak ditemukan");
        return;
      }
  
      // Construct proper URL
      await axios.delete(
        `http://localhost:8080/api/asisten-kelas/${asistenKelas.jadwal.id}/${asistenKelas.user.id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
  
      // Refresh data
      const takenRes = await axios.get("http://localhost:8080/api/asisten-kelas", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setTakenSchedules(takenRes.data);
      alert("Berhasil dibatalkan");
    } catch (err) {
      console.error("Cancel error:", err.response?.data || err);
      alert(`Gagal: ${err.response?.data?.error || err.message}`);
    }
  };

  if (isUserLoading) {
    return <div>Loading user data...</div>;
  }

  if (!user?.id) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">User tidak terdeteksi</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Refresh
        </button>
      </div>
    );
  }


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
      .map(item => item.user?.nama || "-");
    
    // Pastikan selalu ada 2 asisten
    while (assistants.length < 2) {
      assistants.push("-");
    }
    
    return assistants;
  }

  const toggleSemester = (semester) => {
    setOpenSemesters((prev) => ({ ...prev, [semester]: !prev[semester] }));
  };

  const isFull = (assistants) => assistants.filter(a => a !== "-").length >= 2;

  const isUserAssistant = (jadwalId, userId) => {
    return takenSchedules.some(item => 
      item.jadwal?.id === jadwalId &&  // Pastikan struktur ini sesuai dengan respons API
      item.user?.id === userId
    );
  };
  

  const handleTakeSchedule = async (schedule) => {
    if (!user) {
      alert("Anda harus login terlebih dahulu");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/asisten-kelas",
        {
          jadwal_id: schedule.id,
          user_id: user.id
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      
      alert(`Berhasil mendaftar sebagai asisten untuk:\n${selectedCourse.name}\n${schedule.day} ${schedule.time}\nLab: ${schedule.lab}`);
      
      // Refresh data
      const response = await axios.get("http://localhost:8080/api/asisten-kelas", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setTakenSchedules(response.data);
    } catch (err) {
      alert(`Gagal mendaftar: ${err.response?.data?.message || err.message}`);
    }
  };

  

  if (loading) {
    return (
      <div className="flex min-h-screen min-w-screen bg-gray-50">
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
      <div className="flex min-h-screen min-w-screen bg-gray-50">
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
    <div className="flex min-h-screen min-w-screen bg-gray-50">
      <SidebarMenu />
      <main className="flex-1 p-6">
        <AnimatePresence>
          {!selectedProgram ? (
            <ProgramSelectionView 
              programs={programs} 
              setSelectedProgram={setSelectedProgram} 
            />
          ) : selectedCourse ? (
            <CourseDetailView 
  selectedCourse={selectedCourse}
  setSelectedCourse={setSelectedCourse}
  takenSchedules={takenSchedules}
  user={user}
  handleTakeSchedule={handleTakeSchedule}
  handleCancelSchedule={handleCancelSchedule}
  isFull={isFull}
/>
          ) : (
            <ProgramCoursesView
              selectedProgram={selectedProgram}
              setSelectedProgram={setSelectedProgram}
              setSelectedCourse={setSelectedCourse}
              openSemesters={openSemesters}
              toggleSemester={toggleSemester}
              isFull={isFull}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}