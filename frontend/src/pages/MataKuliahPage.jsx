// src/pages/MataKuliahPage.jsx
import React from "react";
import SidebarMenu from "../components/Sidebar";

export default function MataKuliahPage() {
  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      <div className="p-4 text-lg text-gray-800">
        <h1>Daftar Program Studi</h1>
        <ul className="list-disc pl-6 mt-4">
          <li>Informatika</li>
          <li>Sistem Informasi</li>
        </ul>
      </div>
    </div>
  );
}
