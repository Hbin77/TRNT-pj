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
  FeedbackRequest,
  FeedbackResponse,
  ContinuationRequest,
  StreamEvent,
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

// 응답 인터셉터: 401 에러 시 토큰 갱신 시도
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // refresh 요청 자체가 실패한 경우 로그아웃
      if (originalRequest.url?.includes('/auth/refresh')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      if (!refreshToken) {
        isRefreshing = false;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const response = await api.post<TokenResponse>('/auth/refresh', {
          refresh_token: refreshToken,
        });
        const { access_token, refresh_token: newRefreshToken } = response.data;

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        processQueue(null, access_token);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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

/**
 * 스트리밍 요청 전 토큰 유효성 확인 및 갱신
 * fetch는 axios 인터셉터를 거치지 않으므로 수동으로 처리
 */
async function ensureFreshToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('access_token');
  if (!token) return null;

  // JWT payload 디코딩하여 만료 시간 확인
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // seconds → ms
    const now = Date.now();

    // 만료 2분 전이면 미리 갱신
    if (exp - now > 2 * 60 * 1000) {
      return token; // 아직 유효
    }
  } catch {
    // 디코딩 실패 시 갱신 시도
  }

  // 토큰 갱신
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;

  try {
    const response = await api.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    const { access_token, refresh_token: newRefreshToken } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', newRefreshToken);
    return access_token;
  } catch {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
    return null;
  }
}

// 시나리오 API
export const scenarioAPI = {
  generate: async (data: ScenarioRequest, save = true): Promise<Scenario> => {
    const response = await api.post<Scenario>(`/scenarios/generate?save=${save}`, data);
    return response.data;
  },

  generateStream: async (
    data: ScenarioRequest,
    onChunk: (content: string) => void,
    onDone: (scenarioId: string) => void,
    onError?: (message: string) => void
  ): Promise<void> => {
    const token = await ensureFreshToken();
    const response = await fetch(`${API_URL}/api/v1/scenarios/generate/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || errorData?.detail || `HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('ReadableStream not supported');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event: StreamEvent = JSON.parse(line.slice(6));
          if (event.type === 'chunk') {
            onChunk(event.content);
          } else if (event.type === 'done') {
            onDone(event.scenario_id);
          } else if (event.type === 'error') {
            onError?.(event.message);
          }
        } catch {
          // ignore parse errors
        }
      }
    }
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

  feedback: async (id: string, data: FeedbackRequest): Promise<FeedbackResponse> => {
    const response = await api.post<FeedbackResponse>(`/scenarios/${id}/feedback`, data);
    return response.data;
  },

  continueScenario: async (id: string, data: ContinuationRequest): Promise<Scenario> => {
    const response = await api.post<Scenario>(`/scenarios/${id}/continue`, data);
    return response.data;
  },

  getTTS: async (id: string): Promise<Blob> => {
    const response = await api.post(`/scenarios/${id}/tts`, null, {
      responseType: 'blob',
    });
    return response.data;
  },

  generateCover: async (id: string): Promise<{ cover_image_url: string }> => {
    const response = await api.post<{ cover_image_url: string }>(`/scenarios/${id}/generate-cover`);
    return response.data;
  },

  continueScenarioStream: async (
    id: string,
    data: ContinuationRequest,
    onChunk: (content: string) => void,
    onDone: (scenarioId: string) => void,
    onError?: (message: string) => void
  ): Promise<void> => {
    const token = await ensureFreshToken();
    const response = await fetch(`${API_URL}/api/v1/scenarios/${id}/continue/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || errorData?.detail || `HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('ReadableStream not supported');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event: StreamEvent = JSON.parse(line.slice(6));
          if (event.type === 'chunk') {
            onChunk(event.content);
          } else if (event.type === 'done') {
            onDone(event.scenario_id);
          } else if (event.type === 'error') {
            onError?.(event.message);
          }
        } catch {
          // ignore parse errors
        }
      }
    }
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
