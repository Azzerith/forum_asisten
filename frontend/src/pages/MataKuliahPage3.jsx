import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronDown, FiChevronUp, FiClock, FiUser, FiUsers, FiCalendar } from "react-icons/fi";

export function ProgramCoursesView({
  selectedProgram,
  setSelectedProgram,
  setSelectedCourse,
  openSemesters,
  toggleSemester,
  isFull
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center mb-6">
        <button 
          onClick={() => setSelectedProgram(null)} 
          className="flex items-center text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <FiChevronLeft className="text-2xl" />
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
                  <span className="font-semibold text-white">Semester {semester}</span>
                  <span className="ml-3 px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
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
  );
}

export function CourseDetailView({
  selectedCourse,
  setSelectedCourse,
  takenSchedules,
  user,
  handleTakeSchedule,
  handleCancelSchedule, 
  isFull
}) {
  return (
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
          <FiChevronLeft className="mr-1" />
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
        {selectedCourse.schedules.map((schedule) => {
        // Debugging
        // console.log("Checking schedule:", schedule.id);
        
        const isCurrentUserAssistant = takenSchedules.some(
          item => item.jadwal_id === schedule.id && item.user?.id === user?.id
        );
        
        // console.log("Current user assistants:", currentUserAssistants);


            return (
              <div key={schedule.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <FiCalendar className="text-blue-500 mr-2" />
                      <span className="font-medium text-gray-800">{schedule.day}, {schedule.time}</span>
                      {isCurrentUserAssistant && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          Anda terdaftar
                        </span>
                      )}
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

                <div className="mt-4 flex justify-end gap-2">
                  {isCurrentUserAssistant ? (
                    <div className="flex gap-2">
                      <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium flex items-center">
                        <FiCheck className="mr-1" /> Terdaftar
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm('Apakah Anda yakin ingin membatalkan pendaftaran ini?')) {
                            handleCancelSchedule(schedule.id);
                          }
                        }}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium flex items-center transition-colors"
                      >
                        <FiX className="mr-1" /> Batalkan
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleTakeSchedule(schedule)}
                      disabled={isFull(schedule.assistants) || !user}
                      className={`px-5 py-2 rounded-lg font-medium ${
                        isFull(schedule.assistants)
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : !user
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      } transition-colors`}
                    >
                      {isFull(schedule.assistants) 
                        ? "Kuota Penuh" 
                        : !user
                        ? "Login untuk Mendaftar"
                        : "Daftar Sebagai Asisten"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}