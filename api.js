import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 15000,
});

// Restore token on load
const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;
