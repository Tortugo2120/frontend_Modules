import { useMemo, useState, useEffect, useRef } from "react";
import { getPhrase } from "../services/PhraseService";
import { Auth } from "../context/AuthContext";
import UserMenu from "./user/UserMenu";

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

interface NavBarProps {
    collapsed: boolean;
    toggleCollapse: () => void;
}

const NavBar = ({ collapsed, toggleCollapse }: NavBarProps) => {

    const [phrase, setPhrase] = useState<string>("");
    const [author, setAuthor] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { user } = Auth();
    const currentDate = useMemo(() => {
        const today = new Date();
        return `${today.getDate()} de ${MONTH_NAMES[today.getMonth()]}, ${today.getFullYear()}`;
    }, []);

    //Obtener frase del día
    useEffect(() => {
        const fetchPhrase = async () => {
            try {
                setLoading(true);
                const data = await getPhrase();

                setPhrase(data.phrase || "La perseverancia es el camino al éxito");
                setAuthor(data.author || "Anónimo");
            } catch (error) {
                console.error("Failed to fetch phrase:", error);
                setPhrase("No dejes que lo que no puedes hacer interfiera con lo que puedes hacer.");
                setAuthor("John Wooden");
            } finally {
                setLoading(false);
            }
        };
        fetchPhrase();
    }, []);



    return (
        <nav className="navbar bg-white shadow-md px-4 sm:px-6 lg:px-8 border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center gap-4 justify-between w-full">
                <div className="flex items-center gap-3">

                    {/* Sidebar Toggle Button - Mobile */}
                    <label htmlFor="sidebar-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost text-info-content lg:hidden">
                        <i className="fa-solid fa-bars fa-xl"></i>
                    </label>

                    {/* Sidebar Toggle Button - Desktop */}
                    <button
                        onClick={toggleCollapse}
                        className="hidden lg:flex text-gray-600 hover:text-primary rounded-lg transition-colors cursor-pointer"
                        title={collapsed ? "Expandir menú" : "Contraer menú"}
                    >
                        <i className={`fas ${collapsed ? 'fa-bars' : 'fa-chevron-left'} text-2xl`}></i>
                    </button>

                    {/* Phrase of the day */}
                    <div className="hidden sm:block relative w-64 md:w-80 lg:w-150">
                        {loading ? (
                            <div className="flex items-center">
                                <i className="fas fa-quote-left text-blue-600 text-xs"></i>
                                <p className="text-sm font-normal text-gray-600 italic">Cargando frase...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <p className="text-sm font-medium text-blue-900 italic">"{phrase}"</p>
                                <p className="text-xs text-blue-700 text-right">- {author}</p>
                            </div>
                        )}
                    </div>
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
                            <span className="text-white font-medium text-sm">{user?.sub.substring(0, 2).toUpperCase()}</span>
                        </button>

                        {/* Menú desplegable */}
                        {showUserMenu && (
                            <UserMenu />
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default NavBar