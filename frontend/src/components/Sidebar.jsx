import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/Logo-FA.png";
import {  
  FiX, 
  FiHome, 
  FiBook, 
  FiCheckCircle, 
  FiClock, 
  FiCalendar,
  FiLogOut,
  FiUser,
} from "react-icons/fi";


export function Sidebar({ isOpen, setIsOpen }) {
  const [user, setUser] = useState({});
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          nama: parsedUser.nama || "User",
          nim: parsedUser.nim || "NIM",
          photo: parsedUser.photo || null,
          role: parsedUser.role || "asisten",
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setUser({
              nama: payload.nama || "User",
              nim: payload.nim || "NIM",
              photo: payload.photo || null,
              role: payload.role || "asisten",
            });
          } catch (tokenError) {
            console.error("Error parsing token:", tokenError);
          }
        }
      }
    } else if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          nama: payload.nama || "User",
          nim: payload.nim || "NIM",
          photo: payload.photo || null,
          role: payload.role || "asisten",
        });
      } catch (error) {
        console.error("Error parsing token:", error);
      }
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
                <img
                    src={logo}
                    alt="logo"
                    className="mx-auto w-20 h-20 object-contain drop-shadow-md rounded-full p-1"
                  />
                  <div className="text-l font-bold text-white">
                    E-presensi <br/>Forum Asisten
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
                  <div className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center shadow-md overflow-hidden bg-white">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt={user?.nama ? `Foto profil ${user.nama}` : "Foto profil"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  
                  {(!user?.photo || (user?.photo && !document.querySelector(`img[src="${user.photo}"]`))) && (
                    <div 
                      className="w-full h-full flex items-center justify-center text-blue-900 font-bold"
                      aria-label={user?.nama || "Profile"}
                    >
                      {user?.nama?.[0]?.toUpperCase() || <FiUser className="h-5 w-5" />}
                    </div>
                  )}
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