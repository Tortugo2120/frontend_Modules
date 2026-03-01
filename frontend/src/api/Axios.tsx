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
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Instancia separada SOLO para el refresh token.
// No tiene interceptores → no agrega el access token expirado en el header.
// Solo viaja la cookie HttpOnly del refresh token (withCredentials: true).
const refreshAxios = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 5000,
  withCredentials: true,
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

// Rutas excluidas del refresh automático:
// - /api/auth/login  → 401 aquí = credenciales incorrectas, no token expirado
// - /api/auth/logout → no necesita refresh
const AUTH_ROUTES = ['/api/auth/login', '/api/v1/logout'];

apiAxios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const requestUrl: string = originalRequest?.url ?? '';

    const isAuthRoute = AUTH_ROUTES.some(route => requestUrl.includes(route));

    if (err.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        // Usar refreshAxios (sin interceptores) para que NO envíe el access token expirado.
        // Solo viaja la cookie HttpOnly del refresh token.
        const response = await refreshAxios.post('/api/auth/refresh');
        const newAccessToken = response.data.data.token;

        if (_onTokenRefreshed) {
          _onTokenRefreshed(newAccessToken);
        } else {
          sessionStorage.setItem('token', newAccessToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiAxios(originalRequest);
      } catch (refreshError) {
        console.warn("Refresh token inválido o expirado, cerrando sesión...", refreshError);
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(err);
  }
);

// Función pública para intentar el refresh manualmente (usada por AuthContext al montar)
export const tryRefreshToken = async (): Promise<string | null> => {
  try {
    const response = await refreshAxios.post('/api/auth/refresh');
    return response.data.data.token as string;
  } catch {
    return null;
  }
};

export default apiAxios;

