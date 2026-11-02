import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, APP_CONFIG } from './config';

const TOKEN_KEY = 'blood_bd_token';
const USER_KEY = 'blood_bd_user';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  [key: string]: any;
}

export const TokenStorage = {
  async saveToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (e) {
      console.warn('SecureStore saveToken error:', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('SecureStore getToken error:', e);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn('SecureStore removeToken error:', e);
    }
  },

  async saveCachedUser(user: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('SecureStore saveCachedUser error:', e);
    }
  },

  async getCachedUser(): Promise<any | null> {
    try {
      const data = await SecureStore.getItemAsync(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  async clearAll(): Promise<void> {
    await this.removeToken();
    try {
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (e) {}
  }
};

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

export async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { timeoutMs = 12000, retries = 1, ...fetchOptions } = options;
  const token = await TokenStorage.getToken();
  const url = `${API_BASE_URL}${endpoint}`;
  const method = (fetchOptions.method || 'GET').toUpperCase();
  const isIdempotent = method === 'GET' || method === 'HEAD';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-client-platform': APP_CONFIG.platform,
    'x-app-version': APP_CONFIG.version,
    ...(fetchOptions.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let attempt = 0;
  // Non-idempotent requests (POST, PUT, PATCH, DELETE) never retry to prevent double submissions
  const maxAttempts = isIdempotent ? Math.max(1, retries + 1) : 1;

  while (attempt < maxAttempts) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (err) {
        data = { success: false, message: text || `HTTP ${response.status} Error` };
      }

      if (response.status === 401) {
        // Token expired or invalid session
        await TokenStorage.clearAll();
      }

      if (!response.ok) {
        throw new Error(data.message || `সার্ভারে ত্রুটি দেখা দিয়েছে (${response.status})`);
      }

      return data;
    } catch (err: any) {
      clearTimeout(timeoutId);

      const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
      const isNetworkError = err.message?.includes('Network request failed') || err.message?.includes('fetch');

      // If we still have retries for idempotent calls, wait 1s and try again
      if (isIdempotent && attempt < maxAttempts && (isTimeout || isNetworkError)) {
        await new Promise((res) => setTimeout(res, 1000));
        continue;
      }

      if (isTimeout) {
        throw new Error('সার্ভারের সাড়া পেতে অতিরিক্ত সময় লেগেছে। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।');
      }

      if (isNetworkError) {
        throw new Error('ইন্টারনেট সংযোগ নেই অথবা সার্ভার সাড়া দিচ্ছে না। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
      }

      throw err;
    }
  }

  throw new Error('অনুরোধটি সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
}

export const MobileApi = {
  // Authentication
  login: (phone: string, password: string) => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    }),

  register: (data: any) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getCurrentUser: () =>
    request('/auth/me'),

  changePasswordFirstLogin: (newPassword: string) =>
    request('/auth/change-password-first-login', {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    }),

  requestPasswordRecovery: (data: { phone: string; reason: string; division?: string; institutionId?: string }) =>
    request('/auth/recovery/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Donors
  searchDonors: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) q.append(k, String(v));
    });
    return request(`/donors?${q.toString()}`);
  },

  getDonorById: (id: string) =>
    request(`/donors/${id}`),

  updateDonorProfile: (data: any) =>
    request('/donors/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  revealDonorContact: (donorId: string, purpose: string = 'emergency_search', relatedBloodRequestId?: string) =>
    request(`/donors/${donorId}/reveal-contact`, {
      method: 'POST',
      body: JSON.stringify({ purpose, relatedBloodRequestId })
    }),

  // Blood Requests
  getBloodRequests: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) q.append(k, String(v));
    });
    return request(`/requests?${q.toString()}`);
  },

  createBloodRequest: (data: any) =>
    request('/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getBloodRequestById: (id: string) =>
    request(`/requests/${id}`),

  // Institutions
  getInstitutions: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) q.append(k, String(v));
    });
    return request(`/institutions?${q.toString()}`);
  },

  getInstitutionById: (id: string) =>
    request(`/institutions/${id}`),

  // Phone Change & Campus Transfer
  requestPhoneChange: (newPhone: string, reason: string) =>
    request('/phone-change/request', {
      method: 'POST',
      body: JSON.stringify({ newPhone, reason })
    }),

  getMyPhoneChangeRequest: () =>
    request('/phone-change/my-request'),

  getPhoneChangeRequests: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) q.append(k, String(v));
    });
    return request(`/phone-change/requests?${q.toString()}`);
  },

  reviewPhoneChangeRequest: (id: string, status: 'approved' | 'rejected', reviewNotes?: string) =>
    request(`/phone-change/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewNotes })
    }),

  requestInstitutionChange: (targetInstitutionId: string, studentOrStaffId?: string, department?: string, reason?: string) =>
    request('/institution-change', {
      method: 'POST',
      body: JSON.stringify({ targetInstitutionId, studentOrStaffId, department, reason })
    }),

  getMyInstitutionChangeRequest: () =>
    request('/institution-change/my'),

  getInstitutionChangeRequests: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) q.append(k, String(v));
    });
    return request(`/institution-change?${q.toString()}`);
  },

  reviewInstitutionChangeRequest: (id: string, status: 'approved' | 'rejected', reviewNotes?: string) =>
    request(`/institution-change/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewNotes })
    }),

  // Password Recovery Admin/Mod
  getPasswordRecoveryRequests: () =>
    request('/auth/recovery/requests'),

  approvePasswordRecoveryRequest: (id: string, adminNotes?: string) =>
    request(`/auth/recovery/requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminNotes })
    }),

  rejectPasswordRecoveryRequest: (id: string, rejectReason: string) =>
    request(`/auth/recovery/requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectReason })
    }),

  // Admin Specific
  getAdminUsers: (params: Record<string, any> = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) q.append(k, String(v));
    });
    return request(`/admin/users?${q.toString()}`);
  },

  blockUser: (id: string, reason: string) =>
    request(`/admin/users/${id}/block`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  unblockUser: (id: string, reason: string) =>
    request(`/admin/users/${id}/unblock`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  getInstitutionRequests: () =>
    request('/institution-requests'),

  reviewInstitutionRequest: (id: string, status: 'approved' | 'rejected', notes?: string) =>
    request(`/institution-requests/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    }),

  searchScopedUser: (query: string) =>
    request(`/admin/users/scoped-search?query=${encodeURIComponent(query)}`),

  // Notifications
  getNotifications: () =>
    request('/notifications'),

  markNotificationAsRead: (id: string) =>
    request(`/notifications/${id}/read`, { method: 'PATCH' }),

  // Dashboards
  getDonorDashboard: () =>
    request('/donors/dashboard'),

  getRequesterDashboard: () =>
    request('/requests/dashboard'),

  getModeratorDashboard: () =>
    request('/moderators/dashboard'),

  getCoordinatorDashboard: () =>
    request('/coordinator/dashboard'),

  getAdminDashboard: () =>
    request('/admin/overview')
};
