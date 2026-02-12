import { useCallback, useState } from 'react';
import { ApplicationHandler } from "../../../context/ApplicationContext.tsx";

interface ApplicantFormProps {
    tipoSolicitudNombre?: string;
    descriptionSolicitud?: string;
    onValidationChange?: (isValid: boolean) => void;
}

export default function ApplicantForm({
    tipoSolicitudNombre,
    descriptionSolicitud,
    onValidationChange,
}: ApplicantFormProps) {

    const { formDataAplication, updateApplicationData } = ApplicationHandler();

    // Estado para número de expediente
    const [expedientNumber, setExpedientNumber] = useState<string>(() => {
        return formDataAplication.application.expedientNumber || '';
    });

    const [expedientError, setExpedientError] = useState<string>('');

    // Verificar si el expediente está completo (mínimo 5 caracteres)
    const isExpedientValid = expedientNumber.length >= 5 && !expedientError;

    // Función para manejar el cambio de número de expediente
    const handleExpedientNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {

        const value = e.target.value.trim().toUpperCase();
        setExpedientNumber(value);

        let error = '';

        if (value.length === 0) {
            error = 'El número de expediente es obligatorio';
        } else if (value.length < 5) {
            error = 'El número de expediente debe tener al menos 5 caracteres';
        }

        setExpedientError(error);

        const isValid = value.length >= 5 && error === '';

        // Actualizar en el contexto
        updateApplicationData({ expedientNumber: value });

        // Notificar al padre sobre la validez de este paso
        if (onValidationChange) {
            onValidationChange(isValid);
        }

    }, [updateApplicationData, onValidationChange]);

    return (
        <div className="space-y-4 sm:space-y-6">

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-file-signature text-blue-600"></i>
                    <span>Validación de Expediente</span>
                </h3>

                {tipoSolicitudNombre && (
                    <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex flex-col items-center w-fit">
                        <div>
                            <i className="fas fa-file-alt mr-2"></i>
                            {tipoSolicitudNombre.toUpperCase()}
                        </div>
                        <span className='text-xs'>
                            {descriptionSolicitud}
                        </span>
                    </span>
                )}
            </div>

            {/* Campo de Número de Expediente */}
            <div className="bg-yellow-100/50 border border-gray-200 p-8 rounded-xl shadow-sm">
                <div className="flex flex-col items-center text-center gap-6">

                    <div className="bg-yellow-100 p-4 rounded-xl">
                        <i className="fas fa-folder-open text-yellow-600 text-2xl"></i>
                    </div>

                    <div className="w-full flex flex-col items-center">

                        <label className="block text-base sm:text-lg font-bold text-gray-900 mb-2">
                            Número de Expediente <span className="text-red-500">*</span>
                        </label>

                        <p className="text-sm text-gray-500 mb-6 max-w-md">
                            Ingrese el código identificador del expediente para proceder con la validación.
                        </p>

                        <div className="w-full max-w-lg">
                            <input
                                type="text"
                                value={expedientNumber}
                                onChange={handleExpedientNumberChange}
                                className={`w-full px-6 py-4 text-lg sm:text-xl border-2 rounded-xl font-extrabold tracking-wider uppercase text-center outline-0 transition-all focus:ring-2 focus:ring-blue-500 ${
                                    expedientError
                                        ? 'border-red-500 bg-red-50'
                                        : isExpedientValid
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 bg-white'
                                }`}
                                placeholder="EJ: EXP-2026-001"
                                maxLength={20}
                            />

                            {expedientError && (
                                <p className="text-red-500 text-sm mt-3 flex items-center justify-center gap-2">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {expedientError}
                                </p>
                            )}

                            {isExpedientValid && (
                                <p className="text-green-600 text-sm mt-3 flex items-center justify-center gap-2">
                                    <i className="fas fa-check-circle"></i>
                                    Expediente verificado correctamente
                                </p>
                            )}
                        </div>

                    </div>

                </div>
            </div>

            {/* Resumen de Estado */}
            {!isExpedientValid && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-3">
                    <i className="fas fa-info-circle text-blue-500"></i>
                    <p className="text-sm text-blue-700">
                        Esperando un número de expediente válido para habilitar el siguiente paso.
                    </p>
                </div>
            )}

        </div>
    );
}
