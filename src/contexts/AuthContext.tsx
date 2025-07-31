import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, LoginResponseData } from '../services/api';
import { message } from 'antd';

interface User {
  id: number;
  email: string;
  wechatId?: string;
  status: string;
  roles: string[];
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  primaryRole: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: {
    email: string;
    password: string;
    wechatId?: string;
    referrerWechatId?: string;
  }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [primaryRole, setPrimaryRole] = useState<string | null>(localStorage.getItem('primaryRole'));
  const [isLoading, setIsLoading] = useState(true);

  // 检查用户认证状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (token) {
        try {
          const response = await authAPI.checkStatus();
          if (response.success && response.user) {
            setUser(response.user);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // 清除无效的token
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('primaryRole');
          setToken(null);
          setPrimaryRole(null);
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });
      
      if (response.success && response.data) {
        const { token: authToken, user: userData, primaryRole: userRole } = response.data as LoginResponseData;
        
        // 保存到localStorage
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        localStorage.setItem('primaryRole', userRole);
        
        // 更新状态
        setToken(authToken);
        setUser(userData);
        setPrimaryRole(userRole);
        
        message.success('登录成功！');
        return true;
      } else {
        message.error(response.message || '登录失败');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '登录失败，请检查网络连接';
      message.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    wechatId?: string;
    referrerWechatId?: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.success) {
        message.success(response.message || '注册成功！请等待管理员激活账号。');
        return true;
      } else {
        message.error(response.message || '注册失败');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '注册失败，请检查网络连接';
      message.error(errorMessage);
      
      // 处理验证错误
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.values(errors).forEach((msg) => {
          message.error(msg as string);
        });
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 清除本地存储
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('primaryRole');
      
      // 重置状态
      setToken(null);
      setUser(null);
      setPrimaryRole(null);
      
      message.success('已退出登录');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    primaryRole,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};