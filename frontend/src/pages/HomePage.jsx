import React from "react";
import SidebarMenu from "../components/Sidebar";

export default function HomePage() {
  return (
    <div className="flex min-h-screen">
      <SidebarMenu />
      <main className="flex-1 bg-white p-6">
        <h1 className="text-xl font-bold text-blue-900 mb-4">Home</h1>
        <section className="space-y-4">
          <div className="bg-blue-700 text-white p-4 rounded shadow">
            <h2 className="font-semibold">Ada Jadwal Asisten!</h2>
            <p className="text-sm">Pengantar Ilmu Komputer</p>
          </div>
          <div className="bg-blue-700 text-white p-4 rounded shadow">
            <h2 className="font-semibold">Pengumuman!</h2>
            <p className="text-sm">
              Diberitahukan kepada seluruh asisten mata kuliah Pemrograman...
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
