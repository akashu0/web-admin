import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const ProtectedRoute = () => {
    const customIsAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!customIsAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
