import {useCallback, useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {usePersonSearch} from '../../../hooks/usePersonSearch';
import {type SolicitanteFormData, solicitanteSchema} from '../../../Validations/valitationForm';
import {ApplicationHandler} from "../../../context/ApplicationContext.tsx";
import type {Participant} from "../../../model/aplicationModel.ts";

interface ApplicantFormProps {
    onChange?: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => void;
    onSolicitantesChange?: (solicitantes: Participant[]) => void;
    tipoSolicitudNombre?: string;
}

export default function ApplicantForm({
    onChange,
    onSolicitantesChange,
    tipoSolicitudNombre
}: ApplicantFormProps) {
    const {addParticipant, deleteParticipant, formDataAplication, updateApplicationData} = ApplicationHandler();

    // Estado para número de expediente
    const [expedientNumber, setExpedientNumber] = useState<string>(() => {
        return formDataAplication.application.expedientNumber || '';
    });
    const [expedientError, setExpedientError] = useState<string>('');

    // Estados para el formulario de búsqueda (sin Zod)
    const [tipoDocumentoSeleccionado, setTipoDocumentoSeleccionado] = useState<string>('dni');
    const [numDni, setNumDni] = useState<string>('');
    const [searchValidationError, setSearchValidationError] = useState<string>('');

    const { fetchPersonSearch, loading } = usePersonSearch();
    const [searchError, setSearchError] = useState('');
    const [searchSuccess, setSearchSuccess] = useState(false);
    const [solicitantesAgregados, setSolicitantesAgregados] = useState<Participant[]>(()=>{
        try {
            const pendingApp = localStorage.getItem('pending_application');
            if (!pendingApp) return [];

            const parsed = JSON.parse(pendingApp);
            const solicitante = parsed?.participants?.find((p: Participant) => p.role === 'solicitante');

            return solicitante ? [solicitante] : [];
        } catch (error) {
            console.error('Error al cargar solicitante desde localStorage:', error);
            return [];
        }
    });

    // Función para manejar el cambio de número de expediente
    const handleExpedientNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim().toUpperCase();
        setExpedientNumber(value);

        if (value.length === 0) {
            setExpedientError('El número de expediente es obligatorio');
        } else if (value.length < 5) {
            setExpedientError('El número de expediente debe tener al menos 5 caracteres');
        } else {
            setExpedientError('');
            // Actualizar en el contexto
            updateApplicationData({ expedientNumber: value });
        }
    }, [updateApplicationData]);

    // Verificar si el expediente está completo
    const isExpedientValid = expedientNumber.length >= 5 && !expedientError;

    // useForm con Zod para el formulario de datos del solicitante
    const {
        register,
        formState: { errors },
        setValue,
        reset,
        getValues
    } = useForm<SolicitanteFormData>({
        resolver: zodResolver(solicitanteSchema),
        mode: 'onChange',
        defaultValues: {
            dni: '',
            names: '',
            paternalSurname: '',
            maternalSurname: '',
            birthdate: '',
            gender: 'M',
            address: '',
            email: '',
            phone: '',
            ubigeoId: '',
            maritalStatus: 'Single'
        }
    });


    // Validación manual para el formulario de búsqueda
    const validateSearchDocument = useCallback((docType: string, docNumber: string): string => {
        if (!docNumber || docNumber.trim() === '') {
            return 'El número de documento es obligatorio';
        }

        if (docType === 'dni') {
            if (!/^\d+$/.test(docNumber)) {
                return 'El DNI solo debe contener números';
            }
            if (docNumber.length !== 8) {
                return 'El DNI debe tener exactamente 8 dígitos';
            }
        }

        if (docType === 'pas') {
            if (docNumber.length < 6) {
                return 'Pasaporte inválido (mínimo 6 caracteres)';
            }
        }

        if (docType === 'ced') {
            if (!/^\d+$/.test(docNumber)) {
                return 'La cédula solo debe contener números';
            }
            if (docNumber.length !== 10) {
                return 'La cédula debe tener exactamente 10 dígitos';
            }
        }

        return '';
    }, []);

    // Handler para cambio de tipo de documento
    const handleDocumentTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value;
        setTipoDocumentoSeleccionado(newType);
        setNumDni('');
        setSearchValidationError('');
        setSearchError('');
        setSearchSuccess(false);
    }, []);

    // Handler para cambio de número de documento
    const handleDocumentNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Aplicar restricciones según el tipo de documento
        let cleanedValue = value;
        if (tipoDocumentoSeleccionado === 'dni') {
            cleanedValue = value.replace(/\D/g, '').slice(0, 8);
        } else if (tipoDocumentoSeleccionado === 'ced') {
            cleanedValue = value.replace(/\D/g, '').slice(0, 10);
        } else if (tipoDocumentoSeleccionado === 'pas') {
            cleanedValue = value.slice(0, 20);
        }

        setNumDni(cleanedValue);

        // Validar en tiempo real
        const error = validateSearchDocument(tipoDocumentoSeleccionado, cleanedValue);
        setSearchValidationError(error);

        if (cleanedValue === '') {
            setSearchError('');
            setSearchSuccess(false);
        }
    }, [tipoDocumentoSeleccionado, validateSearchDocument]);

    // Sincronizar solicitantes agregados con el padre
    useEffect(() => {
        if (onSolicitantesChange) {
            onSolicitantesChange(solicitantesAgregados);
        }
    }, [solicitantesAgregados, onSolicitantesChange]);


    // Buscar solicitante por documento
    const handleSearchApplicant = useCallback(async () => {
        setSearchError('');
        setSearchSuccess(false);

        try {
            const documentTypeMapping: Record<string, number> = {
                'dni': 1,
                'pas': 2,
                'ced': 3
            };

            const documentTypeNumber = documentTypeMapping[tipoDocumentoSeleccionado] || 1;
            const response = await fetchPersonSearch(numDni, documentTypeNumber);

            if (!response || !response.status || !response.data) {
                setSearchError('No se encontró ningún solicitante con ese documento');
                reset();
                return;
            }

            const personData = response.data;
            const validGender = personData.gender === 'M' || personData.gender === 'F'
                ? personData.gender as 'M' | 'F'
                : 'M';

            // Llenar el formulario con los datos encontrados
            setValue('dni', numDni);
            setValue('names', personData.name || '');
            setValue('paternalSurname', personData.paternalSurname || '');
            setValue('maternalSurname', personData.maternalSurname || '');
            setValue('birthdate', personData.birthdate || '');
            setValue('gender', validGender);
            setValue('address', personData.address || '');
            setValue('email', personData.email || '');
            setValue('phone', personData.phone || '');
            setValue('ubigeoId', personData.ubigeoId?.toString() || '');
            setValue('maritalStatus', (personData.maritalStatus as 'Single' | 'Married' | 'Divorced' | 'Widower') || 'Single');

            setSearchSuccess(true);
            setTimeout(() => setSearchSuccess(false), 2500);
        } catch (err) {
            console.error('Error al buscar solicitante:', err);
            setSearchError('Error al buscar el solicitante. Intente nuevamente.');
            reset();
        }
    }, [numDni, tipoDocumentoSeleccionado, fetchPersonSearch, setValue, reset]);
    // Limpiar búsqueda y formulario
    const handleClearSearch = useCallback(() => {
        setNumDni('');
        setSearchValidationError('');
        setSearchError('');
        setSearchSuccess(false);
        reset();
    }, [reset]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchApplicant();
        }
    }, [handleSearchApplicant]);

    // Agregar solicitante (con validación de Zod)
    const handleAddSolicitante = (() => {
        // Verificar duplicados
        const data = getValues();
        console.log('Data recibida: ',data)
        const isDuplicate = solicitantesAgregados.some(s => s.dni === data.dni);
        if (isDuplicate) {
            console.log('esta dni ya fue registrado')
            setSearchError('Este DNI ya ha sido agregado a la solicitud');
            return;
        }
        console.log('Agregando solicitante: ', data);
        addParticipant({...data, role: 'solicitante'});
        setSolicitantesAgregados(prev => [...prev, {...data, role: 'solicitante'}]);
        console.log('List soicitantes: ',solicitantesAgregados)
        handleClearSearch();

        // Mensaje de éxito
        setSearchSuccess(true);
        setTimeout(() => setSearchSuccess(false), 1400);
    });

    // Eliminar solicitante
    const handleRemoveSolicitante = useCallback((id: string) => {
        deleteParticipant(id);

        setSolicitantesAgregados(prev => prev.filter(s => s.dni !== id));
    }, [deleteParticipant]);

    // Formatear fecha para mostrar (DD/MM/YYYY)
    const formatDisplayDate = (dateString: string) => {
        if (!dateString) return '';

        // Si ya está en formato YYYY-MM-DD
        if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }

        return dateString;
    };

    return (
        <div className="space-y-4 sm:space-y-6">

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-user text-blue-600"></i>
                    <span>Datos del Solicitante</span>
                </h3>
                {tipoSolicitudNombre && (
                    <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg inline-flex items-center w-fit">
                        <i className="fas fa-file-alt mr-2"></i>
                        {tipoSolicitudNombre.toUpperCase()}
                    </span>
                )}
            </div>

            {/* Campo de Número de Expediente */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                    <div className="shrink-0">
                        <i className="fas fa-folder-open text-yellow-600 text-xl"></i>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Número de Expediente <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-gray-600 mb-3">
                            <i className="fas fa-info-circle mr-1"></i>
                            Debe ingresar el número de expediente antes de continuar con el registro del solicitante
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={expedientNumber}
                                    onChange={handleExpedientNumberChange}
                                    className={`w-full px-4 py-2.5 text-sm sm:text-base border-2 rounded-lg font-medium uppercase outline-0 transition-all focus:ring-2 focus:ring-yellow-500 ${
                                        expedientError
                                            ? 'border-red-500 bg-red-50'
                                            : isExpedientValid
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 bg-white'
                                    }`}
                                    placeholder="Ej: EXP-2024-001"
                                    maxLength={20}
                                />
                                {expedientError && (
                                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                        <i className="fas fa-exclamation-circle"></i>
                                        {expedientError}
                                    </p>
                                )}
                                {isExpedientValid && (
                                    <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1">
                                        <i className="fas fa-check-circle"></i>
                                        Expediente válido - Puede continuar
                                    </p>
                                )}
                            </div>
                            {isExpedientValid && (
                                <div className="flex items-center">
                                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium flex items-center gap-2">
                                        <i className="fas fa-check"></i>
                                        Validado
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mensaje de bloqueo si no hay expediente */}
            {!isExpedientValid && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <i className="fas fa-lock text-gray-400 text-4xl mb-3"></i>
                    <p className="text-gray-700 font-medium mb-1">
                        Formulario Bloqueado
                    </p>
                    <p className="text-gray-500 text-sm">
                        Debe ingresar un número de expediente válido para continuar
                    </p>
                </div>
            )}

            {/* Contenido del formulario - Solo visible si el expediente es válido */}
            {isExpedientValid && (
                <>

            {/* Búsqueda por DNI */}
            <div className='mb-2 flex flex-col md:flex-row items-start gap-4'>
                <div className={"flex-1 w-full"}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buscar por Documento
                    </label>
                    <p id="dni-help" className="mt-2 text-xs text-gray-500 mb-3 min-h-8">
                        <i className="fas fa-info-circle mr-1"></i>
                        <span>Ingrese el número de documento para buscar la información del solicitante</span>
                    </p>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                            <i className="fas fa-search text-gray-400 text-sm"></i>
                        </div>
                        <input
                            type="text"
                            value={numDni}
                            onChange={handleDocumentNumberChange}
                            onKeyDown={handleKeyDown}
                            className={`w-full pl-9 sm:pl-11 pr-20 sm:pr-24 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all ${searchSuccess
                                ? 'border-green-500 bg-green-50'
                                : searchValidationError || searchError
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-300'
                                }`}
                            aria-label="Buscar solicitante por documento"
                            aria-describedby="dni-help"
                            placeholder={tipoDocumentoSeleccionado === 'dni' ? "8 dígitos" : tipoDocumentoSeleccionado === 'pas' ? "Pasaporte" : "Cédula"}
                            maxLength={tipoDocumentoSeleccionado === 'dni' ? 8 : tipoDocumentoSeleccionado === 'ced' ? 10 : 20}
                        />
                        {numDni && numDni.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute inset-y-0 right-12 sm:right-16 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                title="Limpiar"
                                aria-label="Limpiar búsqueda"
                            >
                                <i className="fas fa-times text-sm"></i>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleSearchApplicant}
                            disabled={!!searchValidationError || !numDni || numDni.length === 0}
                            className="cursor-pointer absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                            title="Buscar"
                            aria-label="Buscar solicitante"
                        >
                            {loading ? (
                                <i className="fas fa-spinner fa-spin text-sm"></i>
                            ) : (
                                <i className="fas fa-arrow-right text-sm"></i>
                            )}
                        </button>
                    </div>
                    <div className='h-4 sm:h-5 p-1'>
                        {searchValidationError && (
                            <p className="text-red-500 text-xs mt-1">{searchValidationError}</p>
                        )}
                        {!searchValidationError && searchError && (
                            <p className="text-red-500 text-xs mt-1">{searchError}</p>
                        )}
                        {searchSuccess && (
                            <p className="text-green-500 text-xs mt-1">
                                <i className="fas fa-check-circle mr-1"></i>
                                Solicitante encontrado exitosamente
                            </p>
                        )}
                    </div>
                </div>
                <div className={"flex-1 w-full"}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Documento
                    </label>
                    <p id="doctype-help" className="mt-2 text-xs text-gray-500 mb-3 min-h-8">
                        <i className="fas fa-info-circle mr-1"></i>
                        <span>Seleccione el tipo de documento por el que desea buscar</span>
                    </p>
                    <select
                        value={tipoDocumentoSeleccionado}
                        onChange={handleDocumentTypeChange}
                        className={"select outline-0 w-full py-2 sm:py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 transition-all bg-white px-3 border border-gray-300 rounded-lg"}
                    >
                        <option value="dni">DNI</option>
                        <option value="pas">PASAPORTE</option>
                        <option value="ced">CÉDULA</option>
                    </select>
                </div>
            </div>

            {/* Formulario de datos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    <div className='mb-0'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            DNI <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('dni')}
                            className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.dni ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="8 dígitos"
                            maxLength={8}
                        />
                        {errors.dni && (
                            <p className="text-red-500 text-xs mt-1">{errors.dni.message}</p>
                        )}
                    </div>
                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombres <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('names')}
                            className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.names ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Nombres"
                        />
                        {errors.names && (
                            <p className="text-red-500 text-xs mt-1">{errors.names.message}</p>
                        )}
                    </div>

                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Apellido Paterno <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('paternalSurname')}
                            className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.paternalSurname ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Apellido paterno"
                        />
                        {errors.paternalSurname && (
                            <p className="text-red-500 text-xs mt-1">{errors.paternalSurname.message}</p>
                        )}
                    </div>

                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Apellido Materno <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('maternalSurname')}
                            className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.maternalSurname ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Apellido materno"
                        />
                        {errors.maternalSurname && (
                            <p className="text-red-500 text-xs mt-1">{errors.maternalSurname.message}</p>
                        )}
                    </div>
                    <div className='mb-0'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Nacimiento <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            {...register('birthdate')}
                            className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.birthdate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                        />
                        {errors.birthdate && (
                            <p className="text-red-500 text-xs mt-1">{errors.birthdate.message}</p>
                        )}
                    </div>
                    <div className='mb-0'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sexo <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('gender')}
                            className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.gender ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                        >
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                        {errors.gender && (
                            <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
                        )}
                    </div>
                    <div className='mb-0 sm:col-span-2 lg:col-span-2'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dirección <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('address')}
                            className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Dirección completa"
                        />
                        {errors.address && (
                            <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                        )}
                    </div>
                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correo Electrónico <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            {...register('email')}
                            className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="correo@ejemplo.com"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                        )}
                    </div>
                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('phone')}
                            className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="987654321"
                            maxLength={9}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                        )}
                    </div>
                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ubigeo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('ubigeoId')}
                            className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.ubigeoId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="140101"
                            maxLength={6}
                        />
                        {errors.ubigeoId && (
                            <p className="text-red-500 text-xs mt-1">{errors.ubigeoId.message}</p>
                        )}
                    </div>
                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado Civil <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('maritalStatus')}
                            className={`w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.maritalStatus ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                        >
                            <option value="Single">Soltero(a)</option>
                            <option value="Married">Casado(a)</option>
                            <option value="Divorced">Divorciado(a)</option>
                            <option value="Widower">Viudo(a)</option>
                        </select>
                        {errors.maritalStatus && (
                            <p className="text-red-500 text-xs mt-1">{errors.maritalStatus.message}</p>
                        )}
                    </div>
                </div>
                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-eraser"></i>
                        <span>Limpiar Formulario</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleAddSolicitante}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        disabled={solicitantesAgregados.length >= 1}
                    >
                        <i className="fas fa-plus-circle"></i>
                        <span>Agregar Solicitante</span>
                    </button>
                </div>
            {/* Lista de Solicitantes Agregados */}
            {solicitantesAgregados.length > 0 ? (
                <div className="mt-6 sm:mt-8">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                        <i className="fas fa-users text-blue-600"></i>
                        <span>Solicitantes Agregados ({solicitantesAgregados.length})</span>
                    </h4>

                    {/* Vista Desktop */}
                    <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            DNI
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nombres Completos
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha Nac.
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sexo
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Teléfono
                                        </th>
                                        <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {solicitantesAgregados.map((solicitante) => (
                                        <tr
                                            key={solicitante.dni}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {solicitante.dni}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-gray-700">
                                                {solicitante.names} {solicitante.paternalSurname} {solicitante.maternalSurname}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-700">
                                                {formatDisplayDate(solicitante.birthdate)}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-700">
                                                {solicitante.gender === 'M' ? 'Masculino' : 'Femenino'}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-700">
                                                {solicitante.phone}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSolicitante(solicitante.dni)}
                                                    className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                                    title="Eliminar solicitante"
                                                    aria-label={`Eliminar a ${solicitante.names} ${solicitante.paternalSurname}`}
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Vista Mobile */}
                    <div className="md:hidden space-y-3">
                        {solicitantesAgregados.map((solicitante) => (
                            <div
                                key={solicitante.dni}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-gray-900 text-sm mb-1">
                                            {solicitante.names} {solicitante.paternalSurname} {solicitante.maternalSurname}
                                        </h5>
                                        <p className="text-xs text-gray-600">
                                            DNI: {solicitante.dni}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSolicitante(solicitante.dni)}
                                        className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg ml-2"
                                        title="Eliminar solicitante"
                                        aria-label={`Eliminar a ${solicitante.names} ${solicitante.paternalSurname}`}
                                    >
                                        <i className="fas fa-trash-alt text-sm"></i>
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-gray-500">Fecha Nac.:</span>
                                        <p className="text-gray-900 font-medium">{formatDisplayDate(solicitante.birthdate)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Sexo:</span>
                                        <p className="text-gray-900 font-medium">{solicitante.gender === 'M' ? 'Masculino' : 'Femenino'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Teléfono:</span>
                                        <p className="text-gray-900 font-medium">{solicitante.phone}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Estado Civil:</span>
                                        <p className="text-gray-900 font-medium">{solicitante.maritalStatus}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mt-6 sm:mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
                    <i className="fas fa-users text-gray-400 text-3xl sm:text-4xl mb-2 sm:mb-3"></i>
                    <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">
                        No hay solicitantes agregados aún
                    </p>
                    <p className="text-gray-500 text-xs">
                        Busque por DNI o complete el formulario manualmente
                    </p>
                </div>
            )}
            </>
            )}
        </div>
    );
}