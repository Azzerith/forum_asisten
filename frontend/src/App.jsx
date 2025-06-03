// App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import LoginPage from "./pages/LoginPage";
// import HomePage from "./pages/HomePage";
// import ProfilePage from "./pages/ProfilePage";
// import JadwalPage from "./pages/JadwalPage";
// import NotFoundPage from "./pages/NotFoundPage";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <LoginPage />,
//     errorElement: <NotFoundPage />,
//   },
//   {
//     path: "/home",
//     element: <HomePage />,
//     errorElement: <NotFoundPage />,
//   },
//   {
//     path: '/jadwal-saya',
//     element: <JadwalAsistenPage />,
//     errorElement: <NotFoundPage />,
//   },
//   {
//     path: "/profile",
//     element: <ProfilePage />,
//     errorElement: <NotFoundPage />,
//   },
//   {
//     path: "/jadwal",
//     element: <JadwalPage />,
//     errorElement: <NotFoundPage />,
//   },
// ]);

export default function App() {
  return <RouterProvider router={router} />;
}

    // <BrowserRouter>
    //   <Routes>
    //     {/* Public Routes */}
    //     <Route path="/login" element={<LoginPage />} />
        
    //     {/* Protected Routes */}
    //     <Route element={<PrivateRoute allowedRoles={['asisten']} />}>
    //       <Route path="/mata-kuliah" element={<MataKuliahPage />} />
    //       <Route path="/jadwal-saya" element={<JadwalAsistenPage />} />
    //     </Route>
        
    //     {/* Redirects */}
    //     <Route path="/" element={<Navigate to="/login" />} />
    //     <Route path="*" element={<NotFoundPage />} />
    //   </Routes>
    // </BrowserRouter>
