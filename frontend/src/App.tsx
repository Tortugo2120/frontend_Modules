import { Route, Routes, BrowserRouter } from "react-router-dom"
import './App.css'
import Login from './Page/Login'
import Dashboard from "./layout/Dashboard.tsx";
import Home from "./Page/Home.tsx";
import Pagos from "./Page/Pagos.tsx";
import NewRequest from "./Page/requests/new.tsx";
import History from "./Page/requests/history.tsx";
import Documentos from "./Page/Documentos.tsx";
import { Reportes } from "./Page/Reportes.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";

function App() {

    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path={"/dashboard"} element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Home />} />
                        <Route path={"Home"} element={<Home />} />
                        <Route path={"solicitud/new"} element={<NewRequest />} />
                        <Route path={"solicitud/history"} element={<History />} />
                        <Route path={"pagos"} element={<Pagos />} />
                        <Route path={"documentos"} element={<Documentos />} />
                        <Route path={"reportes"} element={<Reportes />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App