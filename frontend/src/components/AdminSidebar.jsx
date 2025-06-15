// AdminSidebar.js
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiHome, 
  FiUsers, 
  FiUser, 
  FiBook, 
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiLogOut,
  FiX,
  FiMenu
} from "react-icons/fi";

export function AdminSidebar({ isOpen, setIsOpen }) {
  const [user, setUser] = useState({});
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    }
  }, []);

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" }
  };

  const navItems = [
    { path: "/admin/home", name: "Dashboard", icon: <FiHome className="h-5 w-5" /> },
    { path: "/admin/data-user", name: "Data User", icon: <FiUsers className="h-5 w-5" /> },
    { path: "/admin/data-dosen", name: "Data Dosen", icon: <FiUser className="h-5 w-5" /> },
    { path: "/admin/data-prodi", name: "Data Prodi", icon: <FiBook className="h-5 w-5" /> },
    { path: "/admin/data-matkul", name: "Data Mata Kuliah", icon: <FiBook className="h-5 w-5" /> },
    { path: "/admin/data-jadwal", name: "Data Jadwal", icon: <FiCalendar className="h-5 w-5" /> },
    { path: "/admin/data-plotingan", name: "Data Plotingan", icon: <FiCheckCircle className="h-5 w-5" /> },
    { path: "/admin/data-presensi", name: "Data Presensi", icon: <FiCheckCircle className="h-5 w-5" /> },
    { path: "/admin/data-rekapitulasi", name: "Data Rekapitulasi", icon: <FiClock className="h-5 w-5" /> }
  ];

  return (
    <>
      {/* Mobile Toggle Button (when sidebar is closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="fixed top-6 left-6 z-30 cursor-pointer md:hidden"
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <FiMenu className="h-8 w-8 text-blue-600 hover:text-blue-800" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay for mobile */}
            <motion.div
              className="fixed inset-0  bg-opacity-30 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            
            {/* Sidebar */}
            <motion.aside 
              className="w-64 bg-gradient-to-b from-blue-700 to-indigo-900 text-white p-4 flex flex-col justify-between h-screen fixed md:static z-50 shadow-xl"
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div>
                {/* Sidebar Header */}
                <div className="flex justify-between items-center mb-8 pt-4">
                  <div className="text-2xl font-bold flex items-center gap-2 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin Panel
                  </div>
                  
                  {/* Close Button - Mobile only */}
                  <button
                    className="md:hidden text-white hover:text-gray-200"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <Link 
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        location.pathname === item.path 
                          ? "bg-indigo-600 font-medium" 
                          : "hover:bg-indigo-700"
                      }`}
                      onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Bottom Section */}
              <div className="mt-6">
                <Link 
                  to="/" 
                  className="flex items-center gap-3 p-3 text-white hover:bg-red-700 rounded-lg transition-all"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Link>

                <Link 
                  to="/admin/home" 
                  className={`flex items-center gap-3 mt-4 p-3 rounded-lg transition-all ${
                    location.pathname === "/admin/home" 
                      ? "bg-white/20 font-medium" 
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  <div className="w-10 h-10 bg-white text-blue-900 font-bold rounded-full flex items-center justify-center uppercase shadow-md">
                    {user.nama?.[0] || "A"}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold">{user.nama || "Admin"}</p>
                    <p className="text-xs opacity-80">Administrator</p>
                  </div>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}