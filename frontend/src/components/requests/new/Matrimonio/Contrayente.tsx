import { useState, useCallback, useEffect } from 'react';
import { usePersonSearch } from '../../../../hooks/usePersonSearch';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchTypeDocument } from "../../../../Validations/validationSearchTypeDocument.ts";
import { z } from "zod";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Contrayente {
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

interface ContrayenteAgregado extends Contrayente {
    id: string;
}

interface ContrayenteProps {
    tipoSolicitudNombre?: string;
    onContrayentesChange?: (contrayentes: ContrayenteAgregado[]) => void;
}

type InputSearch = z.infer<typeof searchTypeDocument>;

// ============================================================================
// CONSTANTS
// ============================================================================

const DOCUMENT_TYPE_MAPPING: Record<string, number> = {
    'dni': 1,
    'pas': 2,
    'ced': 3
};

const EMPTY_CONTRAYENTE: Contrayente = {
    tipoDocumento: 'DNI',
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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const createEmptyContrayente = (): Contrayente => ({ ...EMPTY_CONTRAYENTE });

const generateId = (): string => {
    return crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
};

const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';
    if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }
    return dateString;
};

const validateContrayente = (contrayente: Contrayente): boolean => {
    return !!(
        contrayente.dni?.length === 8 &&
        contrayente.nombres?.trim() &&
        contrayente.apellidoPaterno?.trim() &&
        contrayente.apellidoMaterno?.trim() &&
        contrayente.fecha_nacimiento &&
        contrayente.sexo &&
        contrayente.direccion?.trim() &&
        contrayente.correo?.trim() &&
        contrayente.telefono?.trim() &&
        contrayente.ubigeo &&
        contrayente.estado_civil?.trim()
    );
};

// ============================================================================
// CUSTOM HOOK - Manejo de estado de un contrayente
// ============================================================================

interface UseContrayenteState {
    contrayente: Contrayente;
    searchError: string;
    searchSuccess: boolean;
    setContrayente: React.Dispatch<React.SetStateAction<Contrayente>>;
    setSearchError: React.Dispatch<React.SetStateAction<string>>;
    setSearchSuccess: React.Dispatch<React.SetStateAction<boolean>>;
    resetState: () => void;
}

const useContrayenteState = (): UseContrayenteState => {
    const [contrayente, setContrayente] = useState<Contrayente>(createEmptyContrayente());
    const [searchError, setSearchError] = useState('');
    const [searchSuccess, setSearchSuccess] = useState(false);

    const resetState = useCallback(() => {
        setContrayente(createEmptyContrayente());
        setSearchError('');
        setSearchSuccess(false);
    }, []);

    return {
        contrayente,
        searchError,
        searchSuccess,
        setContrayente,
        setSearchError,
        setSearchSuccess,
        resetState
    };
};

// ============================================================================
// CUSTOM HOOK - Búsqueda de persona
// ============================================================================

interface UsePersonSearchLogic {
    handleSearch: (tipoDoc: string, numDoc: string) => Promise<Contrayente | null>;
    loading: boolean;
}

const usePersonSearchLogic = (): UsePersonSearchLogic => {
    const { fetchPersonSearch, loading } = usePersonSearch();

    const handleSearch = useCallback(async (
        tipoDoc: string,
        numDoc: string
    ): Promise<Contrayente | null> => {
        try {
            const documentTypeNumber = DOCUMENT_TYPE_MAPPING[tipoDoc] || 1;
            const response = await fetchPersonSearch(numDoc, documentTypeNumber);

            if (!response?.status || !response?.data) {
                return null;
            }

            const personData = response.data;
            const validGender = (personData.gender === 'M' || personData.gender === 'F')
                ? personData.gender as 'M' | 'F'
                : undefined;

            return {
                tipoDocumento: tipoDoc.toUpperCase(),
                dni: numDoc,
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
        } catch (err) {
            console.error('Error al buscar contrayente:', err);
            return null;
        }
    }, [fetchPersonSearch]);

    return { handleSearch, loading };
};

// ============================================================================
// SUB-COMPONENT - Formulario de Búsqueda
// ============================================================================

interface SearchFormProps {
    register: any;
    watch: any;
    errors: any;
    onSearch: () => void;
    onClear: () => void;
    loading: boolean;
    searchError: string;
    searchSuccess: boolean;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onDocumentInput: (e: React.FormEvent<HTMLInputElement>, tipoDoc: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
    register,
    watch,
    errors,
    onSearch,
    onClear,
    loading,
    searchError,
    searchSuccess,
    onKeyDown,
    onDocumentInput
}) => {
    const tipoDoc = watch('documentType');
    const numDoc = watch('documentNumber');

    const getPlaceholder = () => {
        switch (tipoDoc) {
            case 'dni': return "8 dígitos";
            case 'pas': return "Pasaporte";
            case 'ced': return "Cédula";
            default: return "Número de documento";
        }
    };

    const getMaxLength = () => {
        switch (tipoDoc) {
            case 'dni': return 8;
            case 'ced': return 10;
            default: return 20;
        }
    };

    return (
        <div className='mb-2 flex flex-col md:flex-row items-start gap-4'>
            <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar por Documento
                </label>
                <p className="mt-2 text-xs text-gray-500 mb-3 min-h-8">
                    <i className="fas fa-info-circle mr-1"></i>
                    <span>Ingrese el documento para buscar la información</span>
                </p>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                        <i className="fas fa-search text-gray-400 text-sm"></i>
                    </div>
                    <input
                        type="text"
                        onKeyDown={onKeyDown}
                        onInput={(e) => onDocumentInput(e, tipoDoc)}
                        className={`w-full pl-9 sm:pl-11 pr-20 sm:pr-24 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all ${
                            searchSuccess
                                ? 'border-green-500 bg-green-50'
                                : searchError
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-300'
                        }`}
                        {...register('documentNumber')}
                        placeholder={getPlaceholder()}
                        maxLength={getMaxLength()}
                    />
                    {numDoc && numDoc.length > 0 && (
                        <button
                            type="button"
                            onClick={onClear}
                            className="absolute inset-y-0 right-12 sm:right-16 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                            title="Limpiar"
                        >
                            <i className="fas fa-times text-sm"></i>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onSearch}
                        disabled={!!errors.documentNumber || !numDoc || numDoc.length === 0}
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
                    {errors.documentNumber && (
                        <p className="text-red-500 text-xs mt-1">{errors.documentNumber.message}</p>
                    )}
                    {searchError && (
                        <p className="text-red-500 text-xs mt-1">{searchError}</p>
                    )}
                </div>
            </div>
            <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de documento
                </label>
                <p className="mt-2 text-xs text-gray-500 mb-3 min-h-8">
                    <i className="fas fa-info-circle mr-1"></i>
                    <span>Seleccione el tipo de documento</span>
                </p>
                <select
                    defaultValue="dni"
                    className="select outline-0 w-full py-2 sm:py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 transition-all bg-white px-3 border border-gray-300 rounded-lg"
                    {...register('documentType')}
                >
                    <option value="dni">DNI</option>
                    <option value="pas">PASAPORTE</option>
                    <option value="ced">CEDULA</option>
                </select>
            </div>
        </div>
    );
};

// ============================================================================
// SUB-COMPONENT - Campo de Formulario
// ============================================================================

interface FormFieldProps {
    label: string;
    name: string;
    value: string | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    type?: 'text' | 'email' | 'date' | 'select';
    options?: { value: string; label: string }[];
    placeholder?: string;
    maxLength?: number;
    required?: boolean;
    className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    value,
    onChange,
    type = 'text',
    options,
    placeholder,
    maxLength,
    required = true,
    className = ''
}) => {
    const baseInputClass = "w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent";

    return (
        <div className={`mb-0 ${className}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {type === 'select' ? (
                <select
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    className={baseInputClass}
                >
                    <option value="">Seleccione</option>
                    {options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    className={baseInputClass}
                    placeholder={placeholder}
                    maxLength={maxLength}
                />
            )}
        </div>
    );
};

// ============================================================================
// SUB-COMPONENT - Formulario de Datos del Contrayente
// ============================================================================

interface ContrayenteDataFormProps {
    contrayente: Contrayente;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ContrayenteDataForm: React.FC<ContrayenteDataFormProps> = ({
    contrayente,
    onInputChange
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FormField
                label="Tipo de Doc."
                name="tipoDocSolicitante"
                value={contrayente.tipoDocumento}
                onChange={onInputChange}
                type="select"
                options={[
                    { value: 'DNI', label: 'DNI' },
                    { value: 'C. de Extranjeria', label: 'Carnet de extranjería' }
                ]}
            />

            <FormField
                label="DNI"
                name="dniSolicitante"
                value={contrayente.dni}
                onChange={onInputChange}
                placeholder="DNI"
                maxLength={8}
            />

            <FormField
                label="Nombres"
                name="nombresSolicitante"
                value={contrayente.nombres}
                onChange={onInputChange}
                placeholder="Nombres"
                className="sm:col-span-2 lg:col-span-1"
            />

            <FormField
                label="Apellido Paterno"
                name="apellidoPaternoSolicitante"
                value={contrayente.apellidoPaterno}
                onChange={onInputChange}
                placeholder="Apellido paterno"
                className="sm:col-span-2 lg:col-span-1"
            />

            <FormField
                label="Apellido Materno"
                name="apellidoMaternoSolicitante"
                value={contrayente.apellidoMaterno}
                onChange={onInputChange}
                placeholder="Apellido materno"
                className="sm:col-span-2 lg:col-span-1"
            />

            <FormField
                label="Fecha Nacimiento"
                name="fechaNacimientoSolicitante"
                value={contrayente.fecha_nacimiento}
                onChange={onInputChange}
                type="date"
            />

            <FormField
                label="Dirección"
                name="direccionSolicitante"
                value={contrayente.direccion}
                onChange={onInputChange}
                placeholder="Dirección"
                className="sm:col-span-2 lg:col-span-2"
            />

            <FormField
                label="Sexo"
                name="sexoSolicitante"
                value={contrayente.sexo}
                onChange={onInputChange}
                type="select"
                options={[
                    { value: 'M', label: 'Masculino' },
                    { value: 'F', label: 'Femenino' }
                ]}
            />

            <FormField
                label="Correo Electrónico"
                name="correoSolicitante"
                value={contrayente.correo}
                onChange={onInputChange}
                type="email"
                placeholder="correo@ejemplo.com"
                className="sm:col-span-2 lg:col-span-1"
            />

            <FormField
                label="Teléfono"
                name="telefonoSolicitante"
                value={contrayente.telefono}
                onChange={onInputChange}
                placeholder="987654321"
                maxLength={9}
                className="sm:col-span-2 lg:col-span-1"
            />

            <FormField
                label="Ubigeo"
                name="ubigeoSolicitante"
                value={contrayente.ubigeo}
                onChange={onInputChange}
                placeholder="150101"
                maxLength={6}
                className="sm:col-span-2 lg:col-span-1"
            />

            <FormField
                label="Estado Civil"
                name="estadoCivilSolicitante"
                value={contrayente.estado_civil}
                onChange={onInputChange}
                type="select"
                options={[
                    { value: 'Single', label: 'Soltero(a)' },
                    { value: 'Married', label: 'Casado(a)' },
                    { value: 'Divorced', label: 'Divorciado(a)' },
                    { value: 'Widower', label: 'Viudo(a)' }
                ]}
                className="sm:col-span-2 lg:col-span-1"
            />
        </div>
    );
};

// ============================================================================
// SUB-COMPONENT - Lista de Contrayentes Confirmados
// ============================================================================

interface ContrayentesListProps {
    contrayentes: ContrayenteAgregado[];
}

const ContrayentesList: React.FC<ContrayentesListProps> = ({ contrayentes }) => {
    if (contrayentes.length === 0) return null;

    return (
        <div className="mt-6 sm:mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fas fa-check-circle text-green-600"></i>
                <span>Contrayentes Confirmados</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contrayentes.map((contrayente, index) => (
                    <div
                        key={contrayente.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    >
                        <h5 className="font-semibold text-gray-900 text-base mb-3 flex items-center gap-2">
                            <i className={`fas fa-user-circle ${index === 0 ? 'text-blue-600' : 'text-pink-600'}`}></i>
                            Contrayente {index + 1}
                        </h5>
                        <div className="space-y-2 text-sm">
                            <p><span className="text-gray-600">Nombre:</span> <span className="font-medium">{contrayente.nombres} {contrayente.apellidoPaterno} {contrayente.apellidoMaterno}</span></p>
                            <p><span className="text-gray-600">DNI:</span> <span className="font-medium">{contrayente.dni}</span></p>
                            <p><span className="text-gray-600">Fecha Nac.:</span> <span className="font-medium">{formatDisplayDate(contrayente.fecha_nacimiento || '')}</span></p>
                            <p><span className="text-gray-600">Sexo:</span> <span className="font-medium">{contrayente.sexo === 'M' ? 'Masculino' : 'Femenino'}</span></p>
                            <p><span className="text-gray-600">Teléfono:</span> <span className="font-medium">{contrayente.telefono}</span></p>
                            <p><span className="text-gray-600">Email:</span> <span className="font-medium">{contrayente.correo}</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Contrayente: React.FC<ContrayenteProps> = ({ 
    tipoSolicitudNombre, 
    onContrayentesChange 
}) => {
    // Forms para búsqueda
    const form1 = useForm<InputSearch>({
        resolver: zodResolver(searchTypeDocument),
        defaultValues: { documentType: 'dni', documentNumber: '' }
    });

    const form2 = useForm<InputSearch>({
        resolver: zodResolver(searchTypeDocument),
        defaultValues: { documentType: 'dni', documentNumber: '' }
    });

    // Estado de contrayentes
    const contrayente1State = useContrayenteState();
    const contrayente2State = useContrayenteState();

    // Búsqueda de personas
    const { handleSearch, loading } = usePersonSearchLogic();

    // Lista de contrayentes agregados
    const [contrayentesAgregados, setContrayentesAgregados] = useState<ContrayenteAgregado[]>([]);

    // Notificar cambios al padre
    useEffect(() => {
        onContrayentesChange?.(contrayentesAgregados);
    }, [contrayentesAgregados, onContrayentesChange]);

    // Handler para búsqueda de contrayente
    const handleSearchContrayente = useCallback(async (contrayenteNum: 1 | 2) => {
        const form = contrayenteNum === 1 ? form1 : form2;
        const state = contrayenteNum === 1 ? contrayente1State : contrayente2State;

        const tipoDoc = form.watch('documentType');
        const numDoc = form.watch('documentNumber');

        state.setSearchError('');
        state.setSearchSuccess(false);

        const result = await handleSearch(tipoDoc, numDoc);

        if (!result) {
            state.setSearchError('No se encontró ninguna persona con ese documento');
            state.setContrayente(createEmptyContrayente());
            return;
        }

        state.setContrayente(result);
        state.setSearchSuccess(true);
        setTimeout(() => state.setSearchSuccess(false), 2500);
    }, [form1, form2, contrayente1State, contrayente2State, handleSearch]);

    // Handler para limpiar búsqueda
    const handleClearSearch = useCallback((contrayenteNum: 1 | 2) => {
        const state = contrayenteNum === 1 ? contrayente1State : contrayente2State;
        state.resetState();
    }, [contrayente1State, contrayente2State]);

    // Handler para cambios en inputs
    const handleInputChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        contrayenteNum: 1 | 2
    ) => {
        const { name, value } = e.target;
        const setState = contrayenteNum === 1 
            ? contrayente1State.setContrayente 
            : contrayente2State.setContrayente;

        setState(prev => {
            const updated = { ...prev };

            const fieldMapping: Record<string, keyof Contrayente> = {
                'tipoDocSolicitante': 'tipoDocumento',
                'dniSolicitante': 'dni',
                'nombresSolicitante': 'nombres',
                'apellidoPaternoSolicitante': 'apellidoPaterno',
                'apellidoMaternoSolicitante': 'apellidoMaterno',
                'fechaNacimientoSolicitante': 'fecha_nacimiento',
                'sexoSolicitante': 'sexo',
                'direccionSolicitante': 'direccion',
                'correoSolicitante': 'correo',
                'telefonoSolicitante': 'telefono',
                'ubigeoSolicitante': 'ubigeo',
                'estadoCivilSolicitante': 'estado_civil'
            };

            const field = fieldMapping[name];
            if (!field) return updated;

            // Aplicar transformaciones específicas
            let processedValue: any = value;

            if (field === 'dni' || field === 'telefono' || field === 'ubigeo') {
                processedValue = value.replace(/\D/g, '');
                if (field === 'dni') processedValue = processedValue.slice(0, 8);
                if (field === 'telefono') processedValue = processedValue.slice(0, 9);
                if (field === 'ubigeo') processedValue = processedValue.slice(0, 6);
            }

            if (field === 'sexo') {
                processedValue = (value === 'M' || value === 'F') ? value as 'M' | 'F' : undefined;
            }

            updated[field] = processedValue as any;
            return updated;
        });
    }, [contrayente1State.setContrayente, contrayente2State.setContrayente]);

    // Handler para Enter key
    const handleKeyDown = useCallback((
        e: React.KeyboardEvent<HTMLInputElement>,
        contrayenteNum: 1 | 2
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchContrayente(contrayenteNum);
        }
    }, [handleSearchContrayente]);

    // Handler para validar input de documento
    const handleDocumentInput = useCallback((
        e: React.FormEvent<HTMLInputElement>,
        tipoDoc: string
    ) => {
        if (tipoDoc === 'dni' || tipoDoc === 'ced') {
            const input = e.currentTarget;
            const numericValue = input.value.replace(/\D/g, '');
            if (input.value !== numericValue) {
                input.value = numericValue;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }, []);

    // Agregar ambos contrayentes
    const handleAgregarContrayentes = useCallback(() => {
        // Validar contrayente 1
        if (!validateContrayente(contrayente1State.contrayente)) {
            contrayente1State.setSearchError('Por favor complete todos los campos obligatorios del Contrayente 1');
            return;
        }

        // Validar contrayente 2
        if (!validateContrayente(contrayente2State.contrayente)) {
            contrayente2State.setSearchError('Por favor complete todos los campos obligatorios del Contrayente 2');
            return;
        }

        // Verificar que no sean el mismo DNI
        if (contrayente1State.contrayente.dni === contrayente2State.contrayente.dni) {
            contrayente1State.setSearchError('Los contrayentes no pueden tener el mismo DNI');
            contrayente2State.setSearchError('Los contrayentes no pueden tener el mismo DNI');
            return;
        }

        const nuevosContrayentes: ContrayenteAgregado[] = [
            { id: generateId(), ...contrayente1State.contrayente },
            { id: generateId(), ...contrayente2State.contrayente }
        ];

        setContrayentesAgregados(nuevosContrayentes);

        contrayente1State.setSearchSuccess(true);
        contrayente2State.setSearchSuccess(true);
        setTimeout(() => {
            contrayente1State.setSearchSuccess(false);
            contrayente2State.setSearchSuccess(false);
        }, 1400);
    }, [contrayente1State, contrayente2State]);

    // Limpiar todo
    const handleLimpiarTodo = useCallback(() => {
        contrayente1State.resetState();
        contrayente2State.resetState();
        setContrayentesAgregados([]);
    }, [contrayente1State, contrayente2State]);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 pb-3 border-b border-b-blue-300">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-user text-blue-600"></i>
                    <span>Datos de los Contrayentes</span>
                </h3>
                {tipoSolicitudNombre && (
                    <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg inline-flex items-center w-fit">
                        <i className="fas fa-file-alt mr-2"></i>
                        {tipoSolicitudNombre.toUpperCase()}
                    </span>
                )}
            </div>

            {/* Contrayente 1 */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-user-circle text-blue-600"></i>
                    Contrayente 1
                </h4>
                <div className="space-y-4">
                    <SearchForm
                        register={form1.register}
                        watch={form1.watch}
                        errors={form1.formState.errors}
                        onSearch={() => handleSearchContrayente(1)}
                        onClear={() => handleClearSearch(1)}
                        loading={loading}
                        searchError={contrayente1State.searchError}
                        searchSuccess={contrayente1State.searchSuccess}
                        onKeyDown={(e) => handleKeyDown(e, 1)}
                        onDocumentInput={handleDocumentInput}
                    />
                    <ContrayenteDataForm
                        contrayente={contrayente1State.contrayente}
                        onInputChange={(e) => handleInputChange(e, 1)}
                    />
                </div>
            </div>

            <div className="border-solid border-b border-b-blue-300"></div>

            {/* Contrayente 2 */}
            <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-user-circle text-pink-600"></i>
                    Contrayente 2
                </h4>
                <div className="space-y-4">
                    <SearchForm
                        register={form2.register}
                        watch={form2.watch}
                        errors={form2.formState.errors}
                        onSearch={() => handleSearchContrayente(2)}
                        onClear={() => handleClearSearch(2)}
                        loading={loading}
                        searchError={contrayente2State.searchError}
                        searchSuccess={contrayente2State.searchSuccess}
                        onKeyDown={(e) => handleKeyDown(e, 2)}
                        onDocumentInput={handleDocumentInput}
                    />
                    <ContrayenteDataForm
                        contrayente={contrayente2State.contrayente}
                        onInputChange={(e) => handleInputChange(e, 2)}
                    />
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end pt-4">
                <button
                    type="button"
                    onClick={handleLimpiarTodo}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                    <i className="fas fa-eraser"></i>
                    <span>Limpiar Todo</span>
                </button>
                <button
                    type="button"
                    onClick={handleAgregarContrayentes}
                    disabled={
                        !validateContrayente(contrayente1State.contrayente) || 
                        !validateContrayente(contrayente2State.contrayente)
                    }
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    <i className="fas fa-heart"></i>
                    <span>Confirmar Contrayentes</span>
                </button>
            </div>

            {/* Lista de Contrayentes Confirmados */}
            <ContrayentesList contrayentes={contrayentesAgregados} />
        </div>
    );
};

export default Contrayente;