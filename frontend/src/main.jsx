import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

// Layout
const Layout = lazy(() => import('./components/Layout'))

// Public Pages
const LoginPage = lazy(() => import('./pages/LoginPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const JadwalAsistenPage = lazy(() => import('./pages/JadwalAsistenPage'))
const MataKuliahPage = lazy(() => import('./pages/MataKuliahPage'))
const PresensiPage = lazy(() => import('./pages/PresensiPage'))
const RekapitulasiPage = lazy(() => import('./pages/RekapitulasiPage'))

// Admin Pages
const AdminHomePage = lazy(() => import('./pages/admin/AdminHomePage'))
const DataDosen = lazy(() => import('./pages/admin/DataDosen'))
const DataProdi = lazy(() => import('./pages/admin/DataProdi'))
const DataUser = lazy(() => import('./pages/admin/DataUser'))
const DataMataKuliah = lazy(() => import('./pages/admin/DataMataKuliah'))
const DataJadwal = lazy(() => import('./pages/admin/DataJadwal'))
const DataPlotingan = lazy(() => import('./pages/admin/DataPlotingan'))
const DataPresensi = lazy(() => import('./pages/admin/DataPresensi'))
const DataRekapitulasi = lazy(() => import('./pages/admin/DataRekapitulasi'))

// Error Component
const ErrorPage = lazy(() => import('./components/ErrorPage'))
const NotFoundPage = lazy(() => import('./components/NotFoundPage'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
    errorElement: <ErrorPage />
  },
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: <ErrorPage />
  },
  {
    element: <Layout />, // Gunakan satu layout untuk semua halaman
    errorElement: <ErrorPage />,
    children: [
      // Route User Biasa
      { path: '/home', element: <HomePage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/jadwal', element: <JadwalAsistenPage /> },
      { path: '/mata-kuliah', element: <MataKuliahPage /> },
      { path: '/presensi', element: <PresensiPage /> },
      { path: '/rekapitulasi', element: <RekapitulasiPage /> },
      
      // Route Admin (tetap gunakan prefix /admin untuk grouping)
      { path: '/admin/home', element: <AdminHomePage /> },
      { path: '/admin/data-dosen', element: <DataDosen /> },
      { path: '/admin/data-prodi', element: <DataProdi /> },
      { path: '/admin/data-user', element: <DataUser /> },
      { path: '/admin/data-matkul', element: <DataMataKuliah /> },
      { path: '/admin/data-jadwal', element: <DataJadwal /> },
      { path: '/admin/data-plotingan', element: <DataPlotingan /> },
      { path: '/admin/data-presensi', element: <DataPresensi /> },
      { path: '/admin/data-rekapitulasi', element: <DataRekapitulasi /> }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<div className="loading-spinner">Memuat...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
)