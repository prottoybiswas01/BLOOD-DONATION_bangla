import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, APP_CONFIG } from './config';

const TOKEN_KEY = 'blood_bd_token';
const USER_KEY = 'blood_bd_user';

export type ApiErrorType = 'NETWORK_ERROR' | 'TIMEOUT' | 'SERVER_ERROR' | 'AUTH_ERROR' | 'UNKNOWN';

export class MobileApiError extends Error {
  type: ApiErrorType;
  status?: number;
  userMessage: string;

  constructor(message: string, type: ApiErrorType = 'UNKNOWN', status?: number) {
    super(message);
    this.name = 'MobileApiError';
    this.type = type;
    this.status = status;
    this.userMessage = message;
  }
}

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
    clearApiCache();
  }
};

interface CacheEntry {
  data: any;
  timestamp: number;
}

const apiCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<any>>();

export function clearApiCache(prefix?: string) {
  if (!prefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(prefix)) {
      apiCache.delete(key);
    }
  }
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  skipCache?: boolean;
  cacheTtlMs?: number;
}

export async function request<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { 
    timeoutMs = 10000, 
    retries = 1, 
    skipCache = false, 
    cacheTtlMs = 15000,
    ...fetchOptions 
  } = options;

  const method = (fetchOptions.method || 'GET').toUpperCase();
  const isIdempotent = method === 'GET' || method === 'HEAD';
  const url = `${API_BASE_URL}${endpoint}`;
  const cacheKey = `${method}:${url}`;

  // If explicit refresh requested, evict existing cache entry
  if (skipCache) {
    apiCache.delete(cacheKey);
  }

  // Serve from in-memory cache for GET if still valid
  if (isIdempotent && !skipCache) {
    const cached = apiCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < cacheTtlMs)) {
      return cached.data as T;
    }
  }

  // Deduplicate concurrent inflight requests
  if (isIdempotent && inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)! as Promise<T>;
  }

  const executeRequest = async (): Promise<T> => {
    const token = await TokenStorage.getToken();
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
          await TokenStorage.clearAll();
          throw new MobileApiError(
            data.message || 'আপনার সেশনের মেয়াদ শেষ হয়েছে। পুনরায় লগইন করুন।',
            'AUTH_ERROR',
            401
          );
        }

        if (!response.ok) {
          throw new MobileApiError(
            data.message || `সার্ভারে ত্রুটি দেখা দিয়েছে (${response.status})`,
            response.status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN',
            response.status
          );
        }

        // Cache successful idempotent responses
        if (isIdempotent) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
        } else {
          // Mutating calls invalidate caches related to this endpoint
          if (endpoint.includes('/requests')) clearApiCache('/requests');
          if (endpoint.includes('/donors')) clearApiCache('/donors');
          if (endpoint.includes('/institutions')) clearApiCache('/institutions');
          if (endpoint.includes('/members')) {
            clearApiCache('/donors');
            clearApiCache('/members');
          }
          if (endpoint.includes('/phone-change')) clearApiCache('/phone-change');
          if (endpoint.includes('/institution-change')) clearApiCache('/institution-change');
          clearApiCache('/stats');
        }

        return data;
      } catch (err: any) {
        clearTimeout(timeoutId);

        if (err instanceof MobileApiError) {
          throw err;
        }

        const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
        const isNetworkError = err.message?.includes('Network request failed') || err.message?.includes('fetch');

        // Retry once on network blip for GET
        if (isIdempotent && attempt < maxAttempts && (isTimeout || isNetworkError)) {
          await new Promise((res) => setTimeout(res, 800));
          continue;
        }

        // Fallback to stale cached data only if user did NOT explicitly skip cache
        if (isIdempotent && !skipCache && apiCache.has(cacheKey)) {
          console.warn('[MobileApi] Serving stale cache due to network glitch');
          return apiCache.get(cacheKey)!.data as T;
        }

        if (isTimeout) {
          throw new MobileApiError(
            'সার্ভারের সাড়া পেতে অতিরিক্ত সময় লেগেছে। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।',
            'TIMEOUT'
          );
        }

        if (isNetworkError) {
          throw new MobileApiError(
            'ইন্টারনেট সংযোগ নেই অথবা সার্ভারে সাময়িক সমস্যা হচ্ছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
            'NETWORK_ERROR'
          );
        }

        throw new MobileApiError(
          err.message || 'অনুরোধটি সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
          'UNKNOWN'
        );
      }
    }

    throw new MobileApiError('অনুরোধটি সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।', 'UNKNOWN');
  };

  const promise = executeRequest().finally(() => {
    inFlightRequests.delete(cacheKey);
  });

  if (isIdempotent) {
    inFlightRequests.set(cacheKey, promise);
  }

  return promise;
}

export const MobileApi = {
  // Public Statistics
  getPublicStats: (skipCache: boolean = false) =>
    request('/stats', { skipCache }),

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
    request('/auth/me', { skipCache: true }),

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
  searchDonors: (params: Record<string, any> = {}, skipCache: boolean = false) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) q.append(k, String(v));
    });
    return request(`/donors?${q.toString()}`, { skipCache });
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
  getBloodRequests: (params: Record<string, any> = {}, skipCache: boolean = false) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) q.append(k, String(v));
    });
    return request(`/requests?${q.toString()}`, { skipCache });
  },

  createBloodRequest: (data: any) =>
    request('/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getBloodRequestById: (id: string) =>
    request(`/requests/${id}`),

  // Institutions
  getInstitutions: (params: Record<string, any> = {}, skipCache: boolean = false) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) q.append(k, String(v));
    });
    return request(`/institutions?${q.toString()}`, { skipCache });
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
    request('/phone-change/my-request', { skipCache: true }),

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
    request('/institution-change/my', { skipCache: true }),

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
    request('/notifications', { skipCache: true }),

  markNotificationAsRead: (id: string) =>
    request(`/notifications/${id}/read`, { method: 'PATCH' }),

  // Dashboards
  getDonorDashboard: () =>
    request('/donors/dashboard', { skipCache: true }),

  getRequesterDashboard: () =>
    request('/requests/dashboard', { skipCache: true }),

  getModeratorDashboard: () =>
    request('/moderators/dashboard', { skipCache: true }),

  getCoordinatorDashboard: () =>
    request('/coordinator/dashboard', { skipCache: true }),

  getAdminDashboard: () =>
    request('/admin/overview', { skipCache: true })
};
