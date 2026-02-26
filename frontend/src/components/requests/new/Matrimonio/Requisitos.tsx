import { useEffect } from 'react';
import {
    useRequisitosMatrimonio,
    RequisitosContrayente,
    getRequisitoKey,
    formatearTamaño,
    getIconoArchivo,
    getNombreCondicion,
    getIconoCondicion,
    getColorCondicion,
} from './req-components';
import type { RequisitosMatrimonioProps } from './req-components';

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
        calcularProgreso,
        calcularProgresoPorContrayente,
        requisitosAgrupadosPorContrayente,
        handleCheckboxChange,
        marcarTodosObligatorios,
        desmarcarTodos,
        handleRequisitoFileChange,
        handleEliminarArchivoRequisito,
        handleObservacionChange,
        handleErrorClear,
    } = useRequisitosMatrimonio();

    const progreso = calcularProgreso();

    // Notificar cambios en requisitos
    useEffect(() => {
        if (onRequisitosChange) {
            onRequisitosChange(requisitos);
        }
    }, [requisitos, onRequisitosChange]);

    // Notificar cambios en archivos
    useEffect(() => {
        if (onArchivosChange) {
            onArchivosChange(archivos);
        }
    }, [archivos, onArchivosChange]);

    // Validar avanzar con al menos un requisito
    useEffect(() => {
        if (onValidationChange) {
            const hayErroresArchivo = erroresArchivo.size > 0;
            const isStepValid = progreso.completados > 0 && !hayErroresArchivo;
            onValidationChange(isStepValid);
        }
    }, [progreso.completados, erroresArchivo, onValidationChange]);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <HeaderRequisitos 
                tipoSolicitudNombre={tipoSolicitudNombre}
                descriptionSolicitud={descriptionSolicitud}
            />

            {/* Requisitos de los contrayentes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {/* Contrayente 1 */}
                <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50/30">
                    <RequisitosContrayente
                        contrayenteIndex={1}
                        contrayente={contrayentes[0]}
                        grupos={requisitosAgrupadosPorContrayente(1)}
                        progreso={calcularProgresoPorContrayente(1)}
                        requisitosEstados={requisitosEstados}
                        archivosRequisitos={archivosRequisitos}
                        observacionesMap={observacionesMap}
                        erroresArchivo={erroresArchivo}
                        onMarcarTodos={marcarTodosObligatorios}
                        onDesmarcarTodos={desmarcarTodos}
                        onCheckboxChange={handleCheckboxChange}
                        onFileChange={handleRequisitoFileChange}
                        onFileDelete={handleEliminarArchivoRequisito}
                        onObservacionChange={handleObservacionChange}
                        onErrorClear={handleErrorClear}
                        getRequisitoKey={getRequisitoKey}
                        formatearTamaño={formatearTamaño}
                        getIconoArchivo={getIconoArchivo}
                        getNombreCondicion={getNombreCondicion}
                        getIconoCondicion={getIconoCondicion}
                        getColorCondicion={getColorCondicion}
                    />
                </div>

                {/* Contrayente 2 */}
                <div className="border-2 border-pink-200 rounded-xl p-4 bg-pink-50/30">
                    <RequisitosContrayente
                        contrayenteIndex={2}
                        contrayente={contrayentes[1]}
                        grupos={requisitosAgrupadosPorContrayente(2)}
                        progreso={calcularProgresoPorContrayente(2)}
                        requisitosEstados={requisitosEstados}
                        archivosRequisitos={archivosRequisitos}
                        observacionesMap={observacionesMap}
                        erroresArchivo={erroresArchivo}
                        onMarcarTodos={marcarTodosObligatorios}
                        onDesmarcarTodos={desmarcarTodos}
                        onCheckboxChange={handleCheckboxChange}
                        onFileChange={handleRequisitoFileChange}
                        onFileDelete={handleEliminarArchivoRequisito}
                        onObservacionChange={handleObservacionChange}
                        onErrorClear={handleErrorClear}
                        getRequisitoKey={getRequisitoKey}
                        formatearTamaño={formatearTamaño}
                        getIconoArchivo={getIconoArchivo}
                        getNombreCondicion={getNombreCondicion}
                        getIconoCondicion={getIconoCondicion}
                        getColorCondicion={getColorCondicion}
                    />
                </div>
            </div>

            {/* Mensaje Informativo */}
            <MensajeInformativo />
        </div>
    );
};

// Componente para el header
const HeaderRequisitos = ({ 
    tipoSolicitudNombre, 
    descriptionSolicitud 
}: { 
    tipoSolicitudNombre?: string; 
    descriptionSolicitud?: string; 
}) => (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 pb-3 border-b border-b-blue-300">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-clipboard-check text-blue-600"></i>
            <span className="text-lg">Requisitos para el Matrimonio</span>
        </h3>
        {tipoSolicitudNombre && (
            <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex flex-col items-center w-fit">
                <div>
                    <i className="fas fa-file-alt mr-2"></i>
                    {tipoSolicitudNombre.toUpperCase()}
                </div>
                <span className="text-xs">
                    {descriptionSolicitud}
                </span>
            </span>
        )}
    </div>
);

// mensaje informativo
const MensajeInformativo = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <div className="shrink-0">
            <i className="fas fa-info-circle text-blue-600 text-xl"></i>
        </div>
        <div className="text-xs sm:text-sm text-gray-700">
            <p className="font-semibold mb-1">Importante:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>LA PROGRAMACIÓN DE MATRIMONIO SE REALIZA CON UN MES DE ANTICIPACIÓN.</li>
                <li>Cada contrayente debe completar sus requisitos de forma independiente.</li>
                <li>Los requisitos específicos dependen del estado civil de cada contrayente.</li>
                <li>Al marcar un requisito como completado, podrás adjuntar los documentos correspondientes.</li>
                <li>Los documentos adicionales son opcionales pero recomendados para agilizar el proceso.</li>
            </ul>
        </div>
    </div>
);

export default RequisitosMatrimonio;