import { useApplicationHistory } from "../../hooks/useApplicationHistory";
import { useMemo, useState } from "react";
import useFilterApplications from "../../hooks/useFilterApplications.ts";
import Alert from "../../components/Alert.tsx";
import TableList from "../../components/requests/history/TableList.tsx";
type AdvancedFiltersForm = {
    beginDate: string;
    endDate: string;
    applicationType: string;
};
import { ExportApplicationsExcel } from "../../services/AplicationServices.ts";

export default function History() {
    const {
        solicitudes,
        loading,
        error,
        filtros,
        setFiltros,
        paginaActual,
        totalPaginas,
        totalRegistros,
        cambiarPagina
    } = useApplicationHistory();
    const states = new Map<number, string>([[1, "Pendiente"], [2, "En Proceso"], [3, "Completado"], [4, "Anulado"]]);
    const typeApplication = new Map<number, string>([[1, "Matrimonio"], [2, "Divorcio"]]);
    const [filtersAvanzados, setFiltersAvanzados] = useState<Map<string, string>>(new Map());
    const [showAlert, setShowAlert] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    // Estado controlado para los inputs de filtros avanzados
    const [advancedForm, setAdvancedForm] = useState<AdvancedFiltersForm>({
        beginDate: "",
        endDate: "",
        applicationType: ""
    });

    const { enabled, updateFilter, data, applyFilters, applyQuickState, resetFilters } = useFilterApplications();

    const getQuickStateBtnVariant = (stateLabel: string): string => {
        const normalized = stateLabel.trim().toLowerCase();
        if (normalized.includes("pendiente")) return "btn-warning";
        if (normalized.includes("proceso")) return "btn-info";
        if (normalized.includes("avanz") || normalized.includes("complet")) return "btn-success";
        if (normalized.includes("cancel") || normalized.includes("anul")) return "btn-error";
        return "";
    };

    const stateSelect = (state: string) => {
        console.log("estado seleccionado: ", state);
        applyQuickState(state);
        console.log("data del estado seleccionado: ", data)
    }

    const handleFiltersAvanzadosChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target;
        const name = target.name;
        const value = target.value;

        // Actualizar el formulario controlado
        setAdvancedForm(prev => ({
            ...prev,
            [name]: value
        }));

        setFiltersAvanzados((prev) => {
            const next = new Map(prev);
            if (value === "") next.delete(name);
            else next.set(name, value);
            return next;
        });
        if (name === "applicationType") {
            updateFilter("ApplicationType", value === "" ? 0 : Number(value));
        } else if (name === "beginDate") {
            updateFilter("beginDate", value);
        } else if (name === "endDate") {
            updateFilter("endDate", value);
        }
    }

    const tableData = useMemo(() => {
        const sourceData = enabled ? data : solicitudes;

        // Eliminar duplicados basados en el ID
        return sourceData.filter((item, index, self) =>
            index === self.findIndex((t) => t.id === item.id)
        );
    }, [enabled, data, solicitudes]);

    const aplicarFiltros = () => {
        console.log(filtersAvanzados.size);
        console.log(filtersAvanzados);
        if (filtersAvanzados.size <= 0) {
            setShowAlert(true);
            return;
        }
        applyFilters();

        // Resetear los inputs del formulario
        setAdvancedForm({
            beginDate: "",
            endDate: "",
            applicationType: ""
        });
        setFiltersAvanzados(new Map());
    }

    const volverAHistorial = () => {
        // Resetear filtros del hook
        resetFilters();

        // Limpiar formulario visual
        setAdvancedForm({
            beginDate: "",
            endDate: "",
            applicationType: ""
        });
        setFiltersAvanzados(new Map());
        setShowAlert(false);
    }

    const handleExportExcel = async () => {
        setIsExportingExcel(true);
        try {
            const applicationType = filtersAvanzados.get('applicationType');
            await ExportApplicationsExcel({
                state: filtersAvanzados.get('state') || undefined,
                beginDate: filtersAvanzados.get('beginDate') || undefined,
                endDate: filtersAvanzados.get('endDate') || undefined,
                ApplicationType: applicationType ? parseInt(applicationType) : undefined,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsExportingExcel(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                    <p className="text-gray-500 font-medium">Cargando solicitudes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Error al cargar</h3>
                        <p className="text-gray-600 text-center">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                            <i className="fas fa-redo mr-2"></i>
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-300/40 from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-6">
            {/* Header */}
            <div className=" mx-auto mb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-info-content rounded-xl flex items-center justify-center shadow-lg">
                            <i className="fas fa-history text-white text-lg sm:text-xl"></i>
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Historial de Solicitudes</h1>
                            <p className="text-gray-600 text-xs sm:text-sm mt-1">
                                {totalRegistros} solicitud{totalRegistros !== 1 ? 'es' : ''} encontrada{totalRegistros !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-xl p-3 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                            <i className="fas fa-filter text-slate-600"></i>
                            Filtros de Búsqueda
                        </h3>
                        {/*
                        {(filtros.busqueda || filtros.tipo || filtros.estado) && (
                            <button
                                onClick={limpiarFiltros}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
                            >
                                <i className="fas fa-times-circle"></i> Limpiar filtros
                            </button>
                        )}
                        */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Búsqueda por Expediente o DNI */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={filtros.busqueda}
                                    onChange={(e) => setFiltros({ busqueda: e.target.value })}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Buscar por número de expediente o DNI..." 
                                />
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                {filtros.busqueda && (
                                    <button
                                        onClick={() => setFiltros({ busqueda: "" })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        title="Limpiar búsqueda"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className={"lg:col-span-2"}>
                            <form className={"flex flex-col md:flex-row gap-2"}>
                                {
                                    Array.from(states.entries()).map(([key, value]) => (
                                        <input
                                            key={key}
                                            type="radio"
                                            name="state"
                                            value={value}
                                            aria-label={value}
                                            className={`btn btn-outline ${getQuickStateBtnVariant(value)} flex-1 text-md`}
                                            onChange={(e) => stateSelect(e.target.value)}
                                        />
                                    ))
                                }
                                <input
                                    className="btn btn-outline btn-square flex-1"
                                    type="reset"
                                    value="X"
                                    onClick={volverAHistorial}
                                />
                            </form>
                        </div>
                    </div>

                    {/* Indicadores de filtros activos */}
                    {/*
                    {(filtros.busqueda || filtros.tipo || filtros.estado) && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="text-sm text-gray-600 font-medium">Filtros activos:</span>
                            {filtros.busqueda && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                    <i className="fas fa-search text-xs"></i>
                                    "{filtros.busqueda}"
                                    <button
                                        onClick={() => setFiltros({ busqueda: "" })}
                                        className="hover:text-indigo-900 transition-colors"
                                        title="Quitar filtro"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </span>
                            )}
                            {filtros.tipo && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    <i className="fas fa-file-alt text-xs"></i>
                                    {filtros.tipo}
                                    <button
                                        onClick={() => setFiltros({ tipo: "" })}
                                        className="hover:text-blue-900 transition-colors"
                                        title="Quitar filtro"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </span>
                            )}
                            {filtros.estado && (
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    <i className="fas fa-info-circle text-xs"></i>
                                    {filtros.estado}
                                    <button
                                        onClick={() => setFiltros({ estado: "" })}
                                        className="hover:text-green-900 transition-colors"
                                        title="Quitar filtro"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                    */}
                </div>

                {/* Filtros avanzados */}
                <div className="bg-white rounded-xl shadow-xl p-3 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-lg">
                            <i className="fas fa-filter text-slate-600"></i>
                            Filtros Avanzados
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor={"beginDate"}>Desde</label>
                            <input
                                type="date"
                                name="beginDate"
                                id={"beginDate"}
                                className={"input w-full input-lg outline-0"}
                                value={advancedForm.beginDate}
                                onChange={handleFiltersAvanzadosChange}
                            />
                        </div>

                        <div>
                            <div>
                                <label htmlFor={"endDate"}>Hasta</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    id={"endDate"}
                                    className={"input w-full input-lg outline-0"}
                                    value={advancedForm.endDate}
                                    onChange={handleFiltersAvanzadosChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor={"applicationType"}>Tipo de solicitud</label>
                            <select
                                name={"applicationType"}
                                id={"applicationType"}
                                className="select select-lg w-full px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all "
                                value={advancedForm.applicationType}
                                onChange={handleFiltersAvanzadosChange}
                            >
                                <option value="">Seleccionar</option>
                                {
                                    Array.from(typeApplication.entries()).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))
                                }
                            </select>
                        </div>

                        <button
                            type={"button"}
                            className={"btn btn-primary flex-1 text-[18px] font-medium"}
                            onClick={aplicarFiltros}
                        >
                            Aplicar
                        </button>
                        <button
                            type={"button"}
                            disabled={isExportingExcel}
                            className={"btn bg-green-600 flex-1 text-white font-medium hover:bg-green-700 disabled:bg-gray-400"}
                            onClick={handleExportExcel}
                        >
                            {isExportingExcel ? (
                                <><i className="fas fa-spinner fa-spin"></i> Exportando...</>
                            ) : (
                                <><i className="fas fa-file-excel "></i> Exportar </>
                            )}
                        </button>
                        <button
                            type={"button"}
                            className={"btn btn-outline flex-1 text-[18px] font-medium"}
                            onClick={volverAHistorial}
                            disabled={!enabled}
                            title="Volver a mostrar el historial completo"
                        >
                            <i className="fas fa-undo mr-2"></i>
                            Limpiar
                        </button>

                        {showAlert && (
                            <div className={"col-span-full"}>
                                <Alert
                                    message={"Seleccione al menos un filtro para avanzar"}
                                    type={"warning"}
                                    onClose={() => setShowAlert(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Paginación */}
            {totalPaginas > 1 && (
                <div className="flex flex-col sticky top-18 z-30 sm:flex-row items-center justify-between gap-2 sm:gap-4 mt-4 sm:mt-6 bg-white rounded-t-md shadow-lg px-3 sm:px-5 py-2 sm:py-3">
                    <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                        <span className="hidden sm:inline">Mostrando {solicitudes.length} de {totalRegistros} solicitudes</span>
                        <span className="sm:hidden">{solicitudes.length}/{totalRegistros}</span>
                        {' '}(Pág. {paginaActual}/{totalPaginas})
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                        <button
                            onClick={() => cambiarPagina(1)}
                            disabled={paginaActual === 1}
                            className="btn btn-sm bg-white border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            title="Primera página"
                        >
                            <i className="fas fa-angle-double-left"></i>
                        </button>
                        <button
                            onClick={() => cambiarPagina(paginaActual - 1)}
                            disabled={paginaActual === 1}
                            className="btn btn-sm bg-white border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>

                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                                let pageNum;
                                if (totalPaginas <= 5) {
                                    pageNum = i + 1;
                                } else if (paginaActual <= 3) {
                                    pageNum = i + 1;
                                } else if (paginaActual >= totalPaginas - 2) {
                                    pageNum = totalPaginas - 4 + i;
                                } else {
                                    pageNum = paginaActual - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => cambiarPagina(pageNum)}
                                        className={`btn btn-sm ${paginaActual === pageNum
                                            ? 'bg-info-content text-white hover:bg-info-content/95'
                                            : 'bg-white border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => cambiarPagina(paginaActual + 1)}
                            disabled={paginaActual === totalPaginas}
                            className="btn btn-sm bg-white border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                        <button
                            onClick={() => cambiarPagina(totalPaginas)}
                            disabled={paginaActual === totalPaginas}
                            className="btn btn-sm bg-white border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            title="Última página"
                        >
                            <i className="fas fa-angle-double-right"></i>
                        </button>
                    </div>
                </div>
            )}
            {/* Tabla */}
            <TableList data={tableData} />
        </div >
    );
}