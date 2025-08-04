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
      console.log('🔑 添加Authorization header:', `Bearer ${token.substring(0, 30)}...`);
    }
    return config;
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理通用错误
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ API响应成功:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API请求失败:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('primaryRole');
      console.warn('🚪 认证失败，清除token并跳转登录页');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 类型定义 - 与后端API响应格式匹配
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  user?: T;
  profile?: T;
  candidate?: T;
  candidates?: T;
  total?: number;
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

// 根据后端AuthController的响应格式定义
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

export interface UserProfileDto {
  id: number;
  email: string;
  wechatId?: string;
  referrerWechatId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  roles: string[];
}

export interface CandidateInfoDto {
  id: number;
  candidateName: string;
  candidateWechat: string;
  status: string;
  referredByEmail: string;
  referredByUserId: number;
  adminComments?: string;
  hasResume: boolean;
  resumeFilename?: string;
  createdAt: string;
  updatedAt: string;
}

// 认证相关API - 与后端AuthController匹配
export const authAPI = {
  // 用户注册
  register: async (userData: UserRegistrationData): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // 用户登录 - 与后端 POST /api/auth/login 匹配
  login: async (credentials: UserLoginData): Promise<ApiResponse<LoginResponseData>> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // 用户登出 - 与后端 POST /api/auth/logout 匹配
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // 检查登录状态 - 与后端 GET /api/auth/status 匹配
  checkStatus: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/auth/status');
    return response.data;
  },

  // 忘记密码 - 与后端 POST /api/auth/forget-password 匹配
  forgetPassword: async (email: string): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/forget-password', { email });
    return response.data;
  },

  // 重置密码 - 与后端 POST /api/auth/reset-password 匹配
  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

// 用户相关API - 与后端UserController匹配
export const userAPI = {
  // 获取用户资料 - 与后端 GET /api/users/profile 匹配
  getProfile: async (): Promise<ApiResponse<UserProfileDto>> => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // 获取详细用户资料 - 与后端 GET /api/user/profile 匹配
  getDetailedProfile: async (): Promise<ApiResponse<UserProfileDto>> => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  // 更新用户资料 - 与后端 PUT /api/user/profile 匹配
  updateProfile: async (profileData: Partial<UserProfileDto>): Promise<ApiResponse<UserProfileDto>> => {
    const response = await apiClient.put('/user/profile', profileData);
    return response.data;
  },

  // 更新用户名 - 与后端 PUT /api/users/username 匹配
  updateUsername: async (usernameData: { username: string }): Promise<ApiResponse> => {
    const response = await apiClient.put('/users/username', usernameData);
    return response.data;
  },
};

// 候选人相关API - 与后端CandidateController匹配
export const candidateAPI = {
  // 创建候选人 - 与后端 POST /api/candidates 匹配 (multipart/form-data)
  create: async (candidateData: FormData): Promise<ApiResponse<CandidateInfoDto>> => {
    const response = await apiClient.post('/candidates', candidateData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 获取用户的候选人列表 - 与后端 GET /api/candidates/my-candidates 匹配
  getMyCandidates: async (): Promise<ApiResponse<CandidateInfoDto[]>> => {
    const response = await apiClient.get('/candidates/my-candidates');
    return response.data;
  },

  // 获取候选人统计 - 与后端 GET /api/candidates/my-stats 匹配
  getMyStats: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/candidates/my-stats');
    return response.data;
  },

  // 获取特定候选人 - 与后端 GET /api/candidates/{id} 匹配
  getCandidate: async (candidateId: number): Promise<ApiResponse<CandidateInfoDto>> => {
    const response = await apiClient.get(`/candidates/${candidateId}`);
    return response.data;
  },

  // 更新候选人 - 与后端 PUT /api/candidates/{id} 匹配
  updateCandidate: async (candidateId: number, candidateData: Partial<CandidateInfoDto>): Promise<ApiResponse<CandidateInfoDto>> => {
    const response = await apiClient.put(`/candidates/${candidateId}`, candidateData);
    return response.data;
  },

  // 删除候选人 - 与后端 DELETE /api/candidates/{id} 匹配
  deleteCandidate: async (candidateId: number): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/candidates/${candidateId}`);
    return response.data;
  },

  // 下载简历 - 与后端 GET /api/candidates/{id}/resume 匹配
  downloadResume: async (candidateId: number): Promise<Blob> => {
    const response = await apiClient.get(`/candidates/${candidateId}/resume`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // 检查编辑权限 - 与后端 GET /api/candidates/{id}/editable 匹配
  checkEditable: async (candidateId: number): Promise<ApiResponse<{ editable: boolean }>> => {
    const response = await apiClient.get(`/candidates/${candidateId}/editable`);
    return response.data;
  },
};

// 管理员相关API - 与后端AdminPortalController匹配
export const adminAPI = {
  // 获取所有用户 - 与后端 GET /api/admin/users 匹配
  getAllUsers: async (): Promise<ApiResponse<UserProfileDto[]>> => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  // 获取推荐管理数据 - 与后端 GET /api/admin/management 匹配
  getReferralManagement: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/admin/management');
    return response.data;
  },

  // 获取管理员统计 - 与后端 GET /api/admin/stats 匹配
  getAdminStats: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },
};

// 管理员候选人API - 与后端AdminCandidateController匹配
export const adminCandidateAPI = {
  // 获取所有候选人 - 与后端 GET /api/admin/candidates 匹配
  getAllCandidates: async (): Promise<ApiResponse<CandidateInfoDto[]>> => {
    const response = await apiClient.get('/admin/candidates');
    return response.data;
  },

  // 按状态获取候选人 - 与后端 GET /api/admin/candidates/status/{status} 匹配
  getCandidatesByStatus: async (status: string): Promise<ApiResponse<CandidateInfoDto[]>> => {
    const response = await apiClient.get(`/admin/candidates/status/${status}`);
    return response.data;
  },

  // 更新候选人状态 - 与后端 PUT /api/admin/candidates/{id}/status 匹配
  updateCandidateStatus: async (candidateId: number, statusData: { status: string; adminComments?: string }): Promise<ApiResponse<CandidateInfoDto>> => {
    const response = await apiClient.put(`/admin/candidates/${candidateId}/status`, statusData);
    return response.data;
  },

  // 获取待筛选候选人 - 与后端 GET /api/admin/candidates/screening 匹配
  getScreeningCandidates: async (): Promise<ApiResponse<CandidateInfoDto[]>> => {
    const response = await apiClient.get('/admin/candidates/screening');
    return response.data;
  },

  // 批量审批候选人 - 与后端 PUT /api/admin/candidates/batch-approve 匹配
  batchApprove: async (candidateIds: number[]): Promise<ApiResponse> => {
    const response = await apiClient.put('/admin/candidates/batch-approve', candidateIds);
    return response.data;
  },
};

// Master相关API - 与后端MasterController匹配
export const masterAPI = {
  // 获取所有用户及角色 - 与后端 GET /api/master/users 匹配
  getAllUsersWithRoles: async (): Promise<ApiResponse<UserProfileDto[]>> => {
    const response = await apiClient.get('/master/users');
    return response.data;
  },

  // 提升用户为管理员 - 与后端 POST /api/master/promote-admin 匹配
  promoteToAdmin: async (userData: { email: string; adminComments?: string }): Promise<ApiResponse<UserProfileDto>> => {
    const response = await apiClient.post('/master/promote-admin', userData);
    return response.data;
  },

  // 降级管理员为用户 - 与后端 POST /api/master/demote-admin 匹配
  demoteFromAdmin: async (email: string): Promise<ApiResponse<UserProfileDto>> => {
    const response = await apiClient.post('/master/demote-admin', { email });
    return response.data;
  },

  // 获取可降级的管理员 - 与后端 GET /api/master/demotable-admins 匹配
  getDemotableAdmins: async (): Promise<ApiResponse<UserProfileDto[]>> => {
    const response = await apiClient.get('/master/demotable-admins');
    return response.data;
  },
};

// 工具API
export const utilityAPI = {
  // 获取管理员帮助信息 - 与后端 GET /api/help/admins 匹配
  getAdminHelp: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/help/admins');
    return response.data;
  },

  // 会话配置 - 与后端 GET /api/session/config 匹配
  getSessionConfig: async (): Promise<ApiResponse> => {
    const response = await apiClient.get('/session/config');
    return response.data;
  },

  // 会话心跳 - 与后端 POST /api/session/heartbeat 匹配
  heartbeat: async (): Promise<ApiResponse> => {
    const response = await apiClient.post('/session/heartbeat');
    return response.data;
  },
};