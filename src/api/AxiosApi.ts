import axios from "axios";

const axiosApi = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 5000,
    headers: {'Content-Type': 'application/json'},
});

axiosApi.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosApi.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

export default axiosApi;