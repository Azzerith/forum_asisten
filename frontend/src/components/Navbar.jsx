import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiBell, FiMessageSquare } from "react-icons/fi";
import { getPageTitle } from "../utils/pageTitles";

export function Navbar({ toggleSidebar }) {
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
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-medium hover:bg-blue-200 transition-colors">
                    {user.nama?.[0] || (isAdmin ? "A" : "U")}
                  </div>)}
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