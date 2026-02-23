import { useEffect } from "react";
import useFilterApplications from "../../hooks/useFilterApplications";
import useTipoSolici from "../../hooks/useTipoSolici";
import FiltrosPagos from "./FiltrosPagos";
import TotalesPagos from "./TotalesPagos";
import TablaPagos from "./TablaPagos";
import PaginacionPagos from "./PaginacionPagos";

export default function HistorialPagos() {
    const { tiposolicitud } = useTipoSolici();

    const {
        draftFilters,
        data,
        pagination,
        loading,
        error,
        updateFilter,
        applyFilters,
        changePage,
        resetFilters,
    } = useFilterApplications();

    // Carga inicial
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { applyFilters(); }, []);

    const totalRecaudado = data
        .filter(a => a.estado === "Completada")
        .reduce((sum, a) => sum + a.precio, 0);

    const totalPorRecaudar = data
        .filter(a => a.estado !== "Completada" && a.estado !== "Anulada")
        .reduce((sum, a) => sum + a.precio, 0);

    return (
        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6 mb-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Historial de Pagos</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Solicitudes y sus estados de pago</p>
                </div>
            </div>

            <hr className="border-dashed border-gray-200 mb-5" />

            <FiltrosPagos
                filters={draftFilters}
                tiposolicitud={tiposolicitud}
                onUpdateFilter={updateFilter}
                onApply={applyFilters}
                onReset={resetFilters}
            />

            <TotalesPagos
                totalRecaudado={totalRecaudado}
                totalPorRecaudar={totalPorRecaudar}
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
