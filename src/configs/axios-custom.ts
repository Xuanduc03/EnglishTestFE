import axios from 'axios';
import { toast } from 'react-toastify';

// 1. Base URL - ĐƠN GIẢN
const getBaseUrl = () => {
  // Nếu dùng Vite
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/"/g, '');
  }
  // // Nếu dùng React
  // if (process.env?.REACT_APP_BASE_API_URL) {
  //   return process.env.REACT_APP_BASE_API_URL.replace(/"/g, '');
  // }
  // Mặc định
  return 'https://localhost:7261';
};

// 2. Tạo instance đơn giản
export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000, // 30 giây
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào Header cho mọi request của biến 'api'
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. INTERCEPTOR ĐƠN GIẢN - chỉ xử lý token
api.interceptors.response.use(
  (response) => {
    // Nếu BE trả success = false -> show lỗi luôn
    if (response.data && response.data.success === false) {
      const message = response.data.detail || response.data.message || "Có lỗi xảy ra";
      toast.error(message);
      return Promise.reject(new Error(message));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ---- REFRESH TOKEN ----
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${getBaseUrl()}/api/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
     const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Có lỗi hệ thống";

    toast.error(message);

    return Promise.reject(error);
  }
);

// 5. Upload instance (nếu cần upload file)
export const apiUpload = axios.create({
  baseURL: getBaseUrl(),
  timeout: 300000, // 5 phút cho upload
  headers: {
  },
});

// Thêm token cho upload
apiUpload.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);