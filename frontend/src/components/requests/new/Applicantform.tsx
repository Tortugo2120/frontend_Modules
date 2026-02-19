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
    const {
        setSearchValue,
        isChecking,
        error,
        exists,
        clearCache,
        reset
    } = useValidateExpediente(500);

    // Estado para número de expediente
    const [expedientNumber, setExpedientNumber] = useState<string>(() => {
        return formDataAplication.application.expedientNumber || '';
    });
    const [expedientError, setExpedientError] = useState<string>('');
    const [backendValidated, setBackendValidated] = useState<boolean>(false);
    const [localValidationPassed, setLocalValidationPassed] = useState<boolean>(false);

    // Validaciones locales del input (longitud y caracteres permitidos)
    const handleExpedientInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.toUpperCase();

        // Permitir solo letras, números y guiones
        value = value.replace(/[^A-Z0-9-]/g, '');

        setExpedientNumber(value);
        setBackendValidated(false);

        // Resetear todos los estados del hook cuando cambia el valor
        reset();

        // Validaciones locales
        let localError: string;
        let validationPassed = false;

        if (value.length === 0) {
            localError = 'El número de expediente es obligatorio';
        } else if (value.length < 3) {
            localError = 'El número de expediente debe tener al menos 3 caracteres';
        } else if (value.length > 20) {
            localError = 'El número de expediente no puede exceder 20 caracteres';
        } else {
            // Validaciones locales pasadas
            validationPassed = true;
            localError = '';
        }

        setExpedientError(localError);
        setLocalValidationPassed(validationPassed);
    }, [reset]);

    // Validación del backend cuando se hace clic en el botón
    const handleValidateClick = useCallback(() => {
        if (!localValidationPassed || expedientNumber.length < 3) {
            return;
        }
        // Llamar al backend para validar
        setSearchValue(expedientNumber);
    }, [expedientNumber, localValidationPassed, setSearchValue]);

    // Maneja los resultados de la validación del backend
    useEffect(() => {
        // No hacer nada si el expediente está vacío o es muy corto
        if (expedientNumber.length < 3) {
            return;
        }

        // Si está verificando, mostrar estado de carga
        if (isChecking) {
            return;
        }

        // Verificar el resultado del backend solo si existe un resultado
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

        // Mostrar error de conexión solo si hay un error real
        if (error) {
            setExpedientError('Error al verificar el expediente. Intente nuevamente.');
            setBackendValidated(false);
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

    // Limpiar caché cuando se desmonte el componente o cambie el tipo de solicitud
    useEffect(() => {
        return () => {
            clearCache();
        };
    }, [clearCache, tipoSolicitudNombre]);

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
                            <div className="join w-full">
                                <input
                                    type="text"
                                    value={expedientNumber}
                                    onChange={handleExpedientInput}
                                    className={`join-item input input-bordered w-full font-bold uppercase outline-0 ${
                                        isChecking
                                            ? 'input-warning'
                                            : expedientError && expedientNumber.length > 0
                                                ? 'input-error'
                                                : backendValidated
                                                    ? 'input-success'
                                                    : ''
                                    }`}
                                    placeholder="EJ: EXP-2026-001"
                                    maxLength={20}
                                />
                                <button
                                    className="btn btn-primary join-item"
                                    type="button"
                                    onClick={handleValidateClick}
                                    disabled={!localValidationPassed || isChecking || backendValidated}
                                >
                                    {isChecking ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Verificando
                                        </>
                                    ) : backendValidated ? (
                                        <>
                                            <i className="fas fa-check"></i>
                                            Validado
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-search"></i>
                                            Validar
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Mensajes de validación local */}
                            {expedientError && expedientNumber.length > 0 && !isChecking && (
                                <p className="text-error text-xs mt-2 flex items-center gap-1">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {expedientError}
                                </p>
                            )}

                            {/* Mensaje de verificación en proceso */}
                            {isChecking && (
                                <p className="text-warning text-xs mt-2 flex items-center gap-1">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Verificando disponibilidad del expediente...
                                </p>
                            )}

                            {/* Mensaje de éxito */}
                            {backendValidated && !isChecking && !expedientError && (
                                <p className="text-success text-xs mt-2 flex items-center gap-1">
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