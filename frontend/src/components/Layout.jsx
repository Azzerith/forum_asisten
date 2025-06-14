import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
    
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isAdmin = userRole === 'admin';

  return (
    <div className="flex min-h-screen min-w-screen bg-gray-50">
      {isAdmin ? (
        <AdminSidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen}
          className="fixed md:static z-20"
        />
      ) : (
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
          className="fixed md:static z-20"
        />
      )}
      
      <div className="flex-1 flex flex-col">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden mt-10">
          {children}
        </main>
      </div>
    </div>
  );
}