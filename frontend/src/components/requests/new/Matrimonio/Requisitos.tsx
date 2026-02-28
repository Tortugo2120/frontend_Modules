import { useEffect, useMemo, memo, useState } from 'react';
import {
    useRequisitosMatrimonio,
    getRequisitoKey,
    formatearTamaño,
    getIconoArchivo,
    getNombreCondicion,
    getIconoCondicion,
} from './req-components';
import type { RequisitosMatrimonioProps, ArchivoSubido } from './req-components';
import { ACCEPTED_FILE_TYPES } from './req-components/utils';

const ObservacionToggle = memo(({
    observacion,
    requisitoKey,
    onObservacionChange,
}: {
    observacion: string;
    requisitoKey: string;
    onObservacionChange: (key: string, val: string) => void;
}) => {
    const [open, setOpen] = useState(!!observacion);

    return (
        <div>
            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className="text-sm text-gray-500 font-medium flex items-center gap-1 cursor-pointer bg-transparent border-none hover:text-blue-600 transition-colors"
            >
                <i className="fas fa-comment-alt text-base"></i>
                Observación
                <i className={`fas fa-chevron-${open ? 'up' : 'down'} text-[0.6rem] ml-1 transition-transform`}></i>
            </button>
            {open && (
                <textarea
                    value={observacion}
                    onChange={(e) => onObservacionChange(requisitoKey, e.target.value)}
                    placeholder="Ingrese alguna observación..."
                    rows={2}
                    autoFocus
                    className="w-full mt-1 px-2.5 py-2 text-base border-2 border-gray-300 rounded-lg outline-none resize-none bg-white transition-colors leading-relaxed text-gray-900 placeholder:text-gray-300 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)]"
                />
            )}
        </div>
    );
});
ObservacionToggle.displayName = 'ObservacionToggle';

interface ContrayenteCellProps {
    reqId: string | number;
    contrayenteIndex: number;
    className?: string;
    requisitosEstados: Map<string, number>;
    archivosRequisitos: Map<string, ArchivoSubido[]>;
    observacionesMap: Map<string, string>;
    erroresArchivo: Map<string, string>;
    onCheckboxChange: (id: string | number, contrayenteIndex: number) => void;
    onFileChange: (key: string, e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileDelete: (key: string) => void;
    onObservacionChange: (key: string, val: string) => void;
    onErrorClear: (key: string) => void;
}

const ContrayenteCell = memo(({
    reqId,
    contrayenteIndex,
    className = '',
    requisitosEstados,
    archivosRequisitos,
    observacionesMap,
    erroresArchivo,
    onCheckboxChange,
    onFileChange,
    onFileDelete,
    onObservacionChange,
    onErrorClear,
}: ContrayenteCellProps) => {
    // ✅ Clave individual por contrayente: "8-ctry1" / "8-ctry2"
    const key = getRequisitoKey(reqId, contrayenteIndex);
    const isChecked = requisitosEstados.get(key) === 1;
    const archivos = archivosRequisitos.get(key) || [];
    const observacion = observacionesMap.get(key) ?? '';
    const error = erroresArchivo.get(key);

    return (
        <div className={`p-3 ${className}`}>
            <div className="flex flex-col gap-2.5">
                <div className="grid grid-cols-2 items-start">
                    {/* ── Checkbox ── */}
                    <div className="flex items-center gap-2">
                        <div
                            onClick={() => onCheckboxChange(reqId, contrayenteIndex)}
                            className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center cursor-pointer transition-all shrink-0
                                ${isChecked
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-white border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            {isChecked && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <span
                            className={`text-lg cursor-pointer select-none ${isChecked ? 'text-blue-700 font-semibold' : 'text-gray-800'}`}
                            onClick={() => onCheckboxChange(reqId, contrayenteIndex)}
                        >
                            {isChecked ? 'Entregado' : 'Pendiente'}
                        </span>
                    </div>

                    {/* ── Botón archivo ── */}
                    <div>
                        <div className="group relative">
                            <label
                                className={`inline-flex items-center gap-1.5 px-3 py-[0.4rem] w-full justify-center text-sm font-medium rounded-lg cursor-pointer transition-all
                                    ${archivos.length > 0
                                        ? 'bg-green-50 border border-solid border-green-400 text-green-700'
                                        : 'bg-gray-100 border border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => onFileChange(key, e)}
                                    accept={ACCEPTED_FILE_TYPES}
                                />
                                <i className={`fas ${archivos.length > 0 ? 'fa-file-check' : 'fa-cloud-upload-alt'}`}></i>
                                {archivos.length > 0 ? 'Cambiar' : 'Adjuntar'}
                            </label>
                            <p className="absolute z-10 rounded-md mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white p-2 shadow">
                                <span className="text-sm text-red-600 mt-0.5 block">Esta acción es totalmente opcional*</span>
                            </p>
                        </div>

                        {archivos.length > 0 ? (
                            archivos.map(archivo => (
                                <div key={archivo.id} className="mt-1">
                                    <div className="flex items-center gap-1 text-sm text-green-700">
                                        <i className={`fas ${getIconoArchivo(archivo.tipo)} text-sm`}></i>
                                        <span className="truncate flex-1">{archivo.nombre}</span>
                                        <span className="text-gray-500 text-xs shrink-0">
                                            {formatearTamaño(archivo.tamaño)}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onFileDelete(key)}
                                        className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 mt-0.5 bg-transparent border-none cursor-pointer"
                                    >
                                        <i className="fas fa-times-circle"></i> Eliminar
                                    </button>
                                </div>
                            ))
                        ) : (
                            <span className="text-xs text-gray-600 mt-0.5 block">Sin archivo*</span>
                        )}
                    </div>
                </div>

                {/* ── Observación ── */}
                <ObservacionToggle
                    observacion={observacion}
                    requisitoKey={key}
                    onObservacionChange={onObservacionChange}
                />

                {/* ── Error ── */}
                {error && (
                    <div className="flex items-start gap-1.5 bg-red-50 border border-red-300 rounded-lg px-2.5 py-1.5">
                        <i className="fas fa-exclamation-circle text-red-500 text-xs mt-0.5"></i>
                        <p className="text-xs text-red-600 flex-1">{error}</p>
                        <button
                            type="button"
                            onClick={() => onErrorClear(key)}
                            className="text-red-400 hover:text-red-600 cursor-pointer bg-transparent border-none"
                        >
                            <i className="fas fa-times text-xs"></i>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});
ContrayenteCell.displayName = 'ContrayenteCell';

interface GeneralReqRowProps {
    req: {
        id: number | string;
        nombre_requisito: string;
        descripcion?: string;
    };
    idx: number;
    requisitosEstados: Map<string, number>;
    archivosRequisitos: Map<string, ArchivoSubido[]>;
    observacionesMap: Map<string, string>;
    erroresArchivo: Map<string, string>;
    onCheckboxChange: (id: string | number, contrayenteIndex: number) => void;
    onFileChange: (key: string, e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileDelete: (key: string) => void;
    onObservacionChange: (key: string, val: string) => void;
    onErrorClear: (key: string) => void;
}

const GeneralReqRow = memo(({
    req,
    idx,
    requisitosEstados,
    archivosRequisitos,
    observacionesMap,
    erroresArchivo,
    onCheckboxChange,
    onFileChange,
    onFileDelete,
    onObservacionChange,
    onErrorClear,
}: GeneralReqRowProps) => {
    // ✅ Clave general compartida: "8-general"
    const key = getRequisitoKey(req.id, 0, 'general');
    const isChecked = requisitosEstados.get(key) === 1;
    const archivos = archivosRequisitos.get(key) || [];
    const observacion = observacionesMap.get(key) ?? '';
    const error = erroresArchivo.get(key);

    return (
        <div className="grid grid-cols-3 border-b border-gray-200 last:border-b-0">
            {/* ── Nombre del requisito ── */}
            <div className="p-4 col-span-2 flex items-start gap-2 border-r border-gray-300">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-info-content text-white text-[0.68rem] font-bold rounded-full shrink-0 mt-0.5 leading-none">
                    {idx + 1}
                </span>
                <div>
                    <span className="text-lg font-semibold text-gray-900">{req.nombre_requisito}</span>
                    {req.descripcion && (
                        <p className="text-base text-gray-500 mt-0.5 leading-relaxed">{req.descripcion}</p>
                    )}
                </div>
            </div>

            {/* ── Controles compartidos ── */}
            <div className="p-3 bg-gray-50">
                <div className="flex flex-col gap-2">
                    {/* Checkbox */}
                    <div className="flex items-center gap-2">
                        <div
                            onClick={() => onCheckboxChange(req.id, 0)}
                            className={`w-5 h-5 rounded-[5px] border-2 flex items-center justify-center cursor-pointer transition-all shrink-0
                                ${isChecked
                                    ? 'bg-gray-700 border-gray-700'
                                    : 'bg-white border-gray-300 hover:border-gray-500'
                                }`}
                        >
                            {isChecked && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <span
                            className={`text-sm cursor-pointer select-none ${isChecked ? 'text-gray-800 font-semibold' : 'text-gray-600'}`}
                            onClick={() => onCheckboxChange(req.id, 0)}
                        >
                            {isChecked ? 'Entregado' : 'Pendiente'}
                        </span>
                    </div>

                    {/* Archivo */}
                    <div className="group relative">
                        <label
                            className={`inline-flex items-center gap-1.5 px-3 py-[0.4rem] w-full justify-center text-sm font-medium rounded-lg cursor-pointer transition-all
                                ${archivos.length > 0
                                    ? 'bg-green-50 border border-solid border-green-400 text-green-700'
                                    : 'bg-gray-100 border border-dashed border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-800 hover:bg-gray-200'
                                }`}
                        >
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => onFileChange(key, e)}
                                accept={ACCEPTED_FILE_TYPES}
                            />
                            <i className={`fas ${archivos.length > 0 ? 'fa-file-check' : 'fa-cloud-upload-alt'}`}></i>
                            {archivos.length > 0 ? 'Cambiar' : 'Adjuntar'}
                        </label>
                        <p className="absolute z-10 rounded-md mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white p-2 shadow text-nowrap">
                            <span className="text-sm text-red-600 block">Esta acción es totalmente opcional*</span>
                        </p>
                    </div>

                    {archivos.length > 0 ? (
                        archivos.map(archivo => (
                            <div key={archivo.id}>
                                <div className="flex items-center gap-1 text-sm text-green-700">
                                    <i className={`fas ${getIconoArchivo(archivo.tipo)}`}></i>
                                    <span className="truncate flex-1 text-xs">{archivo.nombre}</span>
                                    <span className="text-gray-500 text-xs shrink-0">
                                        {formatearTamaño(archivo.tamaño)}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onFileDelete(key)}
                                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-0.5 bg-transparent border-none cursor-pointer"
                                >
                                    <i className="fas fa-times-circle"></i> Eliminar
                                </button>
                            </div>
                        ))
                    ) : (
                        <span className="text-xs text-gray-500 block">Sin archivo*</span>
                    )}

                    {/* Observación */}
                    <ObservacionToggle
                        observacion={observacion}
                        requisitoKey={key}
                        onObservacionChange={onObservacionChange}
                    />

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-1 bg-red-50 border border-red-300 rounded px-2 py-1">
                            <i className="fas fa-exclamation-circle text-red-500 text-xs mt-0.5"></i>
                            <p className="text-xs text-red-600 flex-1">{error}</p>
                            <button
                                type="button"
                                onClick={() => onErrorClear(key)}
                                className="text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer"
                            >
                                <i className="fas fa-times text-xs"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
GeneralReqRow.displayName = 'GeneralReqRow';

const CONDICION_META: Record<string, { tagClass: string; tagLabel: string }> = {
    GENERAL: { tagClass: 'bg-blue-100 text-blue-800', tagLabel: 'General' },
    DIVORCED: { tagClass: 'bg-orange-100 text-orange-800', tagLabel: 'Divorciado' },
    WIDOWED: { tagClass: 'bg-purple-100 text-purple-800', tagLabel: 'Viudo' },
};

const RequisitosMatrimonio = ({
    tipoSolicitudNombre,
    descriptionSolicitud,
    onRequisitosChange,
    onArchivosChange,
    onValidationChange,
}: RequisitosMatrimonioProps) => {
    const {
        requisitos,
        archivos,
        archivosRequisitos,
        requisitosEstados,
        observacionesMap,
        erroresArchivo,
        contrayentes,
        requirements,
        calcularProgreso,
        handleCheckboxChange,
        marcarTodosObligatorios,
        desmarcarTodos,
        handleRequisitoFileChange,
        handleEliminarArchivoRequisito,
        handleObservacionChange,
        handleErrorClear,
    } = useRequisitosMatrimonio();

    const progreso = calcularProgreso();

    // Notificar cambios al padre
    useEffect(() => { onRequisitosChange?.(requisitos); }, [requisitos, onRequisitosChange]);
    useEffect(() => { onArchivosChange?.(archivos); }, [archivos, onArchivosChange]);
    useEffect(() => {
        if (onValidationChange) {
            onValidationChange(progreso.completados > 0 && erroresArchivo.size === 0);
        }
    }, [progreso.completados, erroresArchivo, onValidationChange]);

    // Agrupar todos los requisitos por condición
    const gruposMerged = useMemo(() => {
        const groups: { [key: string]: typeof requirements } = {};
        requirements.forEach(req => {
            const cond = req.condicion || 'GENERAL';
            if (!groups[cond]) groups[cond] = [];
            groups[cond].push(req);
        });
        return groups;
    }, [requirements]);

    const contrayenteApplies = (ctryIdx: number, condicion: string) => {
        const ctry = contrayentes[ctryIdx - 1];
        if (!ctry) return false;
        return condicion === 'GENERAL' || ctry.condiciones.has(condicion);
    };

    // Props comunes para los handlers — evita repetir en cada celda
    const handlerProps = {
        requisitosEstados,
        archivosRequisitos,
        observacionesMap,
        erroresArchivo,
        onCheckboxChange: handleCheckboxChange,
        onFileChange: handleRequisitoFileChange,
        onFileDelete: handleEliminarArchivoRequisito,
        onObservacionChange: handleObservacionChange,
        onErrorClear: handleErrorClear,
    };

    return (
        <div className="space-y-5">

            {/* ─── HEADER ─── */}
            {tipoSolicitudNombre && (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 pb-3 border-b border-b-blue-300">


                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <i className="fas fa-clipboard-check text-blue-600"></i>
                        <span className="text-lg">Requisitos para el {tipoSolicitudNombre}</span>

                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex flex-col items-center w-fit">
                        <div>
                            <i className="fas fa-file-alt mr-2"></i>
                            {tipoSolicitudNombre.toUpperCase()}
                        </div>
                        <span className="text-xs">{descriptionSolicitud}</span>
                    </span>

                </div>
            )}

            {/* ─── PROGRESO ─── */}
            <div className="fixed flex flex-row bottom-0 left-21 right-6 z-10 ">
                <div className="bg-info-content px-5 flex-1 py-4 rounded-l-lg flex items-center gap-5">
                    <div className="flex-1">
                        <div className='flex flex-row gap-5'>
                            <div className="text-sm text-white font-semibold uppercase tracking-wider">
                                Progreso de Requisitos:
                            </div>
                            <div className="text-sm font-medium text-gray-200 mt-0.5">
                                {progreso.completados} de {progreso.total} requisitos completados
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${progreso.porcentaje === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                                style={{ width: `${progreso.porcentaje}%` }}
                            />
                        </div>
                    </div>
                    <div className={`text-2xl font-bold min-w-15 text-right ${progreso.porcentaje === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                        {progreso.porcentaje}%
                    </div>
                </div>

                {/* ─── BOTONES ACCIÓN ─── */}
                <div className="flex flex-col gap-1 justify-center flex-wrap bg-info-content px-5 rounded-r-lg">
                    <button
                        type="button"
                        onClick={() => marcarTodosObligatorios()}
                        className="flex-1 sm:flex-none px-4 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <i className="fas fa-check-double"></i> Marcar Todos
                    </button>
                    <button
                        type="button"
                        onClick={() => desmarcarTodos()}
                        className="flex-1 bg-white sm:flex-none px-4 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <i className="fas fa-times-circle"></i> Desmarcar Todos
                    </button>
                </div>
            </div>

            {/* ─── GRUPOS DE REQUISITOS ─── */}
            {Object.entries(gruposMerged).map(([condicion, reqs]) => {
                const applies1 = contrayenteApplies(1, condicion);
                const applies2 = contrayenteApplies(2, condicion);
                if (!applies1 && !applies2) return null;

                const meta = CONDICION_META[condicion] || CONDICION_META.GENERAL;

                // Separar por tipo
                const reqsGenerales = reqs.filter(r => r.tipo_requisito === 'general');
                const reqsIndividuales = reqs.filter(r => r.tipo_requisito !== 'general');

                return (
                    <div key={condicion} className="space-y-3">

                        {/* ── Cabecera del grupo ── */}
                        <div className="flex items-center gap-2.5 pb-2 border-b-2 border-gray-200">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm bg-info-content">
                                <i className={`fas ${getIconoCondicion(condicion)}`}></i>
                            </div>
                            <span className="text-sm font-bold text-gray-800 uppercase">
                                {getNombreCondicion(condicion)}
                            </span>
                            <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                                {reqs.length}
                            </span>
                        </div>

                        {/* ── TABLA GENERALES (una sola columna de estado) ── */}
                        {reqsGenerales.length > 0 && (
                            <div className="overflow-x-auto">
                                <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-300 min-w-180">
                                    {/* Header */}
                                    <div className="grid grid-cols-3 bg-info-content text-white">
                                        <div className="px-4 py-3 font-semibold uppercase text-xs col-span-2 flex items-center gap-2">
                                            <i className="fas fa-layer-group"></i>
                                            Requisitos Comunes (Ambos Contrayentes)
                                        </div>
                                        <div className="px-4 py-3 font-semibold uppercase text-xs flex items-center gap-2">
                                            <i className="fas fa-users"></i> Estado
                                        </div>
                                    </div>
                                    {/* Filas */}
                                    {reqsGenerales.map((req, idx) => (
                                        <GeneralReqRow
                                            key={req.id}
                                            req={req}
                                            idx={idx}
                                            {...handlerProps}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── TABLA INDIVIDUALES (columna por contrayente) ── */}
                        {reqsIndividuales.length > 0 && (
                            <div className="overflow-x-auto">
                                <div className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-200 min-w-180">
                                    {/* Cabeceras */}
                                    <div className="grid grid-cols-4">
                                        <div className="px-4 py-3 bg-info-content text-white font-semibold uppercase text-xs flex items-center gap-2 border-b-2 border-gray-200 col-span-2">
                                            <i className="fas fa-list-check"></i> Requisito Individual
                                        </div>
                                        <div className="px-4 py-3 bg-blue-600 text-white font-semibold uppercase tracking-wider flex items-center text-xs gap-2 border-b-2 border-gray-200">
                                            <i className="fas fa-mars"></i>
                                            <span className="truncate">{contrayentes[0]?.nombre || 'Contrayente 1'}</span>
                                        </div>
                                        <div className="px-4 py-3 bg-pink-600 text-white font-semibold uppercase tracking-wider flex items-center text-xs gap-2 border-b-2 border-gray-200">
                                            <i className="fas fa-venus"></i>
                                            <span className="truncate">{contrayentes[1]?.nombre || 'Contrayente 2'}</span>
                                        </div>
                                    </div>

                                    {/* Filas */}
                                    {reqsIndividuales.map((req, idx) => {
                                        const key1 = getRequisitoKey(req.id, 1);
                                        const key2 = getRequisitoKey(req.id, 2);
                                        const ambosChecked =
                                            requisitosEstados.get(key1) === 1 &&
                                            requisitosEstados.get(key2) === 1;

                                        return (
                                            <div key={req.id} className="grid grid-cols-4">
                                                {/* Celda descripción */}
                                                <div className="p-4 border-b border-l border-gray-300 col-span-2 flex flex-row justify-between">
                                                    <div>
                                                        <div className="flex items-start">
                                                            <span className="inline-flex items-center justify-center w-5 h-5 bg-info-content text-white text-[0.68rem] font-bold rounded-full shrink-0 mr-2 mt-0.5 leading-none">
                                                                {idx + 1}
                                                            </span>
                                                            <span className="text-lg font-semibold text-gray-900">
                                                                {req.nombre_requisito}
                                                            </span>
                                                        </div>
                                                        <p className="text-[0.78rem] text-gray-500 mt-1 leading-relaxed ml-7">
                                                            {req.descripcion}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col justify-between gap-2 shrink-0 ml-2">
                                                        {/* Botón Ambos */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (!ambosChecked) {
                                                                    if (applies1 && requisitosEstados.get(key1) !== 1) handleCheckboxChange(req.id, 1);
                                                                    if (applies2 && requisitosEstados.get(key2) !== 1) handleCheckboxChange(req.id, 2);
                                                                } else {
                                                                    if (applies1) handleCheckboxChange(req.id, 1);
                                                                    if (applies2) handleCheckboxChange(req.id, 2);
                                                                }
                                                            }}
                                                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border border-green-500 text-green-800 rounded-lg cursor-pointer transition-colors bg-green-50 hover:bg-green-700 hover:text-white"
                                                            title="Marcar/desmarcar ambos contrayentes"
                                                        >
                                                            <i className="fas fa-check-double"></i> Ambos
                                                        </button>
                                                        <span className={`inline-block text-xs px-2 py-1 rounded-full font-semibold text-center ${meta.tagClass}`}>
                                                            {meta.tagLabel}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Celda contrayente 1 */}
                                                {applies1 ? (
                                                    <ContrayenteCell
                                                        reqId={req.id}
                                                        contrayenteIndex={1}
                                                        className="border-l border-r border-b border-blue-300 bg-blue-100"
                                                        {...handlerProps}
                                                    />
                                                ) : (
                                                    <div className="p-4 border-b border-r border-l border-blue-300 flex items-center justify-center">
                                                        <span className="text-xs text-gray-500 italic">No aplica</span>
                                                    </div>
                                                )}

                                                {/* Celda contrayente 2 */}
                                                {applies2 ? (
                                                    <ContrayenteCell
                                                        reqId={req.id}
                                                        contrayenteIndex={2}
                                                        className="border-r border-b border-pink-300 bg-pink-100"
                                                        {...handlerProps}
                                                    />
                                                ) : (
                                                    <div className="p-4 border-b border-gray-300 flex items-center justify-center">
                                                        <span className="text-xs text-gray-500 italic">No aplica</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* ─── NOTA INFORMATIVA ─── */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                <div className="shrink-0">
                    <i className="fas fa-info-circle text-blue-600 text-xl"></i>
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                    <p className="font-semibold mb-1">Importante:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                        <li>LA PROGRAMACIÓN DE MATRIMONIO SE REALIZA CON UN MES DE ANTICIPACIÓN.</li>
                        <li>Cada contrayente debe completar sus requisitos de forma independiente.</li>
                        <li>Los requisitos específicos dependen del estado civil de cada contrayente.</li>
                        <li>Al marcar un requisito como completado, podrá adjuntar documentos y agregar observaciones.</li>
                        <li>Los documentos son opcionales (menor a 5 MB).</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default RequisitosMatrimonio;