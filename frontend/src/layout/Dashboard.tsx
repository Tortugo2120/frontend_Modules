import {Nav} from "../components/Nav.tsx";
import {Outlet} from "react-router-dom";
import {useState} from "react";

export default function Dashboard(){
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(v => !v);
    const closeSidebar = () => setSidebarOpen(false);

    return(
        <div className={"flex min-h-screen"}>
            {/* backdrop for mobile when sidebar is open */}
            <div
                className={`${sidebarOpen ? 'block' : 'hidden'} lg:hidden fixed inset-0 bg-black/40 z-40`}
                onClick={closeSidebar}
            />

            <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-72 bg-primary text-white flex flex-col min-h-screen fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 lg:translate-x-0 lg:static`}>
                <div className="px-8 py-7 border-b border-primary-light/30">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-white flex items-center justify-center shrink-0">
                            <i className="fas fa-landmark text-primary text-lg"></i>
                        </div>
                        <div>
                            <h1 className="text-base font-semibold tracking-wide">MUNICIPALIDAD</h1>
                            <p className="text-blue-200 text-xs font-normal">José Leonardo Ortiz</p>
                        </div>
                    </div>
                </div>
                <Nav onLinkClick={closeSidebar} />
                <div className="px-5 py-5 border-t border-primary-light/30">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-10 h-10 bg-slate flex items-center justify-center shrink-0">
                            <i className="fas fa-user text-white text-sm"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">Admin Usuario</p>
                            <p className="text-blue-200 text-xs font-normal">Administrador</p>
                        </div>
                        <button className="text-blue-200 hover:text-white transition-colors p-2">
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </aside>
            <main className={"flex-1 lg:ml-72 min-h-screen"}>
                {/* pasar toggleSidebar a las rutas hijas (Home) */}
                <Outlet context={{toggleSidebar, sidebarOpen}} />
            </main>
        </div>
    )
}