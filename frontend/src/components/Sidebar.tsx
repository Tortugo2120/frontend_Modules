import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

type NavProps = {
    setActiveView?: (view: string) => void;
    collapsed?: boolean;
    onExpand?: () => void;
}

type NavItemProps = {
    to: string;
    icon: string;
    label: string;
    collapsed: boolean;
    isActive: boolean;
}

function NavItem({ to, icon, label, collapsed, isActive }: NavItemProps) {
    return (
        <li>
            <Link
                to={to}
                className={`group relative flex items-center rounded-lg transition-all duration-200
                    ${collapsed ? 'justify-center w-10 h-10 mx-auto p-0' : 'gap-3 px-4 py-3'}
                    ${isActive
                        ? 'bg-white/15 text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
            >
                <i className={`${icon} text-xl w-5 text-center shrink-0 transition-colors duration-200
                    ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}
                ></i>
                <span className={`font-medium text-base whitespace-nowrap transition-all duration-300
                    ${collapsed ? 'hidden' : 'opacity-100'}`}
                >
                    {label}
                </span>

                {collapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-gray-900 text-white text-base font-medium
                        opacity-0 invisible group-hover:opacity-100 group-hover:visible
                        transition-all duration-200 pointer-events-none z-50 shadow-lg whitespace-nowrap">
                        {label}
                    </span>
                )}

                {isActive && (
                    <span className={`absolute ${collapsed ? '-left-1' : 'left-0'} top-1/2 -translate-y-1/2 w-0.75 h-5 bg-white rounded-r-full`}></span>
                )}
            </Link>
        </li>
    );
}

export function Nav({ collapsed = false, onExpand }: NavProps) {
    const [openSolicitudes, setOpenSolicitudes] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (collapsed) setOpenSolicitudes(false);
    }, [collapsed]);

    const handleSolicitudesToggle = () => {
        if (collapsed && onExpand) {
            onExpand();
            // Abrir submenú después de expandir
            setTimeout(() => setOpenSolicitudes(true), 150);
            return;
        }
        setOpenSolicitudes(!openSolicitudes);
    };

    const isActive = (path: string) => location.pathname.startsWith(path);
    const isSolicitudesActive = isActive("/dashboard/solicitud");

    return (
        <nav className="flex-1 overflow-y-hidden overflow-x-hidden py-3" aria-label="Primary">
            <ul className={`flex flex-col gap-2 ${collapsed ? 'px-2 items-center' : 'px-3'}`}>
                {/* Inicio */}
                <NavItem
                    to="/dashboard/Home"
                    icon="fas fa-th-large"
                    label="Inicio"
                    collapsed={collapsed}
                    isActive={isActive("/dashboard/Home")}
                />

                {/* Solicitudes */}
                <li>
                    <button
                        onClick={handleSolicitudesToggle}
                        className={`group relative flex items-center rounded-lg transition-all duration-200 
                            ${collapsed ? 'justify-center w-10 h-10 mx-auto p-0' : 'gap-3 px-4 py-3 justify-between w-full'}
                            ${isSolicitudesActive
                                ? 'bg-white/15 text-white font-semibold shadow-sm'
                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <div className={`flex cursor-pointer items-center ${collapsed ? '' : 'gap-3'}`}>
                            <i className={`fas fa-folder-open text-lg w-5 text-center shrink-0 transition-colors duration-200 cursor-pointer
                                ${isSolicitudesActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}
                            ></i>
                            <span className={`font-medium text-base whitespace-nowrap transition-all duration-300
                                ${collapsed ? 'hidden' : 'opacity-100'}`}
                            >
                                Solicitudes
                            </span>
                        </div>
                        {!collapsed && (
                            <i className={`fas fa-chevron-down transition-transform duration-300 text-xs text-slate-400
                                ${openSolicitudes ? 'rotate-180' : ''}`}
                            ></i>
                        )}

                        {/* Tooltip cuando está colapsado */}
                        {collapsed && (
                            <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-gray-900 text-white text-xs font-medium
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                transition-all duration-200 pointer-events-none z-50 shadow-lg whitespace-nowrap">
                                Solicitudes
                            </span>
                        )}

                        {/* Indicador activo */}
                        {isSolicitudesActive && (
                            <span className={`absolute ${collapsed ? '-left-1' : 'left-0'} top-1/2 -translate-y-1/2 w-0.75 h-5 bg-white rounded-r-full`}></span>
                        )}
                    </button>

                    {/* Submenú con animación */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out
                        ${openSolicitudes && !collapsed ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
                    >
                        <ul className="ml-4 pl-3 border-l border-slate-600/50 space-y-1">
                            <li>
                                <Link
                                    to="/dashboard/solicitud/new"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                                        ${isActive("/dashboard/solicitud/new")
                                            ? 'text-white bg-white/10'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <i className="fas fa-plus text-xs w-4 text-center"></i>
                                    <span>Crear solicitud</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/dashboard/solicitud/history"
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
                                        ${isActive("/dashboard/solicitud/history")
                                            ? 'text-white bg-white/10'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <i className="fas fa-history text-xs w-4 text-center"></i>
                                    <span>Ver historial</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </li>

                {/* Pagos */}
                <NavItem
                    to="/dashboard/pagos"
                    icon="fas fa-wallet"
                    label="Pagos"
                    collapsed={collapsed}
                    isActive={isActive("/dashboard/pagos")}
                />

                {/* Reportes */}
                <NavItem
                    to="/dashboard/reportes"
                    icon="fas fa-chart-bar"
                    label="Reportes"
                    collapsed={collapsed}
                    isActive={isActive("/dashboard/reportes")}
                />
            </ul>
        </nav>
    );
}