const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Permintaan gagal. Coba lagi.');
  }
  return data;
}

export const authSaveClient = {
  register: ({ username, password }) =>
    request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  login: ({ username, password }) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  me: (token) => request('/api/auth/me', { token }),

  getSave: (token) => request('/api/save', { token }),

  saveGame: (token, gameState, saveName = 'Auto Save') =>
    request('/api/save', {
      token,
      method: 'POST',
      body: JSON.stringify({ saveName, gameState }),
    }),

  deleteSave: (token, saveName = 'Auto Save') =>
    request(`/api/save?saveName=${encodeURIComponent(saveName)}`, {
      token,
      method: 'DELETE',
    }),
};
