import { useState, useCallback, useEffect } from 'react';
import { usePersonSearch } from '../../../hooks/usePersonSearch';

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
    ubigeo?: string | undefined;
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

// Función auxiliar para crear applicant vacío
const createEmptyApplicant = (): Applicant => ({
    dni: '',
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fecha_nacimiento: '',
    sexo: undefined,
    direccion: '',
    correo: '',
    telefono: '',
    ubigeo: undefined,
    estado_civil: ''
});

export default function ApplicantForm({
    onChange,
    onSolicitantesChange,
    tipoSolicitudNombre
}: ApplicantFormProps) {
    const {fetchPersonSearch } = usePersonSearch();
    const [searchDni, setSearchDni] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [searchSuccess, setSearchSuccess] = useState(false);
    const [solicitantesAgregados, setSolicitantesAgregados] = useState<SolicitanteAgregado[]>([]);

    const [formApplicant, setFormApplicant] = useState<Applicant>(createEmptyApplicant());
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

    useEffect(() => {
        if (onSolicitantesChange) {
            onSolicitantesChange(solicitantesAgregados);
        }
    }, [solicitantesAgregados, onSolicitantesChange]);

    const createChangeEvent = useCallback((name: string, value: string) => {
        return {
            target: { name, value },
            currentTarget: { name, value }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
    }, []);

    const syncToParent = useCallback((app: Applicant) => {
        onChange(createChangeEvent('dniSolicitante', app.dni));
        onChange(createChangeEvent('nombresSolicitante', app.nombres));
        onChange(createChangeEvent('apellidoPaternoSolicitante', app.apellidoPaterno));
        onChange(createChangeEvent('apellidoMaternoSolicitante', app.apellidoMaterno));
        onChange(createChangeEvent('fechaNacimientoSolicitante', app.fecha_nacimiento || ''));
        onChange(createChangeEvent('sexoSolicitante', app.sexo || ''));
        onChange(createChangeEvent('direccionSolicitante', app.direccion || ''));
        onChange(createChangeEvent('correoSolicitante', app.correo || ''));
        onChange(createChangeEvent('telefonoSolicitante', app.telefono || ''));
        onChange(createChangeEvent('ubigeoSolicitante', app.ubigeo ? app.ubigeo.toString() : ''));
        onChange(createChangeEvent('estadoCivilSolicitante', app.estado_civil || ''));
    }, [onChange, createChangeEvent]);

    const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormApplicant(prev => {
            let updatedField: Partial<Applicant> = {};

            switch (name) {
                case 'nombresSolicitante':
                    updatedField = { nombres: value };
                    break;
                case 'apellidoPaternoSolicitante':
                    updatedField = { apellidoPaterno: value };
                    break;
                case 'apellidoMaternoSolicitante':
                    updatedField = { apellidoMaterno: value };
                    break;
                case 'fechaNacimientoSolicitante':
                    updatedField = { fecha_nacimiento: value };
                    break;
                case 'sexoSolicitante':
                    { const upperValue = value.toUpperCase();
                    updatedField = { sexo: (upperValue === 'M' || upperValue === 'F') ? upperValue as 'M' | 'F' : undefined };
                    break; }
                case 'direccionSolicitante':
                    updatedField = { direccion: value };
                    break;
                case 'correoSolicitante':
                    updatedField = { correo: value };
                    break;
                case 'telefonoSolicitante':
                    // Solo números, máximo 9 dígitos
                    { const cleanPhone = value.replace(/\D/g, '').slice(0, 9);
                    updatedField = { telefono: cleanPhone };
                    break; }
                case 'ubigeoSolicitante':
                    // Solo números, máximo 6 dígitos
                    { const cleanUbigeo = value.replace(/\D/g, '').slice(0, 6);
                    updatedField = { ubigeo: cleanUbigeo };
                    break; }
                case 'estadoCivilSolicitante':
                    updatedField = { estado_civil: value };
                    break;
                case 'dniSolicitante':
                    updatedField = { dni: value.replace(/\D/g, '').slice(0, 8) };
                    break;
            }

            const next = { ...prev, ...updatedField };
            
            // Limpiar el estado de búsqueda exitosa si se modifica manualmente
            if (selectedApplicant) {
                setSelectedApplicant(null);
            }
            
            return next;
        });

        // Propagar al padre
        onChange(e);
    }, [onChange, selectedApplicant]);

    const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormApplicant(prev => {
            let updatedField: Partial<Applicant> = {};

            switch (name) {
                case 'sexoSolicitante':
                    updatedField = { sexo: (value === 'M' || value === 'F') ? value as 'M' | 'F' : undefined };
                    break;
                case 'estadoCivilSolicitante':
                    updatedField = { estado_civil: value };
                    break;
            }

            const next = { ...prev, ...updatedField };

            if (selectedApplicant) {
                setSelectedApplicant(null);
            }

            return next;
        });

        const syntheticEvent = createChangeEvent(name, value);
        onChange(syntheticEvent);
    }, [onChange, selectedApplicant, createChangeEvent]);

    const handleSearchApplicant = useCallback(async () => {
        setSearchError('');
        setSearchSuccess(false);
        setSelectedApplicant(null);

        if (searchDni.length !== 8) {
            setSearchError('El DNI debe tener 8 dígitos');
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetchPersonSearch(searchDni);

            if (!response || !response.status || !response.data) {
                setSearchError('No se encontró ningún solicitante con ese DNI');
                const emptyApplicant = createEmptyApplicant();
                setFormApplicant(emptyApplicant);
                syncToParent(emptyApplicant);
                return;
            }

            const personData = response.data;

            const validGender = personData.gender === 'M' || personData.gender === 'F'
                ? personData.gender as 'M' | 'F'
                : undefined;

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
            setFormApplicant({ ...foundApplicant });
            syncToParent(foundApplicant);
            setSearchSuccess(true);
            setTimeout(() => setSearchSuccess(false), 2500);
        } catch (err) {
            console.error('Error al buscar solicitante:', err);
            setSearchError('Error al buscar el solicitante. Intente nuevamente.');
            const emptyApplicant = createEmptyApplicant();
            setFormApplicant(emptyApplicant);
            syncToParent(emptyApplicant);
        } finally {
            setIsSearching(false);
        }
    }, [searchDni, fetchPersonSearch, syncToParent]);
    const handleClearSearch = useCallback(() => {
        setSearchDni('');
        setSearchError('');
        setSearchSuccess(false);
        setSelectedApplicant(null);
        const emptyApplicant = createEmptyApplicant();
        setFormApplicant(emptyApplicant);
        syncToParent(emptyApplicant);
    }, [syncToParent]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchApplicant();
        }
    }, [handleSearchApplicant]);

    const handleDniChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
        setSearchDni(value);
        setSearchError('');
        setSearchSuccess(false);
    }, []);

    // Validar campos obligatorios
    const isFormValid = useCallback(() => {
        const { dni, nombres, apellidoPaterno, apellidoMaterno, fecha_nacimiento, sexo, direccion, correo, telefono, ubigeo, estado_civil } = formApplicant;
        return !!(
            dni && dni.length === 8 &&
            nombres && nombres.trim() &&
            apellidoPaterno && apellidoPaterno.trim() &&
            apellidoMaterno && apellidoMaterno.trim() &&
            fecha_nacimiento &&
            sexo &&
            direccion && direccion.trim() &&
            correo && correo.trim() &&
            telefono && telefono.trim() &&
            ubigeo &&
            estado_civil && estado_civil.trim()
        );
    }, [formApplicant]);

    // Agregar solicitante
    const handleAddSolicitante = useCallback(() => {
        const { dni, nombres, apellidoPaterno, apellidoMaterno, fecha_nacimiento, sexo, direccion, correo, telefono, ubigeo, estado_civil } = formApplicant;
        
        // Validación completa
        if (!dni || dni.length !== 8) {
            setSearchError('El DNI debe tener 8 dígitos');
            return;
        }
        if (!nombres?.trim() || !apellidoPaterno?.trim() || !apellidoMaterno?.trim()) {
            setSearchError('Los nombres y apellidos son obligatorios');
            return;
        }
        if (!fecha_nacimiento) {
            setSearchError('La fecha de nacimiento es obligatoria');
            return;
        }
        if (!sexo || (sexo !== 'M' && sexo !== 'F')) {
            setSearchError('El sexo debe ser M o F');
            return;
        }
        if (!direccion?.trim()) {
            setSearchError('La dirección es obligatoria');
            return;
        }
        if (!correo?.trim()) {
            setSearchError('El correo electrónico es obligatorio');
            return;
        }
        if (!telefono?.trim()) {
            setSearchError('El teléfono es obligatorio');
            return;
        }
        if (!ubigeo) {
            setSearchError('El ubigeo es obligatorio');
            return;
        }
        if (!estado_civil?.trim()) {
            setSearchError('El estado civil es obligatorio');
            return;
        }

        // Verificar duplicados
        const isDuplicate = solicitantesAgregados.some(s => s.dni === dni);
        if (isDuplicate) {
            setSearchError('Este DNI ya ha sido agregado a la solicitud');
            return;
        }

        const id = crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

        const nuevoSolicitante: SolicitanteAgregado = {
            id,
            nombres: nombres.trim(),
            apellidoPaterno: apellidoPaterno.trim(),
            apellidoMaterno: apellidoMaterno.trim(),
            fecha_nacimiento,
            sexo,
            dni,
            direccion: direccion?.trim(),
            correo: correo?.trim(),
            telefono: telefono?.trim(),
            ubigeo: undefined,
            estado_civil: estado_civil?.trim()
        };

        setSolicitantesAgregados(prev => [...prev, nuevoSolicitante]);
        handleClearSearch();

        // Mensaje de éxito
        setSearchSuccess(true);
        setTimeout(() => setSearchSuccess(false), 1400);
    }, [formApplicant, solicitantesAgregados, handleClearSearch]);

    // Eliminar solicitante
    const handleRemoveSolicitante = useCallback((id: string) => {
        setSolicitantesAgregados(prev => prev.filter(s => s.id !== id));
    }, []);

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

            {/* Búsqueda por DNI */}
            <div className='mb-2'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar por DNI
                </label>
                <p id="dni-help" className="mt-2 text-xs text-gray-500 mb-3">
                    <i className="fas fa-info-circle mr-1"></i>
                    <span>Ingrese el DNI de 8 dígitos para buscar la información del solicitante</span>
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
                        placeholder="Ingrese DNI (8 dígitos)"
                        className={`w-full pl-9 sm:pl-11 pr-20 sm:pr-24 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all ${searchSuccess
                            ? 'border-green-500 bg-green-50'
                            : searchError
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                            }`}
                        maxLength={8}
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
                        disabled={isSearching || searchDni.length !== 8}
                        className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="Buscar"
                        aria-label="Buscar solicitante"
                    >
                        {isSearching ? (
                            <i className="fas fa-spinner fa-spin text-sm"></i>
                        ) : (
                            <i className="fas fa-arrow-right text-sm"></i>
                        )}
                    </button>
                </div>
                <div className='h-4 sm:h-5 p-1'>
                    {searchError && (
                        <p className="text-xs sm:text-sm text-red-600 flex items-center gap-1">
                            <i className="fas fa-exclamation-circle"></i>
                            <span className="truncate">{searchError}</span>
                        </p>
                    )}
                    {searchSuccess && !searchError && (
                        <p className="text-xs sm:text-sm text-green-600 flex items-center gap-1">
                            <i className="fas fa-check-circle"></i>
                            Solicitante encontrado correctamente
                        </p>
                    )}
                </div>
            </div>

            {/* Formulario de datos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        DNI <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="dniSolicitante"
                        value={formApplicant.dni}
                        onChange={handleFormChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="DNI"
                        maxLength={8}
                    />
                </div>
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombres <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="nombresSolicitante"
                        value={formApplicant.nombres}
                        onChange={handleFormChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nombres"
                    />
                </div>

                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido Paterno <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="apellidoPaternoSolicitante"
                        value={formApplicant.apellidoPaterno}
                        onChange={handleFormChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Apellido paterno"
                    />
                </div>

                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido Materno <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="apellidoMaternoSolicitante"
                        value={formApplicant.apellidoMaterno}
                        onChange={handleFormChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Apellido materno"
                    />
                </div>
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="fechaNacimientoSolicitante"
                        value={formApplicant.fecha_nacimiento || ''}
                        onChange={handleFormChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="YYYY-MM-DD"
                    />
                </div>
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sexo <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="sexoSolicitante"
                        value={formApplicant.sexo || ''}
                        onChange={handleSelectChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Seleccione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </select>
                </div>
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="direccionSolicitante"
                        value={formApplicant.direccion || ''}
                        onChange={handleFormChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Dirección"
                    />
                </div>
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="correoSolicitante"
                        value={formApplicant.correo || ''}
                        onChange={handleFormChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="correo@ejemplo.com"
                    />
                </div>
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="telefonoSolicitante"
                        value={formApplicant.telefono || ''}
                        onChange={handleFormChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="987654321"
                        maxLength={9}
                    />
                </div>
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubigeo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="ubigeoSolicitante"
                        value={formApplicant.ubigeo || ''}
                        onChange={handleFormChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="150101"
                        maxLength={6}
                    />
                </div>
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado Civil <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="estadoCivilSolicitante"
                        value={formApplicant.estado_civil || ''}
                        onChange={handleSelectChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Seleccione</option>
                        <option value="Soltero">Soltero(a)</option>
                        <option value="Casado">Casado(a)</option>
                        <option value="Divorciado">Divorciado(a)</option>
                        <option value="Viudo">Viudo(a)</option>
                    </select>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                <button
                    type="button"
                    onClick={handleClearSearch}
                    disabled={!formApplicant.nombres && !formApplicant.dni && !selectedApplicant}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    <i className="fas fa-eraser"></i>
                    <span>Limpiar Formulario</span>
                </button>
                <button
                    type="button"
                    onClick={handleAddSolicitante}
                    disabled={!isFormValid()}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
                                            key={solicitante.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {solicitante.dni}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-gray-700">
                                                {solicitante.nombres} {solicitante.apellidoPaterno} {solicitante.apellidoMaterno}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-700">
                                                {formatDisplayDate(solicitante.fecha_nacimiento)}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-700">
                                                {solicitante.sexo === 'M' ? 'Masculino' : 'Femenino'}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray-700">
                                                {solicitante.telefono}
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSolicitante(solicitante.id)}
                                                    className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                                    title="Eliminar solicitante"
                                                    aria-label={`Eliminar a ${solicitante.nombres} ${solicitante.apellidoPaterno}`}
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
                                key={solicitante.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-gray-900 text-sm mb-1">
                                            {solicitante.nombres} {solicitante.apellidoPaterno} {solicitante.apellidoMaterno}
                                        </h5>
                                        <p className="text-xs text-gray-600">
                                            DNI: {solicitante.dni}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSolicitante(solicitante.id)}
                                        className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg ml-2"
                                        title="Eliminar solicitante"
                                        aria-label={`Eliminar a ${solicitante.nombres} ${solicitante.apellidoPaterno}`}
                                    >
                                        <i className="fas fa-trash-alt text-sm"></i>
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-gray-500">Fecha Nac.:</span>
                                        <p className="text-gray-900 font-medium">{formatDisplayDate(solicitante.fecha_nacimiento)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Sexo:</span>
                                        <p className="text-gray-900 font-medium">{solicitante.sexo === 'M' ? 'Masculino' : 'Femenino'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Teléfono:</span>
                                        <p className="text-gray-900 font-medium">{solicitante.telefono}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Estado Civil:</span>
                                        <p className="text-gray-900 font-medium">{solicitante.estado_civil}</p>
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
        </div>
    );
}