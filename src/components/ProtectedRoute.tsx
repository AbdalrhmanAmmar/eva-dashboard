// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuthStore } from '../store/authStore';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   requiredRole?: string;
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
//   children, 
//   requiredRole 
// }) => {
//   const { isAuthenticated, user } = useAuthStore();
//   const location = useLocation();

//   if (!isAuthenticated) {
//     // Redirect to login page with return url
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   // Check role if required
//   if (requiredRole && user?.role !== requiredRole) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;