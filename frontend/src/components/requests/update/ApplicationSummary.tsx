import type { ApplicationDetailItem } from "../../../model/detailRequestModel.ts";
import { ESTADO_CLASSES, formatFecha, parseLocalDate } from "../../../Types/requests/update/constants.ts";

interface Props {
    application: ApplicationDetailItem;
}

//
function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="bg-gray-50 rounded-xl p-2 sm:p-3">
            <p className="text-base sm:text-lg text-gray-800 font-bold uppercase tracking-wide">{label}</p>
            <div className="text-base font-semibold text-gray-800 mt-0.5">{children}</div>
        </div>
    );
}

// Participantes
function ParticipantsSection({ application }: Props) {
    const contrayentes = application.participantes.filter(p => p.rol === "CONTRAYENTE");
    const testigos     = application.participantes.filter(p => p.rol === "TESTIGO");

    if (contrayentes.length === 0 && testigos.length === 0) return null;

    return (
        <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-base sm:text-lg font-semibold text-gray-800 uppercase tracking-wide mb-2">
                <i className="fas fa-user-friends text-indigo-400 mr-1.5"></i>Participantes
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col">
                    <span className="text-lg font-semibold text-indigo-600">Prometidos:</span>
                    <div className="flex items-center flex-wrap gap-2 mt-1">
                        {contrayentes.map((p, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-base font-medium px-3 py-1 rounded-full">
                                <i className="fas fa-user text-indigo-400"></i>
                                {p.nombre} - {p.numero_identificacion}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-semibold text-green-600">Testigos:</span>
                    <div className="flex items-center flex-wrap gap-2 mt-1">
                        {testigos.map((p, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 bg-gray-100 text-green-600 text-base font-medium px-3 py-1 rounded-full">
                                <i className="fas fa-user-friends text-green-400"></i>
                                {p.nombre} - {p.numero_identificacion}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Detalles del matrimonio 
function WeddingSection({ application }: Props) {
    if (!application.matrimonio) return null;

    const { fecha, hora, direccion, oficiante } = application.matrimonio;

    const fields = [
        { icon: "fa-calendar",        label: "Fecha Programada",     value: parseLocalDate(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }) },
        { icon: "fa-clock",           label: "Hora",      value: hora.slice(0, 5) },
        { icon: "fa-map-marker-alt",  label: "Dirección", value: direccion },
        { icon: "fa-user-tie",        label: "Oficiante", value: oficiante },
    ];

    return (
        <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-lg font-semibold text-gray-800 uppercase tracking-wide mb-3">
                <i className="fas fa-ring text-pink-400 mr-1.5"></i>Detalles del Matrimonio
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {fields.map(({ icon, label, value }) => (
                    <div key={label} className="bg-pink-50 rounded-xl p-3">
                        <p className="text-lg text-pink-500 font-bold uppercase tracking-wide">
                            <i className={`fas ${icon} mr-1`}></i>{label}:
                        </p>
                        <p className="text-base font-semibold text-gray-800 mt-0.5 truncate">{value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Main component 
export default function ApplicationSummary({ application }: Props) {
    const reqTotal      = application.requisitos.length;
    const reqEntregados = application.requisitos.filter(r => r.estado_entrega === "Entregado").length;
    const pagado        = application.pago?.pagado === "1";

    return (
        <div>
            <h1 className="text-lg sm:text-2xl text-center font-bold border-b border-gray-200 pb-4 mb-4 text-gray-800">
                <i className="fas fa-file-pen mr-2 text-indigo-500"></i>
                Actualizar Solicitud
            </h1>

            {/* Title & status */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-4">
                <div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ESTADO_CLASSES[application.estado] ?? "bg-blue-600 text-white"}`}>
                        {application.estado}
                    </span>
                    <h2 className="text-base sm:text-xl font-bold text-gray-900 mt-1.5 sm:mt-2">{application.nombreSolicitud}</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{application.descripcionSolicitud}</p>
                </div>
                <div className="sm:text-right">
                    <p className="text-xl sm:text-2xl font-bold text-green-600">S/ {application.precio.toFixed(2)}</p>
                    <p className="text-xs sm:text-sm text-gray-400">
                        N° expediente:{" "}
                        <span className="font-semibold text-gray-600">{application.expediente}</span>
                    </p>
                </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <StatCard label="Inicio:">{formatFecha(application.fechaInicio)}</StatCard>
                <StatCard label="Encargado:">
                    <span className="truncate block">{application.encargado}</span>
                </StatCard>
                <StatCard label="Requerimientos:">
                    <span className="text-green-600">{reqEntregados}</span>/{reqTotal} entregados
                </StatCard>
                <StatCard label="Pago:">
                    <span className={pagado ? "text-green-600" : "text-yellow-600"}>
                        <i className={`fas ${pagado ? "fa-check-circle" : "fa-clock"} mr-1`}></i>
                        {pagado ? "Pagado" : "Pendiente"}
                    </span>
                </StatCard>
            </div>

            <ParticipantsSection application={application} />
            <WeddingSection application={application} />
        </div>
    );
}
