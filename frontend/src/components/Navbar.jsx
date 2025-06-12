import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

export default function Navbar({ toggleSidebar }) {
    
const [user, setUser] = useState({});

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
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-20 h-16 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        {/* Hamburger button for mobile */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo/Title */}
        <Link to="/home" className="text-xl font-bold text-blue-800 ml-4 md:ml-0">
          Forum Asisten
        </Link>

        {/* User profile/actions */}
        <div className="flex items-center space-x-4">
          <Link to="/profile" className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-medium">
          {user.nama?.[0] || "U"}
          </Link>
        </div>
      </div>
    </header>
  );
}