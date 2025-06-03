import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 768);
  const [user, setUser] = useState({});
  const [activeLink, setActiveLink] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    }

    const handleResize = () => setIsOpen(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 }
  };

  const linkVariants = {
    hover: { 
      scale: 1.02,
      backgroundColor: "rgba(79, 70, 229, 0.5)",
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <>
      <motion.button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        ☰
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside 
            className="w-64 bg-gradient-to-b from-blue-700 to-indigo-900 text-white p-4 flex flex-col justify-between h-screen fixed md:static z-40 shadow-xl"
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div>
              <motion.div 
                className="text-2xl font-bold mb-8 pt-4 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Forum Asisten
              </motion.div>
              
              <nav className="space-y-3">
                {[
                  { path: "/home", name: "Home", icon: "🏠" },
                  { path: "/mata-kuliah", name: "Mata Kuliah", icon: "📚" },
                  { path: "/presensi", name: "Presensi", icon: "📝" },
                  { path: "/rekapitulasi", name: "Rekapitulasi", icon: "📊" },
                  { path: "/jadwal", name: "Jadwal Asisten", icon: "⏰" }
                ].map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Link 
                      to={item.path}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${activeLink === item.name ? "bg-indigo-600" : "hover:bg-indigo-700"}`}
                      onClick={() => setActiveLink(item.name)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Link 
                to="/" 
                className="flex items-center gap-3 p-3 text-red-300 hover:bg-red-700 hover:text-white rounded-lg transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </Link>

              <Link 
                to="/profile" 
                className="flex items-center gap-3 mt-4 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
              >
                <div className="w-10 h-10 bg-white text-blue-900 font-bold rounded-full flex items-center justify-center uppercase shadow-md">
                  {user.nama?.[0] || "U"}
                </div>
                <div className="text-sm">
                  <p className="font-semibold">{user.nama || "User"}</p>
                  <p className="text-xs opacity-80">{user.nim || "NIM"}</p>
                </div>
              </Link>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}