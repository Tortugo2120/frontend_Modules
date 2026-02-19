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
import Update from "./Page/requests/update/update_requeriments.tsx";
import Update_Page from "./Page/requests/update.tsx";
import Testigos_update from "./Page/requests/update/witnesses_update.tsx";
import DetallesMatrimonio_update from "./Page/requests/update/weddingdetails_update.tsx";
import Pagos_update from "./Page/requests/update/payments.tsx";


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
                        <Route path={"solicitud/detalles"} element={<Detalles />} />
                        
                        {/* Rutas de actualización */}
                        <Route path={"actualizar/requerimientos"} element={<Update />} />
                        <Route path={"actualizar/testigos"} element={<Testigos_update />} />
                        <Route path={"actualizar/matrimonio"} element={<DetallesMatrimonio_update />} />
                        <Route path={"actualizar/pagos"} element={<Pagos_update />} />
                        <Route path={"actualizar"} element={<Update_Page />} />

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