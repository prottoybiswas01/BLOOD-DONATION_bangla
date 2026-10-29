const API_BASE = '/api/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `সার্ভার ত্রুটি: ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  requestOtp: (phone: string, purpose = 'registration') =>
    fetchWithAuth('/auth/request-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, purpose }),
    }),

  verifyOtp: (phone: string, otp: string, purpose = 'registration') =>
    fetchWithAuth('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, purpose }),
    }),

  register: (payload: any) =>
    fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (phone: string, password: string) =>
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    }),

  getMe: () => fetchWithAuth('/auth/me'),

  changeFirstLoginPassword: (newPassword: string) =>
    fetchWithAuth('/auth/change-first-login-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }),

  // Members & Moderator creation
  createMemberByModerator: (payload: any) =>
    fetchWithAuth('/members', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateMyProfile: (payload: any) =>
    fetchWithAuth('/members/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Donors
  searchDonors: (params: Record<string, any>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) query.append(k, String(v));
    });
    return fetchWithAuth(`/donors/search?${query.toString()}`);
  },

  getDonorById: (id: string) => fetchWithAuth(`/donors/profile/${id}`),

  revealDonorContact: (id: string, payload: { purpose: string; relatedBloodRequestId?: string }) =>
    fetchWithAuth(`/donors/reveal-contact/${id}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMyDonorProfile: () => fetchWithAuth('/donors/me'),

  updateMyDonorProfile: (payload: any) =>
    fetchWithAuth('/donors/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  recordDonation: (donationDate?: string) =>
    fetchWithAuth('/donors/record-donation', {
      method: 'POST',
      body: JSON.stringify({ donationDate }),
    }),

  // Blood Requests
  searchRequests: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) query.append(k, String(v));
    });
    return fetchWithAuth(`/requests/search?${query.toString()}`);
  },

  getRequestById: (id: string) => fetchWithAuth(`/requests/${id}`),

  createRequest: (payload: any) =>
    fetchWithAuth('/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateRequestStatus: (id: string, payload: any) =>
    fetchWithAuth(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getMyRequests: () => fetchWithAuth('/requests/my-requests'),

  // Institutions
  getInstitutions: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) query.append(k, String(v));
    });
    return fetchWithAuth(`/institutions?${query.toString()}`);
  },

  getInstitutionById: (id: string) => fetchWithAuth(`/institutions/${id}`),

  createInstitution: (payload: any) =>
    fetchWithAuth('/institutions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getModeratorDashboard: (institutionId?: string) => {
    const q = institutionId ? `?institutionId=${institutionId}` : '';
    return fetchWithAuth(`/institutions/moderator/dashboard${q}`);
  },

  // Institution Registration Requests (Workflow)
  submitInstitutionRequest: (payload: any) =>
    fetchWithAuth('/institution-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getInstitutionRequests: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) query.append(k, String(v));
    });
    return fetchWithAuth(`/institution-requests?${query.toString()}`);
  },

  reviewInstitutionRequest: (id: string, payload: { status: 'approved' | 'rejected' | 'under_review'; decisionReason: string }) =>
    fetchWithAuth(`/institution-requests/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Institutional Contact Requests
  submitContactRequest: (payload: any) =>
    fetchWithAuth('/contact-requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getContactRequests: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) query.append(k, String(v));
    });
    return fetchWithAuth(`/contact-requests?${query.toString()}`);
  },

  updateContactRequestStatus: (id: string, payload: { status: string; moderatorNotes?: string }) =>
    fetchWithAuth(`/contact-requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Moderator Activities
  getModeratorActivities: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) query.append(k, String(v));
    });
    return fetchWithAuth(`/moderators/activities?${query.toString()}`);
  },

  getDivisionModeratorsSummary: (division?: string) => {
    const q = division ? `?division=${division}` : '';
    return fetchWithAuth(`/moderators/summary${q}`);
  },

  // Coordinator
  getCoordinatorDashboard: (division?: string) => {
    const q = division ? `?division=${division}` : '';
    return fetchWithAuth(`/coordinators/dashboard${q}`);
  },

  // Admin & User Management
  getAdminOverview: () => fetchWithAuth('/admin/overview'),

  getAdminUsers: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) query.append(k, String(v));
    });
    return fetchWithAuth(`/admin/users?${query.toString()}`);
  },

  getAdminUserById: (id: string) => fetchWithAuth(`/admin/users/${id}`),

  adminEditUserProfile: (id: string, payload: any) =>
    fetchWithAuth(`/admin/users/${id}/profile`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  updateUserRole: (id: string, payload: any) =>
    fetchWithAuth(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  blockUser: (id: string, reason: string, status = 'temporarily_blocked') =>
    fetchWithAuth(`/admin/users/${id}/block`, {
      method: 'POST',
      body: JSON.stringify({ reason, status }),
    }),

  unblockUser: (id: string, reason: string) =>
    fetchWithAuth(`/admin/users/${id}/unblock`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  getBlockedUsers: () => fetchWithAuth('/admin/blocked-users'),

  getAccountStatusHistories: () => fetchWithAuth('/admin/status-history'),

  updateInstitutionStatus: (id: string, status: string, verificationNote?: string) =>
    fetchWithAuth(`/admin/institutions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, verificationNote }),
    }),

  getAuditLogs: () => fetchWithAuth('/admin/audit-logs'),

  getContactAccessLogs: () => fetchWithAuth('/admin/contact-access-logs'),

  // Reports
  createReport: (payload: any) =>
    fetchWithAuth('/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getReports: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) query.append(k, String(v));
    });
    return fetchWithAuth(`/reports?${query.toString()}`);
  },

  resolveReport: (id: string, payload: any) =>
    fetchWithAuth(`/reports/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Locations
  getLocations: () => fetchWithAuth('/locations'),

  // Notifications
  getNotifications: () => fetchWithAuth('/notifications'),
  markNotificationAsRead: (id: string) =>
    fetchWithAuth(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
};
