// src/pages/MataKuliahDetailPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import SidebarMenu from "../components/Sidebar";

export default function MataKuliahDetailPage() {
  const { programStudi } = useParams();
  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">Mata Kuliah - {programStudi}</h2>
        <p>Daftar semester dan mata kuliah akan ditampilkan di sini.</p>
      </div>
    </div>
  );
}
