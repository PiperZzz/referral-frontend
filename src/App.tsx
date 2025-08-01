import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route 
          path="/" 
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-2xl text-blue-600">
                🎉 推荐系统前端运行成功！
              </div>
            </div>
          } 
        />
      </Routes>
    </div>
  );
};

export default App;
