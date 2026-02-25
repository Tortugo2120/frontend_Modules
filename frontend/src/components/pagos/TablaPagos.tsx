import { useNavigate } from "react-router-dom";
import type { PaymentHistoryItem } from "../../model/paymentHistoryModel";
import { ESTADO_CLASSES, ESTADO_ICON } from "./constants";

const HEADERS = ["Expediente", "Tipo de Solicitud", "Estado Solicitud", "Monto", "Estado Pago", "Fecha de Pago", "Acciones"];

interface Props {
    data: PaymentHistoryItem[];
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
        <div className="overflow-x-auto rounded-md border border-gray-300">
            <table className="w-full text-base">
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
                    ) : data.map(item => (
                        <tr key={item.id} className="border-t border-gray-300 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-mono text-sky-600 font-medium whitespace-nowrap">
                                {item.expediente}
                            </td>
                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{item.tipo_solicitud}</td>
                            <td className="px-4 py-3">
                                <EstadoBadge estado={item.estado_solicitud} />
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                                S/ {item.monto.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                                <EstadoBadge estado={item.estado} />
                            </td>
                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                {item.fecha_pago ? item.fecha_pago.split(" ")[0] : "—"}
                            </td>
                            <td className="px-4 py-3">
                                {!(item.estado_solicitud === "Anulada" && item.estado === "Pendiente") && (
                                    <button
                                        onClick={() => navigate("/dashboard/actualizar/pagos", { state: { id: String(item.id_solicitud) } })}
                                        className="inline-flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 text-md font-semibold px-3 py-1.5 rounded-lg border border-sky-200 transition-colors whitespace-nowrap cursor-pointer"
                                    >
                                        <i className="fas fa-credit-card"></i> Ver Pago
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function EstadoBadge({ estado }: { estado: string }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ESTADO_CLASSES[estado] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
            <i className={`fas ${ESTADO_ICON[estado] ?? "fa-circle"} text-xs`}></i>
            {estado}
        </span>
    );
}
 