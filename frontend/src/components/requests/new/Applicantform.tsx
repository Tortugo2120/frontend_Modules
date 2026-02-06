"use client";

import { useState, useCallback, useMemo } from 'react';
import { usePersonSearch } from '../../../hooks/usePersonSearch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { solicitanteSchema } from '../../../Validations/valitationForm';

type ValidacitionForm = z.infer<typeof solicitanteSchema>;

interface Applicant {
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

interface SolicitanteAgregado {
    id: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fecha_nacimiento: string;
    sexo: 'M' | 'F';
    dni: string;
    direccion?: string;
    correo?: string;
    telefono?: string;
    ubigeo?: number;
    estado_civil?: string;
}

interface ApplicantFormProps {
    formData: {
        nombresSolicitante: string;
        apellidoPaternoSolicitante: string;
        apellidoMaternoSolicitante: string;
        dniSolicitante: string;
        fechaNacimientoSolicitante: string;
        sexoSolicitante: string;
        direccionSolicitante?: string;
        correoSolicitante?: string;
        telefonoSolicitante?: string;
        ubigeoSolicitante?: number;
        estadoCivilSolicitante?: string;
    };
    onChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => void;
    onSolicitantesChange?: (solicitantes: SolicitanteAgregado[]) => void;
    tipoSolicitudNombre?: string;
}

// Constantes
const EMPTY_APPLICANT: Applicant = {
    dni: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fecha_nacimiento: '',
    sexo: undefined,
    direccion: '',
    correo: '',
    telefono: '',
    ubigeo: '',
    estado_civil: ''
};

const DNI_LENGTH = 8;
const PHONE_LENGTH = 9;
const UBIGEO_LENGTH = 6;
const SUCCESS_MESSAGE_DURATION = 2500;

// Mapeo de campos para evitar switch statements
const FIELD_MAPPING: Record<string, keyof Applicant> = {
    nombresSolicitante: 'nombres',
    apellidoPaternoSolicitante: 'apellidoPaterno',
    apellidoMaternoSolicitante: 'apellidoMaterno',
    fechaNacimientoSolicitante: 'fecha_nacimiento',
    sexoSolicitante: 'sexo',
    direccionSolicitante: 'direccion',
    correoSolicitante: 'correo',
    telefonoSolicitante: 'telefono',
    ubigeoSolicitante: 'ubigeo',
    estadoCivilSolicitante: 'estado_civil',
    dniSolicitante: 'dni'
};

export default function ApplicantForm({
    onChange,
    tipoSolicitudNombre
}: ApplicantFormProps) {
    const { fetchPersonSearch } = usePersonSearch();

    // Estados consolidados
    const [searchDni, setSearchDni] = useState('');
    const [formApplicant, setFormApplicant] = useState<Applicant>(EMPTY_APPLICANT);
    const [searchState, setSearchState] = useState({
        isSearching: false,
        error: '',
        success: false
    });
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

    const {
        // Puedes descomentar y usar estos métodos si los necesitas
        // register,
        // formState: { errors },
        // setValue
    } = useForm<ValidacitionForm>({
        resolver: zodResolver(solicitanteSchema),
        mode: 'onChange',
        defaultValues: {
            dni: '',
            nombres: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            fecha_nacimiento: '',
            direccion: '',
            correo: '',
            telefono: '',
            ubigeo: '',
        }
    });

    // Función helper para crear eventos sintéticos
    const createChangeEvent = useCallback((name: string, value: string) => {
        return {
            target: { name, value },
            currentTarget: { name, value }
        } as React.ChangeEvent<HTMLInputElement>;
    }, []);

    // Sincronizar datos con el componente padre
    const syncToParent = useCallback((app: Applicant) => {
        const syncFields = [
            ['dniSolicitante', app.dni],
            ['nombresSolicitante', app.nombres],
            ['apellidoPaternoSolicitante', app.apellidoPaterno],
            ['apellidoMaternoSolicitante', app.apellidoMaterno],
            ['fechaNacimientoSolicitante', app.fecha_nacimiento || ''],
            ['sexoSolicitante', app.sexo || ''],
            ['direccionSolicitante', app.direccion || ''],
            ['correoSolicitante', app.correo || ''],
            ['telefonoSolicitante', app.telefono || ''],
            ['ubigeoSolicitante', app.ubigeo || ''],
            ['estadoCivilSolicitante', app.estado_civil || '']
        ] as const;

        syncFields.forEach(([name, value]) => {
            onChange(createChangeEvent(name, String(value)));
        });
    }, [onChange, createChangeEvent]);

    // Sanitizadores de input
    const sanitizers = useMemo(() => ({
        dni: (value: string) => value.replace(/\D/g, '').slice(0, DNI_LENGTH),
        phone: (value: string) => value.replace(/\D/g, '').slice(0, PHONE_LENGTH),
        ubigeo: (value: string) => value.replace(/\D/g, '').slice(0, UBIGEO_LENGTH),
        gender: (value: string): 'M' | 'F' | undefined => {
            const upper = value.toUpperCase();
            return upper === 'M' || upper === 'F' ? upper as 'M' | 'F' : undefined;
        }
    }), []);

    // Actualizar campo del formulario
    const updateField = useCallback((name: string, value: string) => {
        setFormApplicant(prev => {
            const fieldKey = FIELD_MAPPING[name];
            if (!fieldKey) return prev;

            let sanitizedValue: any = value;

            // Aplicar sanitización según el campo
            switch (name) {
                case 'dniSolicitante':
                    sanitizedValue = sanitizers.dni(value);
                    break;
                case 'telefonoSolicitante':
                    sanitizedValue = sanitizers.phone(value);
                    break;
                case 'ubigeoSolicitante':
                    sanitizedValue = sanitizers.ubigeo(value);
                    break;
                case 'sexoSolicitante':
                    sanitizedValue = sanitizers.gender(value);
                    break;
            }

            return { ...prev, [fieldKey]: sanitizedValue };
        });

        // Limpiar selección si se modifica manualmente
        if (selectedApplicant) {
            setSelectedApplicant(null);
        }
    }, [sanitizers, selectedApplicant]);

    // Manejador genérico para inputs
    const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateField(name, value);
        onChange(e);
    }, [onChange, updateField]);

    // Manejador para selects
    const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateField(name, value);
        onChange(createChangeEvent(name, value));
    }, [onChange, updateField, createChangeEvent]);

    // Búsqueda de solicitante
    const handleSearchApplicant = useCallback(async () => {
        // Reset estados
        setSearchState({ isSearching: false, error: '', success: false });
        setSelectedApplicant(null);

        if (searchDni.length !== DNI_LENGTH) {
            setSearchState(prev => ({
                ...prev,
                error: `El DNI debe tener ${DNI_LENGTH} dígitos`
            }));
            return;
        }

        setSearchState(prev => ({ ...prev, isSearching: true }));

        try {
            const response = await fetchPersonSearch(searchDni);

            if (!response?.status || !response?.data) {
                setSearchState({
                    isSearching: false,
                    error: 'No se encontró ningún solicitante con ese DNI',
                    success: false
                });
                setFormApplicant(EMPTY_APPLICANT);
                syncToParent(EMPTY_APPLICANT);
                return;
            }

            const { data: personData } = response;
            const validGender = sanitizers.gender(personData.gender);

            const foundApplicant: Applicant = {
                dni: searchDni,
                nombres: personData.name,
                apellidoPaterno: personData.paternalSurname,
                apellidoMaterno: personData.maternalSurname,
                fecha_nacimiento: personData.birthdate,
                sexo: validGender,
                direccion: personData.address,
                correo: personData.email,
                telefono: personData.phone,
                ubigeo: personData.ubigeoId,
                estado_civil: personData.maritalStatus
            };

            setSelectedApplicant(foundApplicant);
            setFormApplicant(foundApplicant);
            syncToParent(foundApplicant);
            setSearchState({ isSearching: false, error: '', success: true });

            // Auto-ocultar mensaje de éxito
            setTimeout(() => {
                setSearchState(prev => ({ ...prev, success: false }));
            }, SUCCESS_MESSAGE_DURATION);

        } catch (err) {
            console.error('Error al buscar solicitante:', err);
            setSearchState({
                isSearching: false,
                error: 'Error al buscar el solicitante. Intente nuevamente.',
                success: false
            });
            setFormApplicant(EMPTY_APPLICANT);
            syncToParent(EMPTY_APPLICANT);
        }
    }, [searchDni, fetchPersonSearch, syncToParent, sanitizers]);

    // Limpiar búsqueda
    const handleClearSearch = useCallback(() => {
        setSearchDni('');
        setSearchState({ isSearching: false, error: '', success: false });
        setSelectedApplicant(null);
        setFormApplicant(EMPTY_APPLICANT);
        syncToParent(EMPTY_APPLICANT);
    }, [syncToParent]);

    // Manejar Enter en campo de búsqueda
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchApplicant();
        }
    }, [handleSearchApplicant]);

    // Cambio en DNI de búsqueda
    const handleDniChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = sanitizers.dni(e.target.value);
        setSearchDni(value);
        setSearchState({ isSearching: false, error: '', success: false });
    }, [sanitizers]);

    // Clases de input basadas en estado
    const searchInputClasses = useMemo(() => {
        const baseClasses = "w-full pl-9 sm:pl-11 pr-20 sm:pr-24 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all";

        if (searchState.success) return `${baseClasses} border-green-500 bg-green-50`;
        if (searchState.error) return `${baseClasses} border-red-300 bg-red-50`;
        return `${baseClasses} border-gray-300`;
    }, [searchState.success, searchState.error]);

    const inputClasses = "w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent";

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 border-b border-b-blue-300">
                <div className="flex flex-col items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">
                        <i className="fas fa-user text-blue-600 mr-2"></i>Datos del solicitante</h2>
                    <p className="text-gray-600 ">Complete la información requerida</p>
                </div>
                {tipoSolicitudNombre && (
                    <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg inline-flex items-center w-fit">
                        <i className="fas fa-file-alt mr-2"></i>
                        {tipoSolicitudNombre.toUpperCase()}
                    </span>
                )}
            </div>
           
            {/* Búsqueda por DNI */}
            <div className='mb-2'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar por DNI
                </label>
                <p id="dni-help" className="mt-2 text-xs text-gray-500 mb-3">
                    <i className="fas fa-info-circle mr-1"></i>
                    <span>Ingrese el DNI de {DNI_LENGTH} dígitos para buscar la información del solicitante</span>
                </p>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                        <i className="fas fa-search text-gray-400 text-sm"></i>
                    </div>
                    <input
                        type="text"
                        value={searchDni}
                        onChange={handleDniChange}
                        onKeyDown={handleKeyDown}
                        placeholder={`Ingrese DNI (${DNI_LENGTH} dígitos)`}
                        className={searchInputClasses}
                        maxLength={DNI_LENGTH}
                        aria-label="Buscar solicitante por DNI"
                        aria-describedby="dni-help"
                    />
                    {searchDni && (
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
                        disabled={searchState.isSearching || searchDni.length !== DNI_LENGTH}
                        className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="Buscar"
                        aria-label="Buscar solicitante"
                    >
                        {searchState.isSearching ? (
                            <i className="fas fa-spinner fa-spin text-sm"></i>
                        ) : (
                            <i className="fas fa-arrow-right text-sm"></i>
                        )}
                    </button>
                </div>
                <div className='h-4 sm:h-5 p-1'>
                    {searchState.error && (
                        <p className="text-xs sm:text-sm text-red-600 flex items-center gap-1">
                            <i className="fas fa-exclamation-circle"></i>
                            <span className="truncate">{searchState.error}</span>
                        </p>
                    )}
                    {searchState.success && !searchState.error && (
                        <p className="text-xs sm:text-sm text-green-600 flex items-center gap-1">
                            <i className="fas fa-check-circle"></i>
                            Solicitante encontrado correctamente
                        </p>
                    )}
                </div>
            </div>

            {/* Formulario de datos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Tipo de Documento */}
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Doc.<span className="text-red-500">*</span>
                    </label>
                    <select
                        name="tipoDocSolicitante"
                        onChange={handleSelectChange}
                        className={inputClasses}
                    >
                        <option value="">Seleccione</option>
                        <option value="DNI">DNI</option>
                        <option value="C. de Extranjeria">Carnet de extranjería</option>
                    </select>
                </div>

                {/* DNI */}
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        DNI <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="dniSolicitante"
                        value={formApplicant.dni}
                        onChange={handleFormChange}
                        className={inputClasses}
                        placeholder="DNI"
                        maxLength={DNI_LENGTH}
                    />
                </div>

                {/* Nombres */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombres <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="nombresSolicitante"
                        value={formApplicant.nombres}
                        onChange={handleFormChange}
                        className={inputClasses}
                        placeholder="Nombres"
                    />
                </div>

                {/* Apellido Paterno */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido Paterno <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="apellidoPaternoSolicitante"
                        value={formApplicant.apellidoPaterno}
                        onChange={handleFormChange}
                        className={inputClasses}
                        placeholder="Apellido paterno"
                    />
                </div>

                {/* Apellido Materno */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido Materno <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="apellidoMaternoSolicitante"
                        value={formApplicant.apellidoMaterno}
                        onChange={handleFormChange}
                        className={inputClasses}
                        placeholder="Apellido materno"
                    />
                </div>

                {/* Fecha de Nacimiento */}
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="fechaNacimientoSolicitante"
                        value={formApplicant.fecha_nacimiento || ''}
                        onChange={handleFormChange}
                        className={inputClasses}
                    />
                </div>

                {/* Dirección */}
                <div className='mb-0 sm:col-span-2 lg:col-span-3'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="direccionSolicitante"
                        value={formApplicant.direccion || ''}
                        onChange={handleFormChange}
                        className={inputClasses}
                        placeholder="Dirección"
                    />
                </div>

                {/* Sexo */}
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sexo <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="sexoSolicitante"
                        value={formApplicant.sexo || ''}
                        onChange={handleSelectChange}
                        className={inputClasses}
                    >
                        <option value="">Seleccione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </select>
                </div>

                {/* Correo */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="correoSolicitante"
                        value={formApplicant.correo || ''}
                        onChange={handleFormChange}
                        className={inputClasses}
                        placeholder="correo@ejemplo.com"
                    />
                </div>

                {/* Teléfono */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="telefonoSolicitante"
                        value={formApplicant.telefono || ''}
                        onChange={handleFormChange}
                        className={inputClasses}
                        placeholder="987654321"
                        maxLength={PHONE_LENGTH}
                    />
                </div>

                {/* Ubigeo */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubigeo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="ubigeoSolicitante"
                        value={formApplicant.ubigeo || ''}
                        onChange={handleFormChange}
                        className={inputClasses}
                        placeholder="150101"
                        maxLength={UBIGEO_LENGTH}
                    />
                </div>

                {/* Estado Civil */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado Civil <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="estadoCivilSolicitante"
                        value={formApplicant.estado_civil || ''}
                        onChange={handleSelectChange}
                        className={inputClasses}
                    >
                        <option value="">Seleccione</option>
                        <option value="Soltero">Soltero(a)</option>
                        <option value="Casado">Casado(a)</option>
                        <option value="Divorciado">Divorciado(a)</option>
                        <option value="Viudo">Viudo(a)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}