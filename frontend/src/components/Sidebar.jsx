import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-blue-700 to-indigo-800 text-white p-4 space-y-6">
      <div className="text-xl font-bold">Menu</div>
      <nav className="space-y-2">
        <Link to="/mata-kuliah" className="block hover:bg-indigo-700 p-2 rounded">
          Mata Kuliah
        </Link>
        <Link to="#" className="block hover:bg-indigo-700 p-2 rounded">
          Presensi
        </Link>
        <Link to="#" className="block hover:bg-indigo-700 p-2 rounded">
          Rekapitulasi
        </Link>
        <Link to="#" className="block hover:bg-indigo-700 p-2 rounded">
          Jadwal Asisten
        </Link>
        <Link to="/" className="block text-red-300 hover:bg-red-700 hover:text-white p-2 rounded">
          Logout
        </Link>
      </nav>
    </aside>
  );
}