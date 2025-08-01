import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// 简单的测试组件
const Login = () => (
  <div className="min-h-screen flex items-center justify-center bg-blue-50">
    <div className="text-2xl text-blue-600">
      🔐 登录页面 - 路由工作正常！
    </div>
  </div>
);

const Register = () => (
  <div className="min-h-screen flex items-center justify-center bg-green-50">
    <div className="text-2xl text-green-600">
      📝 注册页面 - 路由工作正常！
    </div>
  </div>
);

const Dashboard = () => (
  <div className="min-h-screen flex items-center justify-center bg-purple-50">
    <div className="text-2xl text-purple-600">
      🎉 Dashboard页面 - 路由工作正常！
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;
