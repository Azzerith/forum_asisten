import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import MataKuliahPage from './pages/MataKuliahPage'
import MataKuliahDetailPage from './pages/MataKuliahDetailPage'
import ProfilePage from './pages/ProfilePage'
import JadwalAsistenPage from './pages/JadwalAsistenPage'
import RekapitulasiPage from './pages/RekapitulasiPage'

const router = createBrowserRouter([
  { path: '/', element: <LoginPage /> },
  { path: '/home', element: <HomePage /> },
  {path: '/profile', element: <ProfilePage /> },
  {path: '/jadwal', element: <JadwalAsistenPage /> },
  { path: '/mata-kuliah', element: <MataKuliahPage /> },
  {path:'/rekapitulasi',element:<RekapitulasiPage/>},
  { path: '/mata-kuliah/:programStudi', element: <MataKuliahDetailPage /> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
