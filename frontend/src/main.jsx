import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import MataKuliahPage from './pages/MataKuliahPage'
import MataKuliahDetailPage from './pages/MataKuliahDetailPage'

const router = createBrowserRouter([
  { path: '/', element: <LoginPage /> },
  { path: '/home', element: <HomePage /> },
  { path: '/mata-kuliah', element: <MataKuliahPage /> },
  { path: '/mata-kuliah/:programStudi', element: <MataKuliahDetailPage /> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
