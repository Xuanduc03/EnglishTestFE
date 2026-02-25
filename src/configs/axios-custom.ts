import axios from 'axios';
import { toast } from 'react-toastify';
let isRefreshing = false;
let refreshSubscribers: any[] = [];


// 1. Base URL - ĐƠN GIẢN
const getBaseUrl = () => {
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/"/g, '');
  }
  return 'https://localhost:7261';
};

/**
 * Hàm xử lý queue
 */
function subscribeTokenRefresh(cb: any) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}


// 2. Tạo instance đơn giản
export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
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
    if (response.data && response.data.success === false) {
      const message = response.data.detail || response.data.message || "Có lỗi xảy ra";
      toast.error(message);
      return Promise.reject(new Error(message));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/google-login")
    ) {
      return Promise.reject(error);
    }
    
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // ❗ tránh loop
    if (originalRequest.url.includes("/refresh-token")) {
      return Promise.reject(error);
    }

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const response = await axios.post(
          `${getBaseUrl()}/api/auth/refresh-token`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem("accessToken", accessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        isRefreshing = false;
        onRefreshed(accessToken);
      } catch (err) {
        isRefreshing = false;
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return new Promise((resolve) => {
      subscribeTokenRefresh((token: string) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        resolve(api(originalRequest));
      });
    });
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