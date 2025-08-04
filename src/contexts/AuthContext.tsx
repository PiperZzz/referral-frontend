import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, LoginResponseData, UserRegistrationData } from '../services/api';
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
  register: (userData: UserRegistrationData) => Promise<boolean>;
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
          console.log('🔍 Checking authentication status...');
          const response = await authAPI.checkStatus();
          
          if (response.success && response.user) {
            console.log('✅ Authentication status valid:', response.user);
            setUser(response.user);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('❌ Authentication status check failed:', error);
          // Clear invalid token
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
      console.log('🔐 Attempting login:', email);
      
      const response = await authAPI.login({ email, password });
      console.log('📡 Login API response:', response);
      
      if (response.success && response.data) {
        const loginData = response.data as LoginResponseData;
        const { token: authToken, user: userData, primaryRole: userRole } = loginData;
        
        console.log('✅ Login successful:', { userData, userRole });
        
        // 保存到localStorage
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        localStorage.setItem('primaryRole', userRole);
        
        // 更新状态
        setToken(authToken);
        setUser(userData);
        setPrimaryRole(userRole);
        
        message.success('Login successful!');
        return true;
      } else {
        console.warn('⚠️ Login failed:', response.message);
        message.error(response.message || 'Login failed');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // 处理后端API的错误响应格式
      let errorMessage = 'Login failed, please check your network connection';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // 如果后端返回了具体的错误消息
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // 如果有验证错误
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0] as string;
          errorMessage = firstError || errorMessage;
        }
        
        // 处理特定的HTTP状态码
        switch (error.response.status) {
          case 401:
            errorMessage = 'Invalid email or password';
            break;
          case 403:
            errorMessage = 'Account is not activated or is disabled';
            break;
          case 500:
            errorMessage = 'Server error, please try again later';
            break;
        }
      }
      
      message.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: UserRegistrationData): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('📝 Attempting registration:', userData.email);
      
      const response = await authAPI.register(userData);
      console.log('📡 Registration API response:', response);
      
      if (response.success) {
        message.success(response.message || 'Registration successful! Please wait for administrator to activate your account.');
        return true;
      } else {
        message.error(response.message || 'Registration failed');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      // 处理注册错误
      let errorMessage = 'Registration failed, please check your network connection';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // 处理验证错误
        if (errorData.errors) {
          Object.values(errorData.errors).forEach((msg) => {
            message.error(msg as string);
          });
          return false;
        }
        
        // 处理特定的HTTP状态码
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid registration data';
            break;
          case 409:
            errorMessage = 'Email already exists';
            break;
          case 500:
            errorMessage = 'Server error, please try again later';
            break;
        }
      }
      
      message.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Attempting logout...');
      await authAPI.logout();
      console.log('✅ Logout API call successful');
    } catch (error) {
      console.error('❌ Logout API error:', error);
      // Even if API call fails, clear local state
    } finally {
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('primaryRole');
      
      // Reset state
      setToken(null);
      setUser(null);
      setPrimaryRole(null);
      
      message.success('Logged out successfully');
      console.log('🧹 Local authentication state cleared');
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