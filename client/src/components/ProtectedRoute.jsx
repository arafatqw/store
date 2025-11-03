import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, permission, role }) {
  const { user, loading, hasPermission, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">ليس لديك صلاحية للوصول</h2>
          <p className="text-gray-600">تحتاج صلاحية: {permission}</p>
        </div>
      </div>
    );
  }

  if (role && !hasRole(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">ليس لديك صلاحية للوصول</h2>
          <p className="text-gray-600">تحتاج دور: {role}</p>
        </div>
      </div>
    );
  }

  return children;
}

