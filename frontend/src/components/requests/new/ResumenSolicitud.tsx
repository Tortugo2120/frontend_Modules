import { useState, useCallback } from 'react';

interface Contrayente {
    id: string;
    tipoDocumento: string;
    dni: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fecha_nacimiento?: string;
    sexo?: 'M' | 'F';
    direccion?: string;
    correo?: string;
    telefono?: string;
    ubigeo?: string;
    estado_civil?: string;
}

interface Requisito {
    id: string;
    titulo: string;
    descripcion: string;
    obligatorio: boolean;
    completado: boolean;
}

interface ArchivoSubido {
    id: string;
    nombre: string;
    tamaño: number;
    tipo: string;
    archivo: File;
}

interface ResumenSolicitudProps {
    tipoSolicitudNombre?: string;
    contrayentes: Contrayente[];
    requisitos: Requisito[];
    archivos: ArchivoSubido[];
    onEditar?: (seccion: 'contrayentes' | 'requisitos' | 'archivos') => void;
    onConfirmar?: () => void;
    onCancelar?: () => void;
}

const ResumenSolicitud = ({
    tipoSolicitudNombre = 'Matrimonio Civil',
    contrayentes,
    requisitos,
    archivos,
    onEditar,
    onConfirmar,
    onCancelar
}: ResumenSolicitudProps) => {
    const [mostrarDetalles, setMostrarDetalles] = useState({
        contrayente1: true,
        contrayente2: true,
        requisitos: true,
        archivos: true
    });

    // Calcular estadísticas
    const estadisticas = {
        requisitosObligatorios: requisitos.filter(r => r.obligatorio).length,
        requisitosObligatoriosCompletados: requisitos.filter(r => r.obligatorio && r.completado).length,
        requisitosOpcionales: requisitos.filter(r => !r.obligatorio).length,
        requisitosOpcionalesCompletados: requisitos.filter(r => !r.obligatorio && r.completado).length,
        totalArchivos: archivos.length,
        tamañoTotalArchivos: archivos.reduce((acc, arch) => acc + arch.tamaño, 0)
    };

    const porcentajeObligatorios = estadisticas.requisitosObligatorios > 0
        ? Math.round((estadisticas.requisitosObligatoriosCompletados / estadisticas.requisitosObligatorios) * 100)
        : 0;

    const solicitudCompleta = estadisticas.requisitosObligatoriosCompletados === estadisticas.requisitosObligatorios
        && contrayentes.length === 2;

    // Toggle sección
    const toggleSeccion = useCallback((seccion: keyof typeof mostrarDetalles) => {
        setMostrarDetalles(prev => ({
            ...prev,
            [seccion]: !prev[seccion]
        }));
    }, []);

    // Formatear fecha
    const formatearFecha = (dateString?: string) => {
        if (!dateString) return 'No especificada';
        if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }
        return dateString;
    };

    // Formatear tamaño
    const formatearTamaño = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Obtener ícono de archivo
    const getIconoArchivo = (tipo: string): string => {
        if (tipo.includes('pdf')) return 'fa-file-pdf text-red-500';
        if (tipo.includes('image')) return 'fa-file-image text-blue-500';
        if (tipo.includes('word') || tipo.includes('document')) return 'fa-file-word text-blue-600';
        if (tipo.includes('excel') || tipo.includes('spreadsheet')) return 'fa-file-excel text-green-600';
        return 'fa-file text-gray-500';
    };

    // Imprimir resumen
    const handleImprimir = useCallback(() => {
        window.print();
    }, []);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header Principal */}
            <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 sm:p-8 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
                            <i className="fas fa-file-contract"></i>
                            Resumen de Solicitud
                        </h2>
                        <p className="text-blue-100 text-sm sm:text-base">
                            {tipoSolicitudNombre}
                        </p>
                    </div>
                    {solicitudCompleta ? (
                        <div className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-fit">
                            <i className="fas fa-check-circle text-xl"></i>
                            <span className="font-semibold">Solicitud Completa</span>
                        </div>
                    ) : (
                        <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-fit">
                            <i className="fas fa-exclamation-triangle text-xl"></i>
                            <span className="font-semibold">Pendiente</span>
                        </div>
                    )}
                </div>

                {/* Estadísticas Rápidas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                        <div className="text-xs sm:text-sm text-blue-100 mb-1">Contrayentes</div>
                        <div className="text-xl sm:text-2xl font-bold">{contrayentes.length}/2</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                        <div className="text-xs sm:text-sm text-blue-100 mb-1">Requisitos</div>
                        <div className="text-xl sm:text-2xl font-bold">{porcentajeObligatorios}%</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                        <div className="text-xs sm:text-sm text-blue-100 mb-1">Archivos</div>
                        <div className="text-xl sm:text-2xl font-bold">{estadisticas.totalArchivos}</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                        <div className="text-xs sm:text-sm text-blue-100 mb-1">Costo Total</div>
                        <div className="text-xl sm:text-2xl font-bold">128.20</div>
                    </div>
                </div>
            </div>

            {/* Sección Contrayentes */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div
                    className="bg-linear-to-r from-blue-50 to-purple-50 px-4 sm:px-6 py-4 flex items-center justify-between cursor-pointer hover:from-blue-100 hover:to-purple-100 transition-colors"
                    onClick={() => toggleSeccion('contrayente1')}
                >
                    <div className="flex items-center gap-3">
                        <i className="fas fa-users text-blue-600 text-xl"></i>
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                Datos de los Contrayentes
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                                {contrayentes.length === 2 ? 'Ambos contrayentes registrados' : `${contrayentes.length}/2 contrayentes`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {contrayentes.length === 2 && (
                            <i className="fas fa-check-circle text-green-600 text-xl"></i>
                        )}
                        {onEditar && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditar('contrayentes');
                                }}
                                className="px-3 py-1.5 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <i className="fas fa-edit"></i>
                                Editar
                            </button>
                        )}
                        <i className={`fas fa-chevron-${mostrarDetalles.contrayente1 ? 'up' : 'down'} text-gray-400`}></i>
                    </div>
                </div>

                {mostrarDetalles.contrayente1 && (
                    <div className="p-4 sm:p-6">
                        {contrayentes.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <i className="fas fa-user-slash text-4xl mb-3 text-gray-300"></i>
                                <p>No hay contrayentes registrados aún</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {contrayentes.map((contrayente, index) => (
                                    <div
                                        key={contrayente.id}
                                        className={`border-2 rounded-lg p-4 ${index === 0
                                                ? 'border-blue-200 bg-blue-50'
                                                : 'border-pink-200 bg-pink-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-current/20">
                                            <i className={`fas fa-user-circle text-3xl ${index === 0 ? 'text-blue-600' : 'text-pink-600'
                                                }`}></i>
                                            <div>
                                                <h4 className="font-bold text-gray-900">
                                                    Contrayente {index + 1}
                                                </h4>
                                                <p className="text-xs text-gray-600">
                                                    {contrayente.tipoDocumento}: {contrayente.dni}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="text-gray-600">Nombres:</div>
                                                <div className="col-span-2 font-medium text-gray-900">{contrayente.nombres}</div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="text-gray-600">Ap. Paterno:</div>
                                                <div className="col-span-2 font-medium text-gray-900">{contrayente.apellidoPaterno}</div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="text-gray-600">Ap. Materno:</div>
                                                <div className="col-span-2 font-medium text-gray-900">{contrayente.apellidoMaterno}</div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="text-gray-600">F. Nacimiento:</div>
                                                <div className="col-span-2 font-medium text-gray-900">{formatearFecha(contrayente.fecha_nacimiento)}</div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="text-gray-600">Sexo:</div>
                                                <div className="col-span-2 font-medium text-gray-900">
                                                    {contrayente.sexo === 'M' ? 'Masculino' : 'Femenino'}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="text-gray-600">Dirección:</div>
                                                <div className="col-span-2 font-medium text-gray-900">{contrayente.direccion}</div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="text-gray-600">Correo:</div>
                                                <div className="col-span-2 font-medium text-gray-900 break-all">{contrayente.correo}</div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="text-gray-600">Teléfono:</div>
                                                <div className="col-span-2 font-medium text-gray-900">{contrayente.telefono}</div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="text-gray-600">Ubigeo:</div>
                                                <div className="col-span-2 font-medium text-gray-900">{contrayente.ubigeo}</div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="text-gray-600">Estado Civil:</div>
                                                <div className="col-span-2 font-medium text-gray-900">{contrayente.estado_civil}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Sección Requisitos */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div
                    className="bg-linear-to-r from-green-50 to-emerald-50 px-4 sm:px-6 py-4 flex items-center justify-between cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-colors"
                    onClick={() => toggleSeccion('requisitos')}
                >
                    <div className="flex items-center gap-3">
                        <i className="fas fa-clipboard-check text-green-600 text-xl"></i>
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                Requisitos
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                                {estadisticas.requisitosObligatoriosCompletados}/{estadisticas.requisitosObligatorios} obligatorios ·
                                {' '}{estadisticas.requisitosOpcionalesCompletados}/{estadisticas.requisitosOpcionales} opcionales
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${porcentajeObligatorios === 100 ? 'bg-green-600' : 'bg-blue-600'
                                        }`}
                                    style={{ width: `${porcentajeObligatorios}%` }}
                                ></div>
                            </div>
                        </div>
                        <span className="font-bold text-lg">{porcentajeObligatorios}%</span>
                        {onEditar && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditar('requisitos');
                                }}
                                className="px-3 py-1.5 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <i className="fas fa-edit"></i>
                                Editar
                            </button>
                        )}
                        <i className={`fas fa-chevron-${mostrarDetalles.requisitos ? 'up' : 'down'} text-gray-400`}></i>
                    </div>
                </div>

                {mostrarDetalles.requisitos && (
                    <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Requisitos Obligatorios */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">
                                        OBLIGATORIOS
                                    </span>
                                </h4>
                                <div className="space-y-2">
                                    {requisitos.filter(r => r.obligatorio).map((req) => (
                                        <div
                                            key={req.id}
                                            className={`flex items-start gap-2 p-3 rounded-lg border ${req.completado
                                                    ? 'bg-green-50 border-green-200'
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <i className={`fas ${req.completado ? 'fa-check-circle text-green-600' : 'fa-circle text-gray-300'
                                                } text-lg mt-0.5`}></i>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${req.completado ? 'text-gray-500 line-through' : 'text-gray-900'
                                                    }`}>
                                                    {req.titulo}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Requisitos Opcionales */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">
                                        OPCIONALES
                                    </span>
                                </h4>
                                <div className="space-y-2">
                                    {requisitos.filter(r => !r.obligatorio).map((req) => (
                                        <div
                                            key={req.id}
                                            className={`flex items-start gap-2 p-3 rounded-lg border ${req.completado
                                                    ? 'bg-green-50 border-green-200'
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <i className={`fas ${req.completado ? 'fa-check-circle text-green-600' : 'fa-circle text-gray-300'
                                                } text-lg mt-0.5`}></i>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${req.completado ? 'text-gray-500 line-through' : 'text-gray-900'
                                                    }`}>
                                                    {req.titulo}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sección Archivos */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div
                    className="bg-linear-to-r from-purple-50 to-pink-50 px-4 sm:px-6 py-4 flex items-center justify-between cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-colors"
                    onClick={() => toggleSeccion('archivos')}
                >
                    <div className="flex items-center gap-3">
                        <i className="fas fa-paperclip text-purple-600 text-xl"></i>
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                Documentos Adjuntos
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                                {estadisticas.totalArchivos} archivo{estadisticas.totalArchivos !== 1 ? 's' : ''} ·
                                {' '}{formatearTamaño(estadisticas.tamañoTotalArchivos)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {onEditar && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditar('archivos');
                                }}
                                className="px-3 py-1.5 text-xs sm:text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                <i className="fas fa-edit"></i>
                                Editar
                            </button>
                        )}
                        <i className={`fas fa-chevron-${mostrarDetalles.archivos ? 'up' : 'down'} text-gray-400`}></i>
                    </div>
                </div>

                {mostrarDetalles.archivos && (
                    <div className="p-4 sm:p-6">
                        {archivos.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <i className="fas fa-file-upload text-4xl mb-3 text-gray-300"></i>
                                <p>No hay documentos adjuntos</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {archivos.map((archivo) => (
                                    <div
                                        key={archivo.id}
                                        className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors flex items-center gap-3"
                                    >
                                        <i className={`fas ${getIconoArchivo(archivo.tipo)} text-2xl`}></i>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {archivo.nombre}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatearTamaño(archivo.tamaño)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Advertencias */}
            {!solicitudCompleta && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                    <i className="fas fa-exclamation-triangle text-yellow-600 text-xl shrink-0"></i>
                    <div className="text-sm text-gray-700">
                        <p className="font-semibold mb-2">Faltan requisitos obligatorios:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            {contrayentes.length < 2 && (
                                <li>Completar datos de {2 - contrayentes.length} contrayente{2 - contrayentes.length > 1 ? 's' : ''}</li>
                            )}
                            {estadisticas.requisitosObligatoriosCompletados < estadisticas.requisitosObligatorios && (
                                <li>
                                    Completar {estadisticas.requisitosObligatorios - estadisticas.requisitosObligatoriosCompletados} requisito
                                    {estadisticas.requisitosObligatorios - estadisticas.requisitosObligatoriosCompletados > 1 ? 's' : ''} obligatorio
                                    {estadisticas.requisitosObligatorios - estadisticas.requisitosObligatoriosCompletados > 1 ? 's' : ''}
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            )}

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={handleImprimir}
                    className="w-full sm:w-auto px-6 py-3 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                    <i className="fas fa-print"></i>
                    Imprimir Resumen
                </button>

                {onCancelar && (
                    <button
                        type="button"
                        onClick={onCancelar}
                        className="w-full sm:w-auto px-6 py-3 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-times"></i>
                        Cancelar Solicitud
                    </button>
                )}

                <div className="flex-1"></div>

                {onConfirmar && (
                    <button
                        type="button"
                        onClick={onConfirmar}
                        disabled={!solicitudCompleta}
                        className={`w-full sm:w-auto px-8 py-3 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${solicitudCompleta
                                ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <i className="fas fa-check-circle"></i>
                        Confirmar y Enviar Solicitud
                    </button>
                )}
            </div>
        </div>
    );
};

export default ResumenSolicitud;