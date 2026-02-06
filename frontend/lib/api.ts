import axios from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  VerifyEmailRequest,
  TokenResponse,
  User,
  ChangePasswordRequest,
  ScenarioRequest,
  Scenario,
  ScenarioListResponse,
  ScenarioDetail,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 시 로그아웃
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 인증 API
export const authAPI = {
  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/register', data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/verify-email', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/change-password', data);
    return response.data;
  },
};

// 시나리오 API
export const scenarioAPI = {
  generate: async (data: ScenarioRequest, save = true): Promise<Scenario> => {
    const response = await api.post<Scenario>(`/scenarios/generate?save=${save}`, data);
    return response.data;
  },

  list: async (skip = 0, limit = 20): Promise<ScenarioListResponse> => {
    const response = await api.get<ScenarioListResponse>('/scenarios', {
      params: { skip, limit },
    });
    return response.data;
  },

  get: async (id: string): Promise<ScenarioDetail> => {
    const response = await api.get<ScenarioDetail>(`/scenarios/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/scenarios/${id}`);
  },
};

// 사용자 API
export const userAPI = {
  get: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
