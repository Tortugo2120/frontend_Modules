import {useOutletContext} from "react-router-dom";

type OutletContext = {
    toggleSidebar: () => void;
    sidebarOpen: boolean;
}

export default function Home (){
    const {toggleSidebar, sidebarOpen} = useOutletContext<OutletContext>();

    return(
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

                        <div className="hidden md:flex items-center gap-2 text-gray-600">
                            <i className="fas fa-calendar-alt text-sm"></i>
                            <span className="text-sm font-normal">28 de Enero, 2026</span>
                        </div>


                        <button className="relative p-2 text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors">
                            <i className="fas fa-bell text-lg"></i>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500"></span>
                        </button>

                        <div className="w-9 h-9 lg:w-10 lg:h-10 bg-primary flex items-center justify-center">
                            <span className="text-white font-medium text-sm">AU</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-10">
                <div className="mb-6 lg:mb-10">
                    <h2 className="text-xl lg:text-2xl font-semibold text-gray-800">Panel de Control</h2>
                    <p className="text-gray-500 mt-1.5 lg:mt-2 font-normal text-sm lg:text-base">Resumen general del sistema de Registro Civil</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-10">

                    <div className="bg-white overflow-hidden shadow-sm">
                        <div className="bg-primary px-5 lg:px-6 py-4">
                            <h3 className="text-white font-medium text-sm">Solicitudes Pendientes</h3>
                        </div>
                        <div className="px-5 lg:px-6 py-6 lg:py-7">
                            <p className="text-3xl lg:text-4xl font-bold text-gray-800">24</p>
                            <p className="text-gray-500 text-sm mt-2 lg:mt-3 font-normal">
                                <span className="text-accent font-medium">+3</span> desde ayer
                            </p>
                        </div>
                    </div>


                    <div className="bg-white overflow-hidden shadow-sm">
                        <div className="bg-green-600 px-5 lg:px-6 py-4">
                            <h3 className="text-white font-medium text-sm">Trámites Completados</h3>
                        </div>
                        <div className="px-5 lg:px-6 py-6 lg:py-7">
                            <p className="text-3xl lg:text-4xl font-bold text-gray-800">156</p>
                            <p className="text-gray-500 text-sm mt-2 lg:mt-3 font-normal">
                                <span className="text-success font-medium">+12%</span> este mes
                            </p>
                        </div>
                    </div>


                    <div className="bg-white overflow-hidden shadow-sm">
                        <div className="bg-orange-400 px-5 lg:px-6 py-4">
                            <h3 className="text-white font-medium text-sm">Pagos Registrados</h3>
                        </div>
                        <div className="px-5 lg:px-6 py-6 lg:py-7">
                            <p className="text-3xl lg:text-4xl font-bold text-gray-800">S/ 8,420</p>
                            <p className="text-gray-500 text-sm mt-2 lg:mt-3 font-normal">
                                <span className="text-warning font-medium">Hoy:</span> S/ 1,250
                            </p>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm">
                        <div className="bg-red-600 px-5 lg:px-6 py-4">
                            <h3 className="text-white font-medium text-sm">Documentos Pendientes</h3>
                        </div>
                        <div className="px-5 lg:px-6 py-6 lg:py-7">
                            <p className="text-3xl lg:text-4xl font-bold text-gray-800">7</p>
                            <p className="text-gray-500 text-sm mt-2 lg:mt-3 font-normal">
                                <span className="text-danger font-medium">Urgentes:</span> 2
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}