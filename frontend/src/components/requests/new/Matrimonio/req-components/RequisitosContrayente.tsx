import { memo } from 'react';
import type { RequisitosContrayenteProps } from './types';
import RequisitoItem from './RequisitoItem';

const RequisitosContrayente = memo(({
    contrayenteIndex,
    contrayente,
    grupos,
    progreso,
    requisitosEstados,
    archivosRequisitos,
    observacionesMap,
    erroresArchivo,
    onMarcarTodos,
    onDesmarcarTodos,
    onCheckboxChange,
    onFileChange,
    onFileDelete,
    onObservacionChange,
    onErrorClear,
    getRequisitoKey,
    formatearTamaño,
    getIconoArchivo,
    getNombreCondicion,
    getIconoCondicion,
    getColorCondicion,
}: RequisitosContrayenteProps) => {
    // Estado vacío cuando no hay contrayente
    if (!contrayente) {
        return (
            <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-center">
                    <i className="fas fa-user-plus text-2xl mb-2 block"></i>
                    No hay contrayente {contrayenteIndex} registrado
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header del Contrayente */}
            <ContrayenteHeader 
                contrayenteIndex={contrayenteIndex}
                nombre={contrayente.nombre}
                progreso={progreso}
            />

            {/* Botones de acción */}
            <AccionesContrayente
                contrayenteIndex={contrayenteIndex}
                onMarcarTodos={onMarcarTodos}
                onDesmarcarTodos={onDesmarcarTodos}
            />

            {/* Lista de Requisitos por Condición */}
            <div className="space-y-4">
                {Object.entries(grupos).map(([condicion, requisitosGrupo]) => {
                    const color = getColorCondicion(condicion);

                    return (
                        <div key={condicion} className="space-y-2">
                            {/* Header de la Sección */}
                            <div className="flex items-center gap-2 pb-1">
                                <i className={`fas ${getIconoCondicion(condicion)} text-${color}-600 text-sm`}></i>
                                <h5 className={`text-xs font-bold text-${color}-700 uppercase`}>
                                    {getNombreCondicion(condicion)}
                                </h5>
                                <span className={`ml-auto bg-${color}-100 text-${color}-800 text-xs font-semibold px-1.5 py-0.5 rounded`}>
                                    {requisitosGrupo.length}
                                </span>
                            </div>

                            {/* Requisitos del Grupo */}
                            <div className="bg-white border border-gray-300 rounded-lg divide-y divide-gray-200">
                                {requisitosGrupo.map((requisito, index) => {
                                    const requisitoKey = getRequisitoKey(requisito.id, contrayenteIndex);
                                    const estadoEnMap = requisitosEstados.get(requisitoKey);
                                    const isCompleted = estadoEnMap === 1;

                                    return (
                                        <RequisitoItem
                                            key={requisitoKey}
                                            requisito={requisito}
                                            index={index}
                                            contrayenteIndex={contrayenteIndex}
                                            isCompleted={isCompleted}
                                            archivos={archivosRequisitos.get(requisitoKey) || []}
                                            observacion={observacionesMap.get(requisitoKey) ?? ''}
                                            error={erroresArchivo.get(requisitoKey)}
                                            onCheckboxChange={onCheckboxChange}
                                            onFileChange={onFileChange}
                                            onFileDelete={onFileDelete}
                                            onObservacionChange={onObservacionChange}
                                            onErrorClear={onErrorClear}
                                            getRequisitoKey={getRequisitoKey}
                                            formatearTamaño={formatearTamaño}
                                            getIconoArchivo={getIconoArchivo}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

RequisitosContrayente.displayName = 'RequisitosContrayente';

// Sub-componente para el header del contrayente
interface ContrayenteHeaderProps {
    contrayenteIndex: number;
    nombre: string;
    progreso: { completados: number; total: number; porcentaje: number };
}

const ContrayenteHeader = memo(({ contrayenteIndex, nombre, progreso }: ContrayenteHeaderProps) => (
    <div className={`bg-linear-to-r ${contrayenteIndex === 1 ? 'from-blue-500 to-blue-600' : 'from-pink-500 to-pink-600'} text-white rounded-lg p-4`}>
        <div className="flex items-center gap-3 mb-2">
            <i className={`fas ${contrayenteIndex === 1 ? 'fa-mars' : 'fa-venus'} text-2xl`}></i>
            <div>
                <h4 className="font-bold text-lg">Contrayente {contrayenteIndex}</h4>
                <p className="text-sm opacity-90 truncate max-w-50" title={nombre}>
                    {nombre}
                </p>
            </div>
        </div>
        {/* Mini barra de progreso */}
        <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
                <span>{progreso.completados}/{progreso.total} requisitos</span>
                <span className="font-bold">{progreso.porcentaje}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${progreso.porcentaje === 100 ? 'bg-green-400' : 'bg-white'}`}
                    style={{ width: `${progreso.porcentaje}%` }}
                ></div>
            </div>
        </div>
    </div>
));

ContrayenteHeader.displayName = 'ContrayenteHeader';

// Sub-componente para los botones de acción
interface AccionesContrayenteProps {
    contrayenteIndex: number;
    onMarcarTodos: (index: number) => void;
    onDesmarcarTodos: (index: number) => void;
}

const AccionesContrayente = memo(({ contrayenteIndex, onMarcarTodos, onDesmarcarTodos }: AccionesContrayenteProps) => (
    <div className="flex gap-2">
        <button
            type="button"
            onClick={() => onMarcarTodos(contrayenteIndex)}
            className="flex-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
            <i className="fas fa-check-double"></i>
            Marcar Todos
        </button>
        <button
            type="button"
            onClick={() => onDesmarcarTodos(contrayenteIndex)}
            className="flex-1 px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
            <i className="fas fa-times-circle"></i>
            Desmarcar
        </button>
    </div>
));

AccionesContrayente.displayName = 'AccionesContrayente';

export default RequisitosContrayente;
