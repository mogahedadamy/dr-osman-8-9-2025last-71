import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requirePremium?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false, requirePremium = false }: ProtectedRouteProps) => {
  const { currentUser, isLoading, isAuthenticated, isAdmin, isPremium } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute check:', {
      currentUser: currentUser?.username,
      isAuthenticated,
      isAdmin: isAdmin(),
      isPremium: isPremium(),
      requireAdmin,
      requirePremium
    });
  }, [currentUser, isAuthenticated, requireAdmin, requirePremium]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // إذا كان المطلوب صلاحية المدير
  if (requireAdmin) {
    if (!currentUser || !isAdmin()) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  // إذا كان المطلوب اشتراك مدفوع
  if (requirePremium) {
    if (!currentUser || (!isPremium() && !isAdmin())) {
      return <Navigate to="/premium-access" state={{ from: location }} replace />;
    }
  }

  // إذا كان المطلوب تسجيل دخول عادي
  if (!requireAdmin && !requirePremium && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;