import { Route, Routes, BrowserRouter } from "react-router-dom"
import './App.css'
import Login from './Page/Login'
import Dashboard from "./layout/Dashboard.tsx";
import Home from "./Page/Home.tsx";
import Pagos from "./Page/Pagos.tsx";
import NewRequest from "./Page/requests/new.tsx";
import History from "./Page/requests/history.tsx";
import { Reportes } from "./Page/Reportes.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import {ApplicationProvider} from "./context/ApplicationContext.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import VerDocumento from "./Page/documents/SeeDoc.tsx";
import EmitirDocumentos from "./Page/documents/issueDoc.tsx";
import Perfil from "./Page/user/perfil.tsx";
import Inbox from "./Page/user/inbox.tsx";
import ConfigUser from "./Page/user/configUser.tsx";
import { Detalles } from "./Page/requests/details.tsx";
import Update from "./Page/requests/update_requeriments.tsx";


function App() {

    return (
            <BrowserRouter>
                <AuthProvider>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path={"/dashboard"} element={
                        <ProtectedRoute>
                            <ApplicationProvider>
                                <Dashboard />
                            </ApplicationProvider>
                        </ProtectedRoute>
                    }>
                        <Route index element={<Home />} />
                        <Route path={"Home"} element={<Home />} />
                        <Route path={"solicitud/new"} element={<NewRequest />} />
                        <Route path={"solicitud/history"} element={<History />} />
                        <Route path={"solicitud/detalles/:id"} element={<Detalles />} />
                        <Route path={"actualizar/requerimientos/:id"} element={<Update />} />
                        <Route path={"documentos/emitir"} element={<EmitirDocumentos />} />
                        <Route path={"documentos/ver"} element={<VerDocumento />} />
                        <Route path={"pagos"} element={<Pagos />} />
                        <Route path={"reportes"} element={<Reportes />} />
                        <Route path={"user/perfil"} element={<Perfil />} />
                        <Route path={"user/inbox"} element={<Inbox />} />
                        <Route path={"user/config"} element={<ConfigUser />} />
                    </Route>
                </Routes>
                </AuthProvider>
            </BrowserRouter>
    )
}

export default App