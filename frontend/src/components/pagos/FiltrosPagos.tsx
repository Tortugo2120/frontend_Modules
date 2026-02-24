import type { Tiposolicitud } from "../../model/typeRequestModel";
import type { PaymentHistoryParams } from "../../services/PaymentHistoryService";
import { INPUT_CLASS } from "./constants";

interface Props {
    filters: PaymentHistoryParams;
    tiposolicitud: Tiposolicitud[];
    onUpdateFilter: <K extends keyof PaymentHistoryParams>(key: K, value: PaymentHistoryParams[K]) => void;
    onApply: () => void;
    onReset: () => void;
}

export default function FiltrosPagos({ filters, tiposolicitud, onUpdateFilter, onApply, onReset }: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <input
                type="text"
                placeholder="N° Expediente"
                value={filters.expedientNumber || ""}
                onChange={e => onUpdateFilter("expedientNumber", e.target.value)}
                className={INPUT_CLASS}
            />
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
                <option value="Completado">Completado</option>
            </select>
            <select
                value={filters.applicationType || ""}
                onChange={e => onUpdateFilter("applicationType", e.target.value)}
                className={INPUT_CLASS}
            >
                <option value="">Todos los tipos</option>
                {tiposolicitud.map(t => (
                    <option key={t.id} value={t.nombre_solicitud}>{t.nombre_solicitud}</option>
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
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold px-4 py-2 rounded-lg border border-gray-300 transition-colors"
            >
                <i className="fas fa-times mr-1.5"></i> Limpiar
            </button>
        </div>
    );
}
