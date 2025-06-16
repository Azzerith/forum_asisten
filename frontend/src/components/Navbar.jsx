import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiBell, FiMessageSquare } from "react-icons/fi";
import { getPageTitle } from "../utils/pageTitles";

export function Navbar({ toggleSidebar }) {
  const [user, setUser] = useState({});
  const location = useLocation();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          nama: payload.nama,
          role: payload.role,
          nim: payload.nim
        });
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
  }, []);

  const isAdmin = user.role === 'admin';
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-sm z-30 h-16 flex items-center px-4 md:px-6">
      <div className="flex items-center justify-between w-full">
        {/* Sidebar Toggle and Page Title */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md text-white hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <FiMenu className="h-6 w-6" />
          </button>
          
          <h1 className="text-xl font-semibold text-white md:ml-50">
            {pageTitle}
          </h1>
        </div>

        <div className="text-white flex items-center gap-4">        
          <Link 
            to={isAdmin ? "/admin/home" : "/profile"} 
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-medium hover:bg-blue-200 transition-colors">
              {user.nama?.[0] || (isAdmin ? "A" : "U")}
            </div>
            <span className="hidden md:inline text-sm font-medium">
              {user.nama || (isAdmin ? "Admin" : "User")}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}