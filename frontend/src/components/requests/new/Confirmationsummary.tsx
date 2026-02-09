import type {CreateApplicationPayload} from "../../../model/aplicationModel.ts";

interface ConfirmationSummaryProps {
    tipoSolicitud: number | null;
    tipoNombre: string | undefined;
    applicationData: CreateApplicationPayload;
    onConfirm: () => void;
    isSubmitting: boolean;
}

export default function ConfirmationSummary({
    tipoNombre,
    applicationData,
    onConfirm,
    isSubmitting
}: ConfirmationSummaryProps) {
    // Extraer datos del solicitante principal (participante con role 'solicitante')
    const solicitante = applicationData.participants.find(p => p.role === 'solicitante');

    return (
        <div className="animate-fadeIn">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-linear-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <i className="fas fa-check text-white text-3xl"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirme su solicitud</h2>
                <p className="text-gray-600">Revise los datos antes de enviar</p>
            </div>

            <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                    <span className="text-gray-600 font-medium">Tipo de Solicitud:</span>
                    <span className="font-bold text-gray-900">{tipoNombre}</span>
                </div>

                {solicitante && (
                    <>
                        <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                            <span className="text-gray-600 font-medium">Solicitante:</span>
                            <span className="font-semibold text-gray-900">
                                {solicitante.names} {solicitante.paternalSurname} {solicitante.maternalSurname}
                            </span>
                        </div>
                        <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                            <span className="text-gray-600 font-medium">DNI:</span>
                            <span className="font-semibold text-gray-900">{solicitante.dni}</span>
                        </div>
                        <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                            <span className="text-gray-600 font-medium">Teléfono:</span>
                            <span className="font-semibold text-gray-900">{solicitante.phone}</span>
                        </div>
                        {solicitante.email && (
                            <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                                <span className="text-gray-600 font-medium">Email:</span>
                                <span className="font-semibold text-gray-900">{solicitante.email}</span>
                            </div>
                        )}
                    </>
                )}

                {/* Mostrar número de expediente si existe */}
                {applicationData.application.expedientNumber && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                        <span className="text-gray-600 font-medium">N° Expediente:</span>
                        <span className="font-semibold text-blue-600">{applicationData.application.expedientNumber}</span>
                    </div>
                )}

                {/* Mostrar participantes adicionales */}
                {applicationData.participants.length > 1 && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                        <span className="text-gray-600 font-medium">Participantes:</span>
                        <span className="font-semibold text-gray-900">{applicationData.participants.length} persona(s)</span>
                    </div>
                )}

                {/* Mostrar requisitos si existen */}
                {applicationData.requisitos && applicationData.requisitos.length > 0 && (
                    <div className="flex justify-between items-start">
                        <span className="text-gray-600 font-medium">Requisitos:</span>
                        <span className="font-semibold text-gray-900">
                            {applicationData.requisitos.filter(r => r.delivered).length} de {applicationData.requisitos.length} completados
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <i className="fas fa-info-circle text-amber-600 mt-0.5"></i>
                <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Importante:</p>
                    <p>
                        Al confirmar esta solicitud, se enviará al sistema para su procesamiento. Puede hacer seguimiento del
                        trámite desde el panel principal.
                    </p>
                </div>
            </div>

            {/* Botón de confirmación */}
            <div className="mt-6 flex justify-center">
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={isSubmitting}
                    className={`
                        px-8 py-3 rounded-lg font-semibold text-white
                        transition-all duration-300 transform
                        ${isSubmitting 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg hover:shadow-xl'
                        }
                    `}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <i className="fas fa-spinner fa-spin"></i>
                            Enviando...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <i className="fas fa-check-circle"></i>
                            Confirmar y Enviar Solicitud
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}