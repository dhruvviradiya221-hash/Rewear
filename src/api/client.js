const API_BASE = process.env.REACT_APP_API_URL || 'https://rewear-1-m2m8.onrender.com';

function getToken() {
  return localStorage.getItem('rewear_token');
}

export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
}

async function request(path, options = {}) {
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || res.statusText || 'Request failed');
  }
  return data;
}

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
  featuredItems: () => request('/api/items/featured'),
  listItems: (params) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/items${q ? `?${q}` : ''}`);
  },
  getItem: (id) => request(`/api/items/${id}`),
  createItem: (formData) =>
    request('/api/items', { method: 'POST', body: formData }),
  swapRequest: (id) => request(`/api/items/${id}/swap-request`, { method: 'POST', body: '{}' }),
  redeemItem: (id) => request(`/api/items/${id}/redeem`, { method: 'POST', body: '{}' }),
  myItems: () => request('/api/users/me/items'),
  mySwaps: () => request('/api/users/me/swaps'),
  respondSwap: (id, action) =>
    request(`/api/users/me/swaps/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    }),
  adminPending: () => request('/api/admin/items/pending'),
  adminAllItems: () => request('/api/admin/items'),
  adminModerate: (id, action) =>
    request(`/api/admin/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    }),
  adminDelete: (id) => request(`/api/admin/items/${id}`, { method: 'DELETE' }),
};
