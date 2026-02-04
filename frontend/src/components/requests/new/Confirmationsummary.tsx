
interface ConfirmationSummaryProps {
    tipoSolicitud: number | null;
    tipoNombre: string | undefined;
    formData: {
        nombreSolicitante: string;
        dniSolicitante: string;
        telefonoSolicitante: string;
        emailSolicitante: string;
        nombreCompleto1: string;
        fechaEvento: string;
    };
}

export default function ConfirmationSummary({tipoNombre, formData }: ConfirmationSummaryProps) {
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
                <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                    <span className="text-gray-600 font-medium">Solicitante:</span>
                    <span className="font-semibold text-gray-900">{formData.nombreSolicitante}</span>
                </div>
                <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                    <span className="text-gray-600 font-medium">DNI:</span>
                    <span className="font-semibold text-gray-900">{formData.dniSolicitante}</span>
                </div>
                <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                    <span className="text-gray-600 font-medium">Teléfono:</span>
                    <span className="font-semibold text-gray-900">{formData.telefonoSolicitante}</span>
                </div>
                {formData.emailSolicitante && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                        <span className="text-gray-600 font-medium">Email:</span>
                        <span className="font-semibold text-gray-900">{formData.emailSolicitante}</span>
                    </div>
                )}
                {formData.nombreCompleto1 && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                        <span className="text-gray-600 font-medium">Persona 1:</span>
                        <span className="font-semibold text-gray-900">{formData.nombreCompleto1}</span>
                    </div>
                )}
                {formData.fechaEvento && (
                    <div className="flex justify-between items-start">
                        <span className="text-gray-600 font-medium">Fecha del Evento:</span>
                        <span className="font-semibold text-gray-900">
                            {new Date(formData.fechaEvento).toLocaleDateString('es-PE')}
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <i className="fas fa-info-circle text-amber-600 mt-0.5"></i>
                <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Importante:</p>
                    <p>
                        Al confirmar esta solicitud, se generará un número de expediente. Puede hacer seguimiento del
                        trámite desde el panel principal.
                    </p>
                </div>
            </div>
        </div>
    );
}