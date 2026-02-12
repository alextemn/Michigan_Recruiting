import axios from 'axios';

// Base Axios instance for the Django API
const api = axios.create({
  baseURL: 'https://club-applications-d42c9d50a2b6.herokuapp.com/api/',
});

// Attach JWT access token if present
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('accessToken');
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Automatically refresh access token on 401 using refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response
      && error.response.status === 401
      && !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = window.localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Use a bare axios instance to avoid interceptor recursion
        const refreshResponse = await axios.post(
          'http://127.0.0.1:8000/api/login/refresh/',
          { refresh: refreshToken },
        );

        const newAccessToken = refreshResponse.data.access;
        window.localStorage.setItem('accessToken', newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed: clear tokens and force login
        window.localStorage.removeItem('accessToken');
        window.localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

