import axios from "axios";

const apiAxios = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 5000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiAxios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry){
      console.log(err.response);
        originalRequest._retry = true;

      try {
        const response = await apiAxios.post('/api/auth/refresh');
        const newAccessToken = response.data.data.token;
        localStorage.setItem('token', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiAxios(originalRequest);
      }catch (refreshError) {
        console.log(refreshError);
        localStorage.clear();
        window.location.href='/';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(err);
  }
);
export default apiAxios;