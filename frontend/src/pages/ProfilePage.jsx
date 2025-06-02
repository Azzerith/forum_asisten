import React, { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser(payload);
      } catch (err) {
        console.error("Token tidak valid", err);
      }
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Profil Pengguna</h1>
      <div className="bg-white shadow p-4 rounded">
        <p><strong>Nama:</strong> {user.nama || "-"}</p>
        <p><strong>Email:</strong> {user.email || "-"}</p>
        <p><strong>NIM:</strong> {user.nim || "-"}</p>
      </div>
    </div>
  );
}
