import axios from "axios";
import { url_pam } from "../config";

const api = axios.create({
  baseURL: url_pam, // Thay thế bằng API của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

// Tạo một instance axios riêng cho refresh token
const refreshApi = axios.create({
  baseURL: url_pam,
  headers: {
    "Content-Type": "application/json",
  },
});

// Biến để lưu trữ request đang chờ retry
let isRefreshing = false;
let failedQueue: any = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          const refresh_token = localStorage.getItem("refresh_token"); // Giả sử bạn lưu refresh token trong localStorage
          if (!refresh_token) {
            localStorage.setItem(
              "redirectAfterLogin",
              window.location.pathname
            );
            localStorage.removeItem("access_token");
            window.location.href = "/login";
            return Promise.reject(error);
          }

          const response = await refreshApi.post(
            "/user/refresh",
            {
              refresh_token,
            },
            {
              headers: {
                "Content-Type": "application/json", // Header bạn muốn thêm
                "refresh-token": `Bearer ${refresh_token}`,
              },
            }
          );

          const newToken = response.data.access_token; // Giả sử API trả về token mới trong response.data.token
          localStorage.setItem("access_token", newToken);
          const redirectPath = localStorage.getItem("redirectAfterLogin");
          if (redirectPath) {
            localStorage.removeItem("redirectAfterLogin");
            window.location.href = redirectPath;
            return;
          }
          processQueue(null, newToken);

          // Retry request ban đầu với token mới
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
    }

    return Promise.reject(error);
  }
);

// Thêm interceptor cho refreshApi để tránh vòng lặp vô hạn
refreshApi.interceptors.request.use(
  (config) => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      config.headers.Authorization = `Bearer ${refreshToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
