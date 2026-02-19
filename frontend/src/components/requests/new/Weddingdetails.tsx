import { useState, useEffect } from 'react';
import { useGetOficiantes } from '../../../hooks/useGetOficiantes';
import { useApplicationContext } from '../../../context/ApplicationContext';

interface Solicitud {
    tipoSolicitudNombre?: string;
    descriptionSolicitud?: string;
    onWeddingDetailsChange?: (details: WeddingDetailsFormData) => void;
    onValidationChange?: (isValid: boolean) => void;
}

interface WeddingDetailsFormData {
    tipoSolicitud?: string;
    nombreSolicitud?: string;
    oficiante: string;
    fechaBoda: string;
    horaBoda: string;
    direccion: string;
}


const Weddingdetails = (props: Solicitud) => {
    const { tipoSolicitudNombre, descriptionSolicitud, onWeddingDetailsChange, onValidationChange } = props;

    // Hook del contexto
    const { formDataAplication, updateMarriageDetails } = useApplicationContext();

    // Hook para obtener oficiantes
    const { oficiantes, loading: loadingOficiantes, error: errorOficiantes } = useGetOficiantes('oficiante');

    // Estados del formulario - Inicializar con datos del contexto si existen
    const [weddingDetails, setWeddingDetails] = useState<WeddingDetailsFormData>(() => ({
        tipoSolicitud: 'matrimonio',
        nombreSolicitud: '',
        oficiante: formDataAplication.marriageDetails?.marriageOfficiantId?.toString() || '',
        fechaBoda: formDataAplication.marriageDetails?.marriageDate || '',
        horaBoda: formDataAplication.marriageDetails?.marriageTime || '',
        direccion: formDataAplication.marriageDetails?.marriagePlace || ''
    }));

    const [isWeddingDetailsValid, setIsWeddingDetailsValid] = useState(false);
    const [dateError, setDateError] = useState<string>('');

    // Función para validar que la fecha no sea pasada
    const validateDate = (fecha: string): boolean => {
        if (!fecha) return false;

        const fechaSeleccionada = new Date(fecha);
        const hoy = new Date();

        // Establecer la hora a 00:00:00 para comparar solo las fechas
        hoy.setHours(0, 0, 0, 0);
        fechaSeleccionada.setHours(0, 0, 0, 0);

        return fechaSeleccionada >= hoy;
    };

    // Sincronizar cambios en los detalles del matrimonio
    useEffect(() => {
        const isFechaValida = validateDate(weddingDetails.fechaBoda);

        const isValid =
            weddingDetails.oficiante !== '' &&
            weddingDetails.fechaBoda !== '' &&
            isFechaValida &&
            weddingDetails.horaBoda !== '' &&
            weddingDetails.direccion.trim() !== '';

        setIsWeddingDetailsValid(isValid);

        // Guardar en el contexto
        updateMarriageDetails({
            marriageOfficiantId: weddingDetails.oficiante ? parseInt(weddingDetails.oficiante) : 0,
            marriagePlace: weddingDetails.direccion,
            marriageDate: weddingDetails.fechaBoda,
            marriageTime: weddingDetails.horaBoda
        });

        if (onWeddingDetailsChange) {
            onWeddingDetailsChange(weddingDetails);
        }

        if (onValidationChange) {
            onValidationChange(isValid);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weddingDetails]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Validar fecha si el campo es fechaBoda
        if (name === 'fechaBoda') {
            if (value && !validateDate(value)) {
                setDateError('La fecha de casamiento no puede ser una fecha pasada. Por favor, seleccione una fecha actual o futura.');
            } else {
                setDateError('');
            }
        }

        setWeddingDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 pb-3 border-b border-b-blue-300">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-ring text-blue-600"></i>
                    <span>Detalles del Matrimonio</span>
                </h3>
                {tipoSolicitudNombre && (
                    <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex flex-col items-center w-fit">
                        <div>
                            <i className="fas fa-file-alt mr-2"></i>
                            {tipoSolicitudNombre.toUpperCase()}
                        </div>
                        <span className='text-xs font-normal text-center'>
                            {descriptionSolicitud}
                        </span>
                    </span>
                )}
            </div>

            {/* Formulario de Detalles del Matrimonio */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-church text-blue-600"></i>
                    Información del Evento Matrimonial
                </h4>

                <div className="space-y-4">
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                        {/* Tipo de Solicitud */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Solicitud <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-3 min-h-8">
                                <i className="fas fa-info-circle mr-1"></i>
                                <span>El tipo de solicitud es Matrimonio Civil</span>
                            </p>
                            <div className="w-full py-2 sm:py-2.5 text-sm sm:text-base bg-white px-3 border border-gray-300 rounded-lg text-gray-800 flex items-center">
                                {tipoSolicitudNombre?.toUpperCase() || 'Matrimonio Civil'}
                            </div>
                        </div>

                        {/* Descripción de la Solicitud */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción de la Solicitud <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-3 min-h-8">
                                <i className="fas fa-info-circle mr-1"></i>
                                <span>Proporcione una descripción breve del matrimonio</span>
                            </p>
                            <div className="w-full py-2 sm:py-2.5 text-sm sm:text-base bg-white px-3 border border-gray-300 rounded-lg text-gray-800 flex items-center">
                                {descriptionSolicitud?.toUpperCase() || 'Solicitud de Matrimonio Civil'}
                            </div>
                        </div>
                    </div>
                    {/* Selector de Oficial o Sacerdote */}
                    <div className='border-t border-gray-200 pt-4'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Oficial o Sacerdote <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3 min-h-8">
                            <i className="fas fa-info-circle mr-1"></i>
                            <span>Seleccione el oficiante que oficiará el matrimonio</span>
                        </p>

                        {errorOficiantes && (
                            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600 flex items-center gap-2">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errorOficiantes}
                                </p>
                            </div>
                        )}

                        <select
                            name="oficiante"
                            value={weddingDetails.oficiante}
                            onChange={handleInputChange}
                            disabled={loadingOficiantes}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">
                                {loadingOficiantes ? 'Cargando oficiantes...' : 'Seleccione un oficiante'}
                            </option>
                            {oficiantes.map((oficiante) => (
                                <option key={oficiante.id} value={oficiante.id}>
                                    {oficiante.full_name}
                                </option>
                            ))}
                        </select>

                        {loadingOficiantes && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                <i className="fas fa-spinner fa-spin"></i>
                                <span>Cargando oficiantes...</span>
                            </div>
                        )}
                    </div>

                    {/* Grid para Fecha y Hora */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Fecha de la Boda */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha de Programación <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-3 min-h-8">
                                <i className="fas fa-info-circle mr-1"></i>
                                <span>Seleccione la fecha del evento (no puede ser una fecha pasada)</span>
                            </p>
                            <input
                                type="date"
                                name="fechaBoda"
                                value={weddingDetails.fechaBoda}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    dateError ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {dateError && (
                                <p className="text-red-500 text-xs mt-1 flex items-start gap-1">
                                    <i className="fas fa-exclamation-circle mt-0.5"></i>
                                    <span>{dateError}</span>
                                </p>
                            )}
                        </div>

                        {/* Hora de la Boda */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hora de Programación <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-3 min-h-8">
                                <i className="fas fa-info-circle mr-1"></i>
                                <span>Seleccione la hora del evento</span>
                            </p>
                            <input
                                type="time"
                                name="horaBoda"
                                value={weddingDetails.horaBoda}
                                onChange={handleInputChange}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Dirección del Evento */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dirección del Evento <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3 min-h-8">
                            <i className="fas fa-info-circle mr-1"></i>
                            <span>Proporcione la dirección completa del lugardelmatrimonio</span>
                        </p>
                        <textarea
                            name="direccion"
                            value={weddingDetails.direccion}
                            onChange={handleInputChange}
                            placeholder="Ej: Calle Principal 123, Distrito, Provincia"
                            rows={3}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Resumen de Información */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <i className="fas fa-clipboard-check text-blue-600"></i>
                    Resumen de Información
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-semibold">Tipo de Solicitud:</span> {tipoSolicitudNombre?.toUpperCase()}</p>
                    <p><span className="font-semibold">Descripción:</span> {descriptionSolicitud?.toUpperCase()}</p>
                    <p>
                        <span className="font-semibold">Oficial/Sacerdote:</span>{' '}
                        {weddingDetails.oficiante
                            ? oficiantes.find(o => o.id === weddingDetails.oficiante)?.full_name || weddingDetails.oficiante
                            : '-'
                        }
                    </p>
                    <p><span className="font-semibold">Fecha y Hora:</span> {weddingDetails.fechaBoda ? `${weddingDetails.fechaBoda} a las ${weddingDetails.horaBoda || '--:--'}` : '-'}</p>
                    <p><span className="font-semibold">Dirección:</span> {weddingDetails.direccion || '-'}</p>
                </div>
            </div>

            {/* Estado de Validación */}
            <div className={`p-4 rounded-lg flex items-center gap-2 ${isWeddingDetailsValid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <i className={`fas ${isWeddingDetailsValid ? 'fa-check-circle text-green-600' : 'fa-exclamation-circle text-yellow-600'}`}></i>
                <span className={`text-sm font-medium ${isWeddingDetailsValid ? 'text-green-800' : 'text-yellow-800'}`}>
                    {isWeddingDetailsValid ? '✓ Todos los campos requeridos están completos' : '⚠ Completa los campos obligatorios para continuar'}
                </span>
            </div>
        </div>
    );
};

export default Weddingdetails;