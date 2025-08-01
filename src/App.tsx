import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

const Dashboard = () => (
  <div className="min-h-screen flex items-center justify-center bg-purple-50">
    <div className="text-2xl text-purple-600">
      🎉 登录成功！欢迎使用推荐系统
      <div className="text-sm mt-4 text-gray-600">
        这里将来会显示用户Dashboard
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;
