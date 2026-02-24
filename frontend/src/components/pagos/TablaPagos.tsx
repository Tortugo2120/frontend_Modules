import { useNavigate } from "react-router-dom";
import type { ApplicationItem } from "../../model/aplicationModel";
import { ESTADO_CLASSES, ESTADO_ICON } from "./constants";

const HEADERS = ["Expediente", "Tipo de Solicitud", "Encargado", "Precio", "Estado", "Fecha Inicio", "Pago"];

interface Props {
    data: ApplicationItem[];
    loading: boolean;
    error: string | null;
}

export default function TablaPagos({ data, loading, error }: Props) {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="flex justify-center items-center py-16">
                <span className="loading loading-spinner loading-lg text-sky-500"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10 text-red-400 text-sm">
                <i className="fas fa-exclamation-circle text-2xl block mb-2"></i>
                {error}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-md border border-gray-100">
            <table className="w-full text-sm">
                <thead className="bg-info-content text-white">
                    <tr>
                        {HEADERS.map(h => (
                            <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={HEADERS.length} className="px-4 py-12 text-center text-gray-400">
                                <i className="fas fa-inbox text-3xl block mb-2"></i>
                                No hay registros disponibles
                            </td>
                        </tr>
                    ) : data.map(app => (
                        <tr key={app.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-mono text-sky-600 font-medium whitespace-nowrap">
                                {app.expediente}
                            </td>
                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{app.nombreSolicitud}</td>
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{app.encargado || "—"}</td>
                            <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                                S/ {app.precio.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                                <EstadoBadge estado={app.estado} />
                            </td>
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                {app.fecha ? app.fecha.split(" ")[0] : "—"}
                            </td>
                            <td className="px-4 py-3">
                                <button
                                    onClick={() => navigate("/dashboard/actualizar/pagos", { state: { id: String(app.id) } })}
                                    className="inline-flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 text-xs font-semibold px-3 py-1.5 rounded-lg border border-sky-200 transition-colors whitespace-nowrap"
                                >
                                    <i className="fas fa-credit-card"></i> Ver Pago
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Sub-componente: badge de estado ───────────────────────────────────
function EstadoBadge({ estado }: { estado: string }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ESTADO_CLASSES[estado] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
            <i className={`fas ${ESTADO_ICON[estado] ?? "fa-circle"} text-xs`}></i>
            {estado}
        </span>
    );
}
