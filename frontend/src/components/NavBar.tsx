import { useMemo, useState, useEffect } from "react";
import { getPhrase } from "../services/PhraseService";

interface NavBarProps {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
}

const MONTH_NAMES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const NavBar = ({ toggleSidebar, sidebarOpen }: NavBarProps) => {
    const [phrase, setPhrase] = useState<string>("");
    const [author, setAuthor] = useState<string>("");
    const [loading, setLoading] = useState(true);

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
    return (
        <>
            <div
                className={"bg-white px-4 sm:px-6 lg:px-10 py-4 lg:py-5 flex items-center justify-between border-b " +
                    "border-gray-200 sticky top-0 z-30"}>
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

                        <div className="w-9 h-9 lg:w-10 lg:h-10 bg-indigo-950 flex items-center rounded-full justify-center">
                            <span className="text-white font-medium text-sm">AU</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NavBar