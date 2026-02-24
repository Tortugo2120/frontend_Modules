import { useEffect } from "react";
import useFilterApplications from "../../hooks/useFilterApplications";
import useTipoSolici from "../../hooks/useTipoSolici";
import FiltrosPagos from "./FiltrosPagos";

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



    return (
        <div className="bg-white rounded-md shadow-sm border border-gray-100 p-6 mb-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Historial de Pagos</h2>
                    <p className="text-base text-gray-400 mt-0.5">Solicitudes y sus estados de pago</p>
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
