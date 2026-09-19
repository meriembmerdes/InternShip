import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: Array<'ADMIN' | 'STUDENT' | 'SUPERVISOR' | 'COMPANY'>;
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
const { isAuthenticated, user, isLoading } = useAuth();
const location = useLocation();

if (isLoading) {
    return <div className="page-shell centered">Chargement de la session…</div>;
}

if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
}

if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
}

return <Outlet />;
}
