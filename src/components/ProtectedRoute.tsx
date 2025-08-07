import { Navigate } from 'react-router-dom';
import { auth, Role } from '@/hooks/useAuth';

export function ProtectedRoute({ children, requiredRole }: { children: JSX.Element; requiredRole?: Role }) {
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && !auth.hasRole(requiredRole)) {
    return <Navigate to="/app" replace />;
  }
  return children;
}
