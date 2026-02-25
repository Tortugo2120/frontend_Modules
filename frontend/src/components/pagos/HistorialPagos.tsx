import { useEffect } from "react";
import usePaymentHistory from "../../hooks/usePaymentHistory";
import useTipoSolici from "../../hooks/useTipoSolici";
import FiltrosPagos from "./FiltrosPagos";
import TablaPagos from "./TablaPagos";
import PaginacionPagos from "./PaginacionPagos";

export default function HistorialPagos() {
    const { tiposolicitud } = useTipoSolici();

    const {
        data,
        pagination,
        loading,
        error,
        filters,
        updateFilter,
        applyFilters,
        changePage,
        resetFilters,
    } = usePaymentHistory();

    useEffect(() => { applyFilters(); }, []);

    return (
        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6 mb-6">
            {/* Header */}
            <div className="flex flex-row items-center gap-2 mb-6">
                <div className="w-12 h-12 bg-info-content rounded-xl flex items-center justify-center shadow-lg text-2xl">
                    <i className="fas fa-history text-white"></i>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-info-content">
                        Historial de Pagos
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">Consulta el historial de pagos realizados por solicitudes</p>
                </div>
            </div>

            <FiltrosPagos
                filters={filters}
                tiposolicitud={tiposolicitud}
                onUpdateFilter={updateFilter}
                onApply={applyFilters}
                onReset={resetFilters}
            />

            <TablaPagos data={data} loading={loading} error={error} />

            {pagination && (
                <PaginacionPagos
                    pagination={pagination}
                    onPrev={() => changePage(pagination.currentPage - 1)}
                    onNext={() => changePage(pagination.currentPage + 1)}
                />
            )}
        </div>
    );
}
