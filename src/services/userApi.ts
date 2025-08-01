import axios from 'axios';

// API基础配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    // 使用正确的token key: authToken (匹配AuthContext中的设置)
    const token = localStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // 添加调试日志
      console.log('🔑 添加Authorization header:', `Bearer ${token.substring(0, 30)}...`);
    } else {
      console.warn('⚠️ 没有找到认证token (authToken)');
    }
    return config;
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理错误
apiClient.interceptors.response.use(
  (response) => {
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
      // Token过期或无效，清除所有认证信息
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('primaryRole');
      
      console.warn('🚪 认证失败，清除token并跳转登录页');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 接口类型定义（基于你的实际DTO）
export interface UserProfileDto {
  id: number;
  name: string;
  email: string;
  wechatId: string;
  userLevel: number;
  openCandidates: number;
}

export interface UserProfileUpdateDto {
  wechatId: string;
}

export interface CandidateResponseDto {
  id: number;
  candidateName: string;
  candidateWechat: string;
  status: 'PENDING' | 'APPROVED' | 'TRAINING' | 'MARKETING' | 'REJECTED';
  referredByEmail: string;
  referredByUserId: number;
  adminComments: string;
  hasResume: boolean;
  resumeFilename: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateCreateDto {
  candidateName: string;
  candidateWechat: string;
}

// 假的SystemStats接口（因为你的后端可能没有这个）
export interface SystemStats {
  totalOpenReferrals: number;
  totalConnections: number;
  totalUsers?: number;
  totalActiveCandidates?: number;
}

// API响应格式（基于你的Controller响应）
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  profile?: T;
  candidates?: T;
  candidate?: T;
  total?: number;
}

// 用户相关API
export class UserApiService {
  /**
   * 获取用户个人资料
   * 对应: GET /api/user/profile
   */
  static async getUserProfile(): Promise<UserProfileDto> {
    try {
      const response = await apiClient.get<ApiResponse<UserProfileDto>>('/user/profile');
      
      if (response.data.success && response.data.profile) {
        return response.data.profile;
      } else {
        throw new Error(response.data.message || '获取用户资料失败');
      }
    } catch (error: any) {
      console.error('获取用户资料失败:', error);
      throw new Error(error.response?.data?.message || '获取用户资料失败');
    }
  }

  /**
   * 更新用户个人资料
   * 对应: PUT /api/user/profile
   */
  static async updateUserProfile(updateData: UserProfileUpdateDto): Promise<UserProfileDto> {
    try {
      const response = await apiClient.put<ApiResponse<UserProfileDto>>('/user/profile', updateData);
      
      if (response.data.success && response.data.profile) {
        return response.data.profile;
      } else {
        throw new Error(response.data.message || '更新用户资料失败');
      }
    } catch (error: any) {
      console.error('更新用户资料失败:', error);
      throw new Error(error.response?.data?.message || '更新用户资料失败');
    }
  }

  /**
   * 获取当前用户的候选人列表
   * 对应: GET /api/candidates/my-candidates
   */
  static async getUserCandidates(): Promise<CandidateResponseDto[]> {
    try {
      const response = await apiClient.get<ApiResponse<CandidateResponseDto[]>>('/candidates/my-candidates');
      
      if (response.data.success && response.data.candidates) {
        return response.data.candidates;
      } else {
        throw new Error(response.data.message || '获取候选人列表失败');
      }
    } catch (error: any) {
      console.error('获取候选人列表失败:', error);
      throw new Error(error.response?.data?.message || '获取候选人列表失败');
    }
  }

  /**
   * 创建新的候选人推荐
   * 对应: POST /api/candidates (multipart/form-data)
   */
  static async createCandidate(candidateData: CandidateCreateDto, resumeFile?: File): Promise<CandidateResponseDto> {
    try {
      const formData = new FormData();
      formData.append('candidateName', candidateData.candidateName);
      formData.append('candidateWechat', candidateData.candidateWechat);
      
      if (resumeFile) {
        formData.append('resumeFile', resumeFile);
      }

      const response = await apiClient.post<ApiResponse<CandidateResponseDto>>('/candidates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success && response.data.candidate) {
        return response.data.candidate;
      } else {
        throw new Error(response.data.message || '创建候选人推荐失败');
      }
    } catch (error: any) {
      console.error('创建候选人推荐失败:', error);
      throw new Error(error.response?.data?.message || '创建候选人推荐失败');
    }
  }

  /**
   * 下载候选人简历
   * 对应: GET /api/candidates/{candidateId}/resume
   */
  static async downloadCandidateResume(candidateId: number): Promise<Blob> {
    try {
      const response = await apiClient.get(`/candidates/${candidateId}/resume`, {
        responseType: 'blob',
      });
      
      return response.data;
    } catch (error: any) {
      console.error('下载简历失败:', error);
      throw new Error(error.response?.data?.message || '下载简历失败');
    }
  }

  /**
   * 获取系统统计信息
   * 注意：这个API可能不存在于你的后端，所以返回模拟数据
   */
  static async getSystemStats(): Promise<SystemStats> {
    try {
      // 如果你的后端有统计API，取消下面的注释
      // const response = await apiClient.get<ApiResponse<SystemStats>>('/admin/stats');
      // if (response.data.success && response.data.stats) {
      //   return response.data.stats;
      // }
      
      // 暂时返回模拟数据，你可以根据需要调整
      return {
        totalOpenReferrals: 20,
        totalConnections: 20,
        totalUsers: 50,
        totalActiveCandidates: 15,
      };
    } catch (error: any) {
      console.error('获取系统统计失败:', error);
      // 返回默认值而不是抛错
      return {
        totalOpenReferrals: 0,
        totalConnections: 0,
        totalUsers: 0,
        totalActiveCandidates: 0,
      };
    }
  }
}

// 辅助函数
export class UserApiUtils {
  /**
   * 格式化日期
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  /**
   * 获取状态文本
   */
  static getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: '待审核',
      APPROVED: '已批准',
      TRAINING: '培训中',
      MARKETING: '市场推广',
      REJECTED: '已拒绝',
    };
    return statusMap[status] || status;
  }

  /**
   * 获取用户等级信息
   */
  static getUserLevelInfo(level: number): { text: string; color: string } {
    const levelMap: Record<number, { text: string; color: string }> = {
      1: { text: '新手', color: '#52c41a' },
      2: { text: '初级', color: '#1890ff' },
      3: { text: '中级', color: '#722ed1' },
      4: { text: '高级', color: '#eb2f96' },
      5: { text: '专家', color: '#f5222d' },
    };
    return levelMap[level] || { text: '未知', color: '#d9d9d9' };
  }

  /**
   * 下载文件
   */
  static downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * 验证文件类型和大小
   */
  static validateFile(file: File): { valid: boolean; message?: string } {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: '只支持PDF、DOC、DOCX格式的文件',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        message: '文件大小不能超过10MB',
      };
    }

    return { valid: true };
  }
}

export default UserApiService;