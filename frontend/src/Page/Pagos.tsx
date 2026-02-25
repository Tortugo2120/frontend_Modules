import ResumenCards from "../components/pagos/ResumenCards";
import HistorialPagos from "../components/pagos/HistorialPagos";
import GraficoRecaudacion from "../components/pagos/GraficoRecaudacion";

export default function PagosDashboard() {
    return (
        <div className="min-h-screen bg-blue-300/40 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-row items-center gap-2 mb-6">
                    <div className="w-12 h-12 bg-info-content rounded-xl flex items-center justify-center shadow-lg text-2xl">
                        <i className="fas fa-credit-card text-white"></i>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-info-content">
                            Gestión de Pagos
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">Resumen y historial de pagos de solicitudes</p>
                    </div>
                </div>

                <ResumenCards />
                <HistorialPagos />
                <GraficoRecaudacion />
            </div>
        </div>
    );
}
