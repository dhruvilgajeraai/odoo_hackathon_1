const API_BASE = '/api';

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth & User Profile
  login: (credentials) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: () => fetchWithAuth('/users/me'),
  updateProfile: (data) => fetchWithAuth('/users/me', { method: 'PUT', body: JSON.stringify(data) }),

  // Trips
  getTrips: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/trips${query ? `?${query}` : ''}`);
  },
  getTrip: (id) => fetchWithAuth(`/trips/${id}`),
  getFullTrip: (id) => fetchWithAuth(`/trips/${id}/full`),
  createTrip: (data) => fetchWithAuth('/trips', { method: 'POST', body: JSON.stringify(data) }),
  updateTrip: (id, data) => fetchWithAuth(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTrip: (id) => fetchWithAuth(`/trips/${id}`, { method: 'DELETE' }),
  getTripBudget: (id) => fetchWithAuth(`/trips/${id}/budget`),
  shareTrip: (id) => fetchWithAuth(`/trips/${id}/share`, { method: 'POST' }),
  copyTrip: (id) => fetchWithAuth(`/trips/${id}/copy`, { method: 'POST' }),

  // Stops
  addStop: (tripId, data) => fetchWithAuth(`/trips/${tripId}/stops`, { method: 'POST', body: JSON.stringify(data) }),
  updateStop: (id, data) => fetchWithAuth(`/stops/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStop: (id) => fetchWithAuth(`/stops/${id}`, { method: 'DELETE' }),

  // Activities
  addActivity: (stopId, data) => fetchWithAuth(`/stops/${stopId}/activities`, { method: 'POST', body: JSON.stringify(data) }),
  updateActivity: (id, data) => fetchWithAuth(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteActivity: (id) => fetchWithAuth(`/activities/${id}`, { method: 'DELETE' }),

  // Catalog
  getCities: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/cities${query ? `?${query}` : ''}`);
  },
  getCity: (id) => fetchWithAuth(`/cities/${id}`),
  getActivities: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/activities${query ? `?${query}` : ''}`);
  },

  // Community
  getCommunityPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/community/posts${query ? `?${query}` : ''}`);
  },
  createCommunityPost: (data) => fetchWithAuth('/community/posts', { method: 'POST', body: JSON.stringify(data) }),
  likeCommunityPost: (id) => fetchWithAuth(`/community/posts/${id}/like`, { method: 'POST' }),

  // Admin
  getAdminStats: () => fetchWithAuth('/admin/stats'),
  getAdminUsers: () => fetchWithAuth('/admin/users'),
  deleteAdminUser: (id) => fetchWithAuth(`/admin/users/${id}`, { method: 'DELETE' }),

  // Public Share
  getPublicTrip: (slug) => fetchWithAuth(`/public/trips/${slug}`),
};
