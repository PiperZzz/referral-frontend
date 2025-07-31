import axios, { AxiosResponse } from 'axios';

// API基础配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// 创建axios实例
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理通用错误
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  user?: T;
  errors?: Record<string, string>;
}

export interface UserRegistrationData {
  email: string;
  password: string;
  wechatId?: string;
  referrerWechatId?: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  type: string;
  user: {
    id: number;
    email: string;
    wechatId?: string;
    status: string;
    roles: string[];
    createdAt: string;
  };
  primaryRole: string;
  defaultRoute: string;
}

// 认证相关API
export const authAPI = {
  // 用户注册
  register: async (userData: UserRegistrationData): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // 用户登录
  login: async (credentials: UserLoginData): Promise<ApiResponse<LoginResponseData>> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // 用户登出
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // 检查登录状态
  checkStatus: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/auth/status');
    return response.data;
  },

  // 忘记密码
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // 重置密码
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

// 用户相关API
export const userAPI = {
  // 获取用户资料
  getProfile: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // 更新微信信息
  updateWechat: async (wechatData: { wechatId?: string; referrerWechatId?: string }): Promise<ApiResponse> => {
    const response = await apiClient.put('/users/wechat', wechatData);
    return response.data;
  },
};

export default apiClient;