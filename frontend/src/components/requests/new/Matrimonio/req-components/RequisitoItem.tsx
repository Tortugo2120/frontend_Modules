import { memo } from 'react';
import type { RequisitoItemProps } from './types';
import { ACCEPTED_FILE_TYPES } from './utils';

const RequisitoItem = memo(({
    requisito,
    index,
    contrayenteIndex,
    isCompleted,
    archivos,
    observacion,
    error,
    onCheckboxChange,
    onFileChange,
    onFileDelete,
    onObservacionChange,
    onErrorClear,
    getRequisitoKey,
    formatearTamaño,
    getIconoArchivo,
}: RequisitoItemProps) => {
    const requisitoKey = getRequisitoKey(requisito.id, contrayenteIndex);

    return (
        <div className={`p-3 transition-colors ${isCompleted ? 'bg-green-50' : 'hover:bg-gray-50'}`}>
            <div className="flex items-start gap-2">
                {/* Checkbox */}
                <div className="flex items-center h-5 mt-0.5">
                    <input
                        type="checkbox"
                        id={`requisito-${requisitoKey}`}
                        checked={isCompleted}
                        onChange={() => onCheckboxChange(requisito.id, contrayenteIndex)}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                    <label htmlFor={`requisito-${requisitoKey}`} className="cursor-pointer">
                        <span className={`text-sm font-medium block ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {index + 1}. {requisito.nombre_requisito}
                        </span>
                        <p className={`text-xs mt-0.5 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                            {requisito.descripcion}
                        </p>
                    </label>

                    {/* Sección de carga de archivo cuando está marcado */}
                    {isCompleted && (
                        <div className="mt-2 space-y-2">
                            {/* Botón de adjuntar */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        onChange={(e) => onFileChange(requisitoKey, e)}
                                        className="hidden"
                                        accept={ACCEPTED_FILE_TYPES}
                                    />
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors">
                                        <i className="fas fa-paperclip"></i>
                                        Adjuntar
                                    </span>
                                </label>
                                <span className='text-xs text-red-800 font-medium'>opcional*</span>
                            </div>

                            {/* Lista de archivos adjuntos */}
                            {archivos.length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                                    {archivos.map((archivo) => (
                                        <div
                                            key={archivo.id}
                                            className="flex items-center gap-2 bg-white rounded p-1.5 text-xs"
                                        >
                                            <i className={`fas ${getIconoArchivo(archivo.tipo)}`}></i>
                                            <span className="flex-1 truncate font-medium text-gray-900">
                                                {archivo.nombre}
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                                {formatearTamaño(archivo.tamaño)}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => onFileDelete(requisitoKey)}
                                                className="p-0.5 text-red-600 hover:text-red-800 rounded transition-colors cursor-pointer"
                                                title="Eliminar archivo"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Observación */}
                            <div>
                                <textarea
                                    rows={3}
                                    value={observacion}
                                    onChange={(e) => onObservacionChange(requisitoKey, e.target.value)}
                                    placeholder="Observación (opcional)..."
                                    className="w-full h-15 px-2 py-1 text-xs border border-gray-300 rounded outline-0 resize-none focus:ring-1 focus:ring-blue-400 bg-white"
                                />
                            </div>

                            {/* Error de archivo */}
                            {error && (
                                <div className="flex items-start gap-1 bg-red-50 border border-red-300 rounded px-2 py-1.5">
                                    <i className="fas fa-exclamation-circle text-red-500 text-xs mt-0.5"></i>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-red-600">{error}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onErrorClear(requisitoKey)}
                                        className="text-red-400 hover:text-red-600 cursor-pointer"
                                    >
                                        <i className="fas fa-times text-xs"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Estado */}
                {isCompleted && (
                    <div className="shrink-0">
                        <i className="fas fa-check-circle text-green-600"></i>
                    </div>
                )}
            </div>
        </div>
    );
});

RequisitoItem.displayName = 'RequisitoItem';

export default RequisitoItem;
