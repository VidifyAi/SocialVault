import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Function to get Clerk token - will be set by the provider
let getClerkToken: (() => Promise<string | null>) | null = null;

export const setClerkTokenGetter = (getter: () => Promise<string | null>) => {
  getClerkToken = getter;
};

// Request interceptor to add Clerk auth token
api.interceptors.request.use(
  async (config) => {
    if (getClerkToken) {
      try {
        const token = await getClerkToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to get Clerk token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401, user needs to sign in again
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Redirect to sign-in
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

// API helper methods
export const listingsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    platform?: string;
    minPrice?: number;
    maxPrice?: number;
    minFollowers?: number;
    maxFollowers?: number;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => api.get('/listings', { params }),
  getById: (id: string) => api.get(`/listings/${id}`),
  create: (data: FormData) =>
    api.post('/listings', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: FormData) =>
    api.patch(`/listings/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string) => api.delete(`/listings/${id}`),
  getFeatured: () => api.get('/listings/featured'),
  getMyListings: () => api.get('/listings/my'),
  verifyOwnership: (
    id: string,
    payload: { verificationUrl: string; method?: string }
  ) => api.post(`/listings/${id}/verify`, payload),
  getVerificationCode: () => api.get('/listings/verification-code'),
  profilePreview: (payload: { profileUrl: string }) =>
    api.post('/listings/profile-preview', payload),
  verifyProfile: (payload: { verificationUrl: string; verificationCode: string }) =>
    api.post('/listings/verify-profile', payload),
};

export const transactionsApi = {
  create: (listingId: string, offerId?: string) =>
    api.post('/transactions', { listingId, offerId }),
  getById: (id: string) => api.get(`/transactions/${id}`),
  getMyTransactions: (type?: 'buying' | 'selling') =>
    api.get('/transactions/my', { params: { type } }),
  updateStatus: (id: string, status: string) =>
    api.patch(`/transactions/${id}/status`, { status }),
  completeStep: (id: string, step: string) =>
    api.post(`/transactions/${id}/complete-step`, { step }),
  completeTransferStep: (id: string, stepNumber: number, formData: FormData) =>
    api.post(`/transactions/${id}/transfer/steps/${stepNumber}/complete`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getTransferStatus: (id: string) =>
    api.get(`/transactions/${id}/transfer/status`),
  dispute: (id: string, reason: string) =>
    api.post(`/transactions/${id}/dispute`, { reason }),
  confirmTransfer: (id: string) => api.post(`/transactions/${id}/confirm-transfer`),
  requestRelease: (id: string) => api.post(`/transactions/${id}/request-release`),
};

export const offersApi = {
  create: (listingId: string, amount: number, message?: string) =>
    api.post('/offers', { listingId, amount, message }),
  getForListing: (listingId: string) => api.get(`/offers/listing/${listingId}`),
  getMyOffers: (type?: 'sent' | 'received') =>
    api.get('/offers/my', { params: { type } }),
  respond: (id: string, action: 'accept' | 'reject' | 'counter', counterAmount?: number) =>
    api.post(`/offers/${id}/respond`, { action, counterAmount }),
  withdraw: (id: string) => api.post(`/offers/${id}/withdraw`),
};

export const messagesApi = {
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (userId: string) => api.get(`/messages/conversation/${userId}`),
  send: (recipientId: string, content: string, listingId?: string) =>
    api.post('/messages', { recipientId, content, listingId }),
  markAsRead: (conversationId: string) =>
    api.post(`/messages/conversation/${conversationId}/read`),
  getUnreadCount: () => api.get('/messages/unread-count'),
};

export const usersApi = {
  // Backward compatible alias used by use-auth hook
  getProfile: () => api.get('/users/me'),
  getMe: () => api.get('/users/me'),
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    avatarUrl?: string;
  }) => api.patch('/users/me', data),
  getPublicProfile: (username: string) => api.get(`/users/${username}`),
  getDashboardStats: () => api.get('/users/dashboard-stats'),
  getNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get('/users/notifications', { params }),
  getUnreadCount: () => api.get('/users/notifications/unread-count'),
  markNotificationAsRead: (id: string) => api.post(`/users/notifications/${id}/read`),
  markAllNotificationsAsRead: () => api.post('/users/notifications/read-all'),
};

export const reviewsApi = {
  create: (transactionId: string, rating: number, comment?: string) =>
    api.post('/reviews', { transactionId, rating, comment }),
  getForUser: (userId: string) => api.get(`/reviews/user/${userId}`),
  getForListing: (listingId: string) => api.get(`/reviews/listing/${listingId}`),
};

export const paymentsApi = {
  createOrder: (transactionId: string) =>
    api.post('/payments/create-order', { transactionId }),
  verify: (data: {
    transactionId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => api.post('/payments/verify', data),
  getStatus: (transactionId: string) =>
    api.get(`/payments/${transactionId}/status`),
  releaseEscrow: (transactionId: string) =>
    api.post(`/payments/${transactionId}/release`),
};

// Export both as named and default for flexibility
export { api };
export default api;
