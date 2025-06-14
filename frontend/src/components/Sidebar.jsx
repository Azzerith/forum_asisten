import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {  
  FiX, 
  FiHome, 
  FiBook, 
  FiCheckCircle, 
  FiClock, 
  FiCalendar,
  FiLogOut,
} from "react-icons/fi";


export function Sidebar({ isOpen, setIsOpen }) {
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
    { path: "/home", name: "Home", icon: <FiHome className="h-5 w-5" /> },
    { path: "/mata-kuliah", name: "Mata Kuliah", icon: <FiBook className="h-5 w-5" /> },
    { path: "/presensi", name: "Presensi", icon: <FiCheckCircle className="h-5 w-5" /> },
    { path: "/rekapitulasi", name: "Rekapitulasi", icon: <FiClock className="h-5 w-5" /> },
    { path: "/jadwal", name: "Jadwal Asisten", icon: <FiCalendar className="h-5 w-5" /> }
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay for mobile */}
            <motion.div
              className="fixed inset-0 bg-opacity-50 z-40 md:hidden"
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
                  <div className="text-2xl font-bold text-white">
                    Forum Asisten
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
                  to="/profile" 
                  className={`flex items-center gap-3 mt-4 p-3 rounded-lg transition-all ${
                    location.pathname === "/profile" 
                      ? "bg-white/20 font-medium" 
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  <div className="w-10 h-10 bg-white text-blue-900 font-bold rounded-full flex items-center justify-center uppercase shadow-md">
                    {user.nama?.[0] || "U"}
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold">{user.nama || "User"}</p>
                    <p className="text-xs opacity-80">{user.nim || "NIM"}</p>
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