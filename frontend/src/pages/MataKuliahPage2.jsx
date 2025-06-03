import { motion } from "framer-motion";
import { FiBook, FiChevronLeft } from "react-icons/fi";

export default function ProgramSelectionView({ programs, setSelectedProgram }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto"
    >
      <div className="flex items-center mb-6">
        <div className="ml-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pilih Program Studi</h1>
          <p className="text-gray-600">Silakan pilih program studi untuk melihat daftar mata kuliah</p>
        </div>
      </div>
      
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
  );
}