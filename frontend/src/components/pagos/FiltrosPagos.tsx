import type { Tiposolicitud } from "../../model/typeRequestModel";
import { INPUT_CLASS } from "./constants";

interface Filters {
    state?: string;
    beginDate?: string;
    endDate?: string;
    ApplicationType?: number;
}

interface Props {
    filters: Filters;
    tiposolicitud: Tiposolicitud[];
    onUpdateFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
    onApply: () => void;
    onReset: () => void;
}

export default function FiltrosPagos({ filters, tiposolicitud, onUpdateFilter, onApply, onReset }: Props) {
    return (
        <div className="flex flex-wrap gap-3 mb-5">
            <input
                type="date"
                value={filters.beginDate || ""}
                onChange={e => onUpdateFilter("beginDate", e.target.value)}
                className={INPUT_CLASS}
            />
            <input
                type="date"
                value={filters.endDate || ""}
                onChange={e => onUpdateFilter("endDate", e.target.value)}
                className={INPUT_CLASS}
            />
            <select
                value={filters.state || ""}
                onChange={e => onUpdateFilter("state", e.target.value)}
                className={INPUT_CLASS}
            >
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Completada">Completada</option>
                <option value="Anulada">Anulada</option>
            </select>
            <select
                value={filters.ApplicationType || 0}
                onChange={e => onUpdateFilter("ApplicationType", Number(e.target.value))}
                className={INPUT_CLASS}
            >
                <option value={0}>Todos los tipos</option>
                {tiposolicitud.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre_solicitud}</option>
                ))}
            </select>
            <button
                onClick={onApply}
                className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
                <i className="fas fa-search mr-1.5"></i> Filtrar
            </button>
            <button
                onClick={onReset}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
                <i className="fas fa-times mr-1.5"></i> Limpiar
            </button>
        </div>
    );
}
