import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Buat hook useAuth untuk manajemen state auth

export default function PrivateRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
}