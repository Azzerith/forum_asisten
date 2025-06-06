import React, { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { motion } from "framer-motion";

export default function DataDosen() {
  const [dosen, setDosen] = useState([
    { id: 1, nama: "Dr. Ahmad Fauzi, M.Kom", nip: "198012312345678901", email: "afauzi@univ.ac.id", prodi: "Informatika" },
    { id: 2, nama: "Prof. Budi Raharjo, Ph.D", nip: "197511212345678902", email: "braharjo@univ.ac.id", prodi: "Sistem Informasi" },
    { id: 3, nama: "Dewi Lestari, M.Sc", nip: "198512312345678903", email: "dlestari@univ.ac.id", prodi: "Teknik Komputer" }
  ]);

  return (
    <div className="flex min-h-screen min-w-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <motion.h1 
          className="text-3xl font-bold text-blue-900 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Data Dosen
        </motion.h1>
        
        <motion.div 
          className="bg-white p-6 rounded-xl shadow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Daftar Dosen Pengampu</h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambah Dosen
            </button>
          </div>

          <div className="space-y-4">
            {dosen.map((dsn) => (
              <div key={dsn.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{dsn.nama}</h3>
                    <p className="text-sm text-gray-600">NIP: {dsn.nip}</p>
                    <p className="text-sm text-gray-600">Prodi: {dsn.prodi}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="text-red-600 hover:text-red-800 p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center text-sm text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {dsn.email}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}