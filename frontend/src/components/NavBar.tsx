import { useMemo, useState, useEffect, useRef } from "react";
import { getPhrase } from "../services/PhraseService";
import { useNavigate } from "react-router-dom";

interface NavBarProps {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
}

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];


const NavBar = ({ toggleSidebar, sidebarOpen }: NavBarProps) => {
    const navigate = useNavigate();
    const [phrase, setPhrase] = useState<string>("");
    const [author, setAuthor] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const currentDate = useMemo(() => {
        const today = new Date();
        return `${today.getDate()} de ${MONTH_NAMES[today.getMonth()]}, ${today.getFullYear()}`;
    }, []);

    useEffect(() => {
        const fetchPhrase = async () => {
            try {
                setLoading(true);
                const data = await getPhrase();
                setPhrase(data.phrase || "");
                setAuthor(data.author || "");
            } catch (error) {
                console.error("Failed to fetch phrase:", error);
                setPhrase("La perseverancia es el camino al éxito");
                setAuthor("Desconocido");
            } finally {
                setLoading(false);
            }
        };
        fetchPhrase();
    }, []);

    // Cerrar el menú cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showUserMenu]);

    const handleLogout = () => {
        // Aquí implementa tu lógica de cierre de sesión
        navigate('/');
        console.log("Cerrando sesión...");
        setShowUserMenu(false);
    };

    const handleMenuItemClick = (action: string) => {
        navigate(`/dashboard/user/${action}`);
        setShowUserMenu(false);
        // Aquí puedes navegar a las diferentes secciones
    };

    return (
        <>
            <div className={"bg-white shadow-md px-4 sm:px-6 lg:px-10 py-4 lg:py-5 flex items-center justify-between border-b " + "border-gray-200 sticky top-0 z-30"}>
                <div className="flex items-center gap-4 justify-between w-full">
                    <button
                        aria-controls="sidebar"
                        aria-expanded={sidebarOpen}
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors">
                        <i className="fas fa-bars text-xl"></i>
                    </button>

                    <div className="hidden sm:block relative w-64 md:w-80 lg:w-150">
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <i className="fas fa-quote-left text-blue-600 text-xs"></i>
                                <p className="text-sm font-normal text-gray-600 italic">Cargando frase...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium text-blue-900 italic">"{phrase}"</p>
                                <p className="text-xs text-blue-700 text-right">- {author}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
                        {currentDate && (
                            <div className="hidden md:flex items-center gap-2 text-gray-600">
                                <i className="fas fa-calendar-alt text-sm"></i>
                                <span className="text-sm font-normal">{currentDate}</span>
                            </div>
                        )}

                        <button className="relative p-2 text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors">
                            <i className="fas fa-bell text-lg"></i>
                            <span className="absolute top-1.5 rounded-full right-1.5 w-2 h-2 bg-red-500"></span>
                        </button>

                        {/* Avatar con menú desplegable */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="w-9 h-9 lg:w-10 lg:h-10 bg-indigo-950 flex items-center rounded-full justify-center hover:ring-2 hover:ring-indigo-400 transition-all cursor-pointer">
                                <span className="text-white font-medium text-sm">AU</span>
                            </button>

                            {/* Menú desplegable */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    {/* Header del menú */}
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-800">Mi Cuenta</p>
                                        <p className="text-xs text-gray-500 mt-0.5">usuario@ejemplo.com</p>
                                    </div>

                                    {/* Opciones del menú */}
                                    <div className="py-1">
                                        <button
                                            onClick={() => handleMenuItemClick('perfil')}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors">
                                            <i className="fas fa-user text-gray-500 w-4"></i>
                                            <span>Mi Perfil</span>
                                        </button>

                                        <button
                                            onClick={() => handleMenuItemClick('config')}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors">
                                            <i className="fas fa-cog text-gray-500 w-4"></i>
                                            <span>Configuración</span>
                                        </button>

                                        <button
                                            onClick={() => handleMenuItemClick('inbox')}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors">
                                            <i className="fas fa-inbox text-gray-500 w-4"></i>
                                            <span>Inbox</span>
                                        </button>
                                    </div>

                                    {/* Separador */}
                                    <div className="border-t border-gray-200 my-1"></div>

                                    {/* Cerrar sesión */}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                                        <i className="fas fa-sign-out-alt text-red-600 w-4"></i>
                                        <span>Cerrar Sesión</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NavBar