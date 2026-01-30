import { useMemo } from "react";

interface NavBarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const NavBar = ({ toggleSidebar, sidebarOpen }: NavBarProps) => {
    const currentDate = useMemo(() => {
        const today = new Date();
        return `${today.getDate()} de ${MONTH_NAMES[today.getMonth()]}, ${today.getFullYear()}`;
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

                    <div className="relative w-48 sm:w-64 md:w-80 lg:w-96">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input
                            type="text"
                            placeholder="Buscar expedientes, personas..."
                            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 bg-gray-50 text-sm font-normal
                            focus:outline-none focus:border-primary focus:bg-white transition-colors rounded"
                        />
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