import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "../../context/AuthContext";

const UserMenu = () => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { user, logout } = Auth();


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

    //Cierre de sesión
    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
    };
    //Navegación de elementos del menú
    const handleMenuItemClick = (action: string) => {
        navigate(`/dashboard/user/${action}`);
        setShowUserMenu(false);
    };

    return (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {/* Header*/}
            <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-800">{user?.sub.toUpperCase()}</p>
                <p className="text-xs text-gray-500 mt-0.5">usuario@ejemplo.com</p>
            </div>

            {/* Opciones*/}
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

            <div className="border-t border-gray-200 my-1"></div>

            {/* Cerrar sesión */}
            <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors cursor-pointer">
                <i className="fas fa-sign-out-alt text-red-600 w-4"></i>
                <span>Cerrar Sesión</span>
            </button>
        </div>
    )
}

export default UserMenu