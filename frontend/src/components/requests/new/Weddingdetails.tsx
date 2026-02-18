import { useState, useCallback, useEffect } from 'react';
import { usePersonSearch } from '../../../hooks/usePersonSearch.ts';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchTypeDocument } from "../../../Validations/validationSearchTypeDocument.ts";
import { z } from "zod";

interface Solicitud {
    tipoSolicitudNombre?: string;
    descriptionSolicitud?: string;
    onWeddingDetailsChange?: (details: WeddingDetailsFormData) => void;
    onValidationChange?: (isValid: boolean) => void;
}

interface WeddingDetailsFormData {
    tipoSolicitud?: string;
    nombreSolicitud?: string;
    dniOficiante: string;
    nombreOficiante: string;
    apellidosOficiante: string;
    fechaBoda: string;
    horaBoda: string;
    direccion: string;
}

type inputSearch = z.infer<typeof searchTypeDocument>;

const Weddingdetails = (props: Solicitud) => {
    const { tipoSolicitudNombre, descriptionSolicitud, onWeddingDetailsChange, onValidationChange } = props;

    // Estados del formulario
    const [weddingDetails, setWeddingDetails] = useState<WeddingDetailsFormData>({
        tipoSolicitud: 'matrimonio',
        nombreSolicitud: '',
        dniOficiante: '',
        nombreOficiante: '',
        apellidosOficiante: '',
        fechaBoda: '',
        horaBoda: '',
        direccion: ''
    });

    // Estados para búsqueda de Oficiante
    const {
        register: registerSearch,
        watch: watchSearch,
        formState: { errors: errorsSearch },
        reset: resetSearch
    } = useForm<inputSearch>({
        resolver: zodResolver(searchTypeDocument),
        defaultValues: {
            documentType: 'dni',
            documentNumber: ''
        }
    });

    const tipoDocOficiante = watchSearch('documentType');
    const numDocOficiante = watchSearch('documentNumber');

    const { fetchPersonSearch, loading } = usePersonSearch();

    const [searchError, setSearchError] = useState('');
    const [searchSuccess, setSearchSuccess] = useState(false);
    const [isWeddingDetailsValid, setIsWeddingDetailsValid] = useState(false);

    // Sincronizar cambios en los detalles del matrimonio
    useEffect(() => {
        const isValid =
            weddingDetails.dniOficiante !== '' &&
            weddingDetails.fechaBoda !== '' &&
            weddingDetails.horaBoda !== '' &&
            weddingDetails.direccion.trim() !== '';

        setIsWeddingDetailsValid(isValid);

        if (onWeddingDetailsChange) {
            onWeddingDetailsChange(weddingDetails);
        }

        if (onValidationChange) {
            onValidationChange(isValid);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weddingDetails]);

    // Función para buscar Oficiante
    const handleSearchOficiante = useCallback(async () => {
        const tipoDoc = tipoDocOficiante;
        const numDoc = numDocOficiante;

        setSearchError('');
        setSearchSuccess(false);

        try {
            const documentTypeMapping: Record<string, number> = {
                'dni': 1,
                'pas': 2,
                'ced': 3
            };

            const documentTypeNumber = documentTypeMapping[tipoDoc] || 1;
            const response = await fetchPersonSearch(numDoc, documentTypeNumber);

            if (!response || !response.status || !response.data) {
                setSearchError('No se encontró ningún Oficiante con ese documento');
                return;
            }

            const personData = response.data;

            // Llenar los datos del Oficiante
            setWeddingDetails(prev => ({
                ...prev,
                dniOficiante: numDoc,
                nombreOficiante: personData.name || '',
                apellidosOficiante: `${personData.paternalSurname || ''} ${personData.maternalSurname || ''}`.trim()
            }));

            setSearchSuccess(true);
            resetSearch();
            setTimeout(() => setSearchSuccess(false), 2000);
        } catch (error: any) {
            console.error('Error al buscar Oficiante:', error);
            setSearchError(error.response?.data?.message || 'Error al buscar Oficiante');
        }
    }, [tipoDocOficiante, numDocOficiante, fetchPersonSearch, resetSearch]);

    // Función para limpiar búsqueda
    const handleClearSearch = useCallback(() => {
        setSearchError('');
        setSearchSuccess(false);
        setWeddingDetails(prev => ({
            ...prev,
            dniOficiante: '',
            nombreOficiante: '',
            apellidosOficiante: ''
        }));
        resetSearch();
    }, [resetSearch]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchOficiante();
        }
    }, [handleSearchOficiante]);

    const handleDocumentInput = useCallback((e: React.FormEvent<HTMLInputElement>, tipoDoc: string) => {
        const input = e.currentTarget;
        const value = input.value;

        if (tipoDoc === 'dni' || tipoDoc === 'ced') {
            const numericValue = value.replace(/\D/g, '');
            if (value !== numericValue) {
                input.value = numericValue;
                const event = new Event('input', { bubbles: true });
                input.dispatchEvent(event);
            }
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
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
                    {/* Buscador de Oficial */}
                    <div className='border-t border-gray-200 pt-4'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Oficial o Sacerdote <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3 min-h-8">
                            <i className="fas fa-info-circle mr-1"></i>
                            <span>Busque al Oficial o Sacerdote por documento de identidad</span>
                        </p>

                        <div className='mb-4 flex flex-col md:flex-row items-start gap-4'>
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de documento
                                </label>
                                <select
                                    defaultValue="dni"
                                    className="select outline-0 w-full py-2 sm:py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 transition-all bg-white px-3 border border-gray-300 rounded-lg"
                                    {...registerSearch('documentType')}
                                >
                                    <option value="dni">DNI</option>
                                    <option value="pas">PASAPORTE</option>
                                    <option value="ced">CEDULA</option>
                                </select>
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Buscar por Documento
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                        <i className="fas fa-search text-gray-400 text-sm"></i>
                                    </div>
                                    <input
                                        type="text"
                                        onKeyDown={handleKeyDown}
                                        onInput={(e) => handleDocumentInput(e, tipoDocOficiante)}
                                        className={`w-full pl-9 sm:pl-11 pr-20 sm:pr-24 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all ${
                                            searchSuccess
                                                ? 'border-green-500 bg-green-50'
                                                : searchError
                                                    ? 'border-red-300 bg-red-50'
                                                    : 'border-gray-300'
                                        }`}
                                        {...registerSearch('documentNumber')}
                                        placeholder={tipoDocOficiante === 'dni' ? "8 dígitos" : tipoDocOficiante === 'pas' ? "Pasaporte" : "Cédula"}
                                        maxLength={tipoDocOficiante === 'dni' ? 8 : tipoDocOficiante === 'ced' ? 10 : 20}
                                    />
                                    {numDocOficiante && numDocOficiante.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            className="absolute inset-y-0 right-12 sm:right-16 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Limpiar"
                                        >
                                            <i className="fas fa-times text-sm"></i>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleSearchOficiante}
                                        disabled={!!errorsSearch.documentNumber || !numDocOficiante || numDocOficiante.length === 0}
                                        className="cursor-pointer absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                        title="Buscar"
                                    >
                                        {loading ? (
                                            <i className="fas fa-spinner fa-spin text-sm"></i>
                                        ) : (
                                            <i className="fas fa-arrow-right text-sm"></i>
                                        )}
                                    </button>
                                </div>
                                <div className='h-4 sm:h-5 p-1'>
                                    {errorsSearch.documentNumber && (
                                        <p className="text-red-500 text-xs mt-1">{errorsSearch.documentNumber.message}</p>
                                    )}
                                    {searchError && (
                                        <p className="text-red-500 text-xs mt-1">{searchError}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Datos del Oficial seleccionado */}
                        {weddingDetails.dniOficiante && (
                            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">DNI:</span> {weddingDetails.dniOficiante}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">Nombre:</span> {weddingDetails.nombreOficiante}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">Apellidos:</span> {weddingDetails.apellidosOficiante}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                                    >
                                        Cambiar
                                    </button>
                                </div>
                            </div>
                        )}

                        {!weddingDetails.dniOficiante && (
                            <p className="text-sm text-gray-500 italic">
                                Busca un oficial o sacerdote por su documento
                            </p>
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
                                <span>Seleccione la fecha del evento</span>
                            </p>
                            <input
                                type="date"
                                name="fechaBoda"
                                value={weddingDetails.fechaBoda}
                                onChange={handleInputChange}
                                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
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
                    <p><span className="font-semibold">Oficial/Sacerdote:</span> {weddingDetails.nombreOficiante ? `${weddingDetails.nombreOficiante} ${weddingDetails.apellidosOficiante}` : '-'}</p>
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