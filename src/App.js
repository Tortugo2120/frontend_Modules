// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Permisos from "./pages/Permisos.tsx";
import Login from "./pages/Login.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import Navbar from "./components/NavBar.tsx";

export default function MyApp() {
  return (
    <BrowserRouter>
      <AuthProvider>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/permisos"
            element={

              <Permisos />

            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
