import axios from "axios";

// Callback registrado por AuthContext para actualizar el estado React
// cuando Axios refresca el token exitosamente
let _onTokenRefreshed: ((token: string) => void) | null = null;

export const registerAuthCallbacks = (
  onTokenRefreshed: (token: string) => void,
) => {
  _onTokenRefreshed = onTokenRefreshed;
};

const apiAxios = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 5000,
  withCredentials: true, // envía la cookie del refresh token automáticamente
  headers: {
    "Content-Type": "application/json",
  },
});

apiAxios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiAxios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // El refresh token viaja como cookie (withCredentials: true)
        const response = await apiAxios.post('/api/auth/refresh');
        const newAccessToken = response.data.data.token;

        // Notificar al AuthContext para actualizar user + sessionStorage
        if (_onTokenRefreshed) {
          _onTokenRefreshed(newAccessToken);
        } else {
          sessionStorage.setItem('token', newAccessToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiAxios(originalRequest);
      } catch (refreshError) {
        console.warn("Refresh token inválido o expirado, cerrando sesión...", refreshError);
        // Limpiar storage y redirigir al login de forma segura
        // (sin depender del contexto React que puede no estar disponible)
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(err);
  }
);

export default apiAxios;

