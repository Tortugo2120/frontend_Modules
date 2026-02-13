import { useCallback, useEffect, useState } from 'react';
import { ApplicationHandler } from "../../../context/ApplicationContext.tsx";
import { useValidateExpediente } from "../../../hooks/useValidateExpediente.ts";

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
    const { setSearchValue, isChecking, error, exists } = useValidateExpediente(500);

    // Estado para número de expediente
    const [expedientNumber, setExpedientNumber] = useState<string>(() => {
        return formDataAplication.application.expedientNumber || '';
    });
    const [expedientError, setExpedientError] = useState<string>('');
    const [backendValidated, setBackendValidated] = useState<boolean>(false);

    // Validación de longitud en tiempo real (sin debounce)
    const handleExpedientInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
        const value = (e.target as HTMLInputElement).value.trim().toUpperCase();
        setExpedientNumber(value);

        // Validaciones locales inmediatas
        let localError = '';
        if (value.length === 0) {
            localError = 'El número de expediente es obligatorio';
        } else if (value.length < 3) {
            localError = 'El número de expediente debe tener al menos 3 caracteres';
        }

        setExpedientError(localError);
        setBackendValidated(false);
    }, []);

    // Dispara la búsqueda en el backend cuando el usuario deja de escribir
    const handleExpedientChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim().toUpperCase();

        // Solo buscar si el valor tiene al menos 3 caracteres
        if (value.length >= 3) {
            setSearchValue(value);
        }
    }, [setSearchValue]);

    // Maneja los resultados de la validación del backend
    useEffect(() => {
        if (expedientNumber.length < 3) {
            setBackendValidated(false);
            return;
        }

        if (isChecking) {
            setExpedientError('Verificando disponibilidad...');
            setBackendValidated(false);
            return;
        }

        // Verificar el resultado del backend primero
        if (exists !== null && exists !== undefined) {
            if (exists) {
                // El expediente ya existe (status: false, code: 409)
                setExpedientError('El número de expediente ya está registrado');
                setBackendValidated(false);
            } else {
                // El expediente está disponible (status: true, code: 200)
                setExpedientError('');
                setBackendValidated(true);
                // Guardar en el contexto local
                updateApplicationData({ expedientNumber });
            }
            return;
        }

        // Solo mostrar error de conexión si hay un error real y no hay resultado
        if (error) {
            setExpedientError('Error al verificar el expediente. Intente nuevamente.');
            setBackendValidated(false);
            return;
        }
    }, [isChecking, error, exists, expedientNumber, updateApplicationData]);

    // Notificar al padre sobre la validez del formulario
    useEffect(() => {
        const isValid = expedientNumber.length >= 3 && !expedientError && backendValidated && !isChecking;

        if (onValidationChange) {
            onValidationChange(isValid);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expedientNumber, expedientError, backendValidated, isChecking]);

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
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                <div className="flex items-start gap-4">
                    <div className="shrink-0 bg-yellow-100 p-3 rounded-lg">
                        <i className="fas fa-folder-open text-yellow-600 text-xl"></i>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-900 mb-1">
                            Número de Expediente <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-4">
                            Ingrese el código identificador del expediente para proceder con la validación.
                        </p>
                        
                        <div className="max-w-md">
                            <input
                                type="text"
                                value={expedientNumber}
                                onInput={handleExpedientInput}
                                onChange={handleExpedientChange}
                                className={`w-full px-4 py-3 text-sm sm:text-base border-2 rounded-lg font-bold uppercase outline-0 transition-all focus:ring-2 focus:ring-blue-500 ${
                                    isChecking
                                        ? 'border-yellow-500 bg-yellow-50'
                                        : expedientError
                                            ? 'border-red-500 bg-red-50'
                                            : backendValidated
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-300 bg-white'
                                }`}
                                placeholder="EJ: EXP-2026-001"
                                maxLength={20}
                            />
                            
                            {isChecking && (
                                <p className="text-yellow-600 text-xs mt-2 flex items-center gap-1">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Verificando disponibilidad del expediente...
                                </p>
                            )}

                            {expedientError && !isChecking && (
                                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {expedientError}
                                </p>
                            )}
                            
                            {backendValidated && !isChecking && !expedientError && (
                                <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                                    <i className="fas fa-check-circle"></i>
                                    Expediente disponible y verificado correctamente
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Resumen de Estado */}
            {!backendValidated && (
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