import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import ForgetPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import Help from './pages/Help';
import './App.css';

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles = ['USER', 'ADMIN', 'MASTER'] 
}) => {
  const { isAuthenticated, primaryRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (primaryRole && !allowedRoles.includes(primaryRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// 角色重定向组件
const RoleBasedRedirect: React.FC = () => {
  const { primaryRole, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 根据角色重定向到相应页面
  switch (primaryRole) {
    case 'MASTER':
      return <Navigate to="/master/dashboard" replace />;
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'USER':
    default:
      return <Navigate to="/user/profile" replace />;
  }
};

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* 公共路由 */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <RoleBasedRedirect /> : <Login />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <RoleBasedRedirect /> : <Register />
          } 
        />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/help" element={<Help />} />

        {/* 用户路由 */}
        <Route 
          path="/user/profile" 
          element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN', 'MASTER']}>
              <UserProfile />
            </ProtectedRoute>
          } 
        />

        {/* 管理员路由 - 暂时用UserProfile作为占位符 */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MASTER']}>
              <UserProfile /> {/* 后续会创建AdminDashboard组件 */}
            </ProtectedRoute>
          } 
        />

        {/* Master路由 - 暂时用UserProfile作为占位符 */}
        <Route 
          path="/master/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['MASTER']}>
              <UserProfile /> {/* 后续会创建MasterDashboard组件 */}
            </ProtectedRoute>
          } 
        />

        {/* 兼容性路由 */}
        <Route 
          path="/dashboard" 
          element={<RoleBasedRedirect />}
        />

        {/* 根路由重定向 */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <RoleBasedRedirect /> : <Navigate to="/login" replace />
          } 
        />

        {/* 未授权页面 */}
        <Route 
          path="/unauthorized" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized</h1>
                <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Go to Home
                </button>
              </div>
            </div>
          } 
        />

        {/* 404页面 */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
                <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Go to Home
                </button>
              </div>
            </div>
          } 
        />
      </Routes>
    </div>
  );
};

export default App;