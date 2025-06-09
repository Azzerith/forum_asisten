import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import MataKuliahPage from './pages/MataKuliahPage'
import ProfilePage from './pages/ProfilePage'
import JadwalAsistenPage from './pages/JadwalAsistenPage'
import RekapitulasiPage from './pages/RekapitulasiPage'
import PresensiPage from './pages/PresensiPage'
import AdminHomePage from './pages/admin/AdminHomePage'
import DataDosen from './pages/admin/DataDosen'
import DataProdi from './pages/admin/DataProdi'
import DataUser from './pages/admin/DataUser'
import DataMataKuliah from './pages/admin/DataMataKuliah'
import DataJadwal from './pages/admin/DataJadwal'
import DataPlotingan from './pages/admin/DataPlotingan'

const router = createBrowserRouter([
  { path: '/', element: <LoginPage /> },
  { path: '/home', element: <HomePage /> },
  {path: '/profile', element: <ProfilePage /> },
  {path: '/jadwal', element: <JadwalAsistenPage /> },
  { path: '/mata-kuliah', element: <MataKuliahPage /> },
  { path: '/presensi', element: <PresensiPage /> },
  {path:'/rekapitulasi',element:<RekapitulasiPage/>},

  {path:'/admin/home', element:<AdminHomePage/>},
  {path:'/admin/data-dosen', element:<DataDosen/>},
  {path:'/admin/data-prodi',element:<DataProdi/>},
  {path:'/admin/data-user',element:<DataUser/>},
  {path:'/admin/data-matkul',element:<DataMataKuliah/>},
  {path:'/admin/data-jadwal', element:<DataJadwal/>},
  {path:'/admin/data-plotingan', element:<DataPlotingan/>},
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
