import { useState, useCallback, useEffect } from 'react';

interface Applicant {
    dni: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fecha_nacimiento?: string;
    sexo?: 'M' | 'F';
}

interface SolicitanteAgregado {
    id: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fecha_nacimiento: string;
    sexo: 'M' | 'F';
    dni: string;
}

interface ApplicantFormProps {
    formData: {
        nombresSolicitante: string;
        apellidoPaternoSolicitante: string;
        apellidoMaternoSolicitante: string;
        dniSolicitante: string;
    };

    onChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => void;
    onSolicitantesChange?: (solicitantes: SolicitanteAgregado[]) => void; // Callback para notificar al padre
    tipoSolicitudNombre?: string;
}

// Mock applicants (simulación DB)
const MOCK_APPLICANTS: Applicant[] = [
    { dni: '12345678', nombres: 'Juan Carlos', apellidoPaterno: 'Pérez', apellidoMaterno: 'García', fecha_nacimiento: '1990-05-15', sexo: 'M' },
    { dni: '87654321', nombres: 'María Elena', apellidoPaterno: 'López', apellidoMaterno: 'Rodríguez', fecha_nacimiento: '1985-03-22', sexo: 'F' },
    { dni: '45678912', nombres: 'Pedro José', apellidoPaterno: 'Martínez', apellidoMaterno: 'Sánchez', fecha_nacimiento: '1992-11-08', sexo: 'M' },
    { dni: '98765432', nombres: 'Ana Sofía', apellidoPaterno: 'Fernández', apellidoMaterno: 'Torres', fecha_nacimiento: '1988-07-30', sexo: 'F' },
    { dni: '73974061', nombres: 'Dickens Aldair', apellidoPaterno: 'Labán', apellidoMaterno: 'Vásquez', fecha_nacimiento: '1995-02-14', sexo: 'M' },
    { dni: '11223344', nombres: 'Carlos Alberto', apellidoPaterno: 'Ramírez', apellidoMaterno: 'Castro', fecha_nacimiento: '1987-09-05', sexo: 'M' }
];

export default function ApplicantForm({
    onChange,
    onSolicitantesChange,
    tipoSolicitudNombre
}: ApplicantFormProps) {
    // Estado para búsqueda por DNI
    const [searchDni, setSearchDni] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [searchSuccess, setSearchSuccess] = useState(false);

    // Estado: lista de solicitantes agregados
    const [solicitantesAgregados, setSolicitantesAgregados] = useState<SolicitanteAgregado[]>([]);

    // Estado: formulario editable (permitir escritura manual)
    const [formApplicant, setFormApplicant] = useState<Applicant>({
        dni: '',
        nombres: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        fecha_nacimiento: '',
        sexo: undefined
    });

    // Estado: applicant obtenido por búsqueda (opcional, solo para referencia)
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

    // Notificar al padre cuando cambie la lista de solicitantes
    useEffect(() => {
        if (onSolicitantesChange) {
            onSolicitantesChange(solicitantesAgregados);
        }
    }, [solicitantesAgregados, onSolicitantesChange]);

    // Helper: crear evento sintético para onChange del padre
    const createChangeEvent = useCallback((name: string, value: string) => {
        return {
            target: { name, value },
            currentTarget: { name, value }
        } as unknown as React.ChangeEvent<HTMLInputElement>;
    }, []);

    // Sincronizar cambios del formApplicant hacia el padre
    const syncToParent = useCallback((app: Applicant) => {
        onChange(createChangeEvent('dniSolicitante', app.dni));
        onChange(createChangeEvent('nombresSolicitante', app.nombres));
        onChange(createChangeEvent('apellidoPaternoSolicitante', app.apellidoPaterno));
        onChange(createChangeEvent('apellidoMaternoSolicitante', app.apellidoMaterno));
        onChange(createChangeEvent('fechaNacimientoSolicitante', app.fecha_nacimiento || ''));
        onChange(createChangeEvent('sexoSolicitante', app.sexo || ''));
    }, [onChange, createChangeEvent]);

    // Manejar cambios manuales en los inputs del formulario
    const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormApplicant(prev => {
            const next = {
                ...prev,
                // Mapear nombres del input a las propiedades internas
                ...(name === 'nombresSolicitante' ? { nombres: value } : {}),
                ...(name === 'apellidoPaternoSolicitante' ? { apellidoPaterno: value } : {}),
                ...(name === 'apellidoMaternoSolicitante' ? { apellidoMaterno: value } : {}),
                ...(name === 'fechaNacimientoSolicitante' ? { fecha_nacimiento: value } : {}),
                ...(name === 'sexoSolicitante' ? { sexo: value as 'M' | 'F' | undefined } : {}),
                ...(name === 'dniSolicitante' ? { dni: value.replace(/\D/g, '').slice(0, 8) } : {})
            } as Applicant;

            // Si el usuario escribe manualmente, ya no dependemos del selectedApplicant
            setSelectedApplicant(null);

            // Notificar al padre con el mismo evento (mantener compatibilidad)
            onChange(e);
            return next;
        });
    }, [onChange]);

    // Buscar solicitante por DNI (simula llamada a API)
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
            await new Promise((r) => setTimeout(r, 300)); // simulación

            const found = MOCK_APPLICANTS.find(a => a.dni === searchDni);

            if (!found) {
                setSearchError('No se encontró ningún solicitante con ese DNI');
                // limpiar solo los campos parent y locales
                setFormApplicant({
                    dni: '',
                    nombres: '',
                    apellidoPaterno: '',
                    apellidoMaterno: '',
                    fecha_nacimiento: '',
                    sexo: undefined
                });
                syncToParent({
                    dni: '',
                    nombres: '',
                    apellidoPaterno: '',
                    apellidoMaterno: '',
                    fecha_nacimiento: '',
                    sexo: undefined
                });
                return;
            }

            // Guardar el aplicante encontrado y sincronizar el formulario editable
            setSelectedApplicant(found);
            setFormApplicant({
                dni: found.dni,
                nombres: found.nombres,
                apellidoPaterno: found.apellidoPaterno,
                apellidoMaterno: found.apellidoMaterno,
                fecha_nacimiento: found.fecha_nacimiento,
                sexo: found.sexo
            });
            syncToParent(found);

            setSearchSuccess(true);
            setTimeout(() => setSearchSuccess(false), 2500);
        } catch (err) {
            console.error('Error al buscar solicitante:', err);
            setSearchError('Error al buscar el solicitante. Intente nuevamente.');
        } finally {
            setIsSearching(false);
        }
    }, [searchDni, syncToParent]);

    // Limpiar búsqueda y formulario
    const handleClearSearch = useCallback(() => {
        setSearchDni('');
        setSearchError('');
        setSearchSuccess(false);
        setSelectedApplicant(null);
        setFormApplicant({
            dni: '',
            nombres: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            fecha_nacimiento: '',
            sexo: undefined
        });
        // Limpiar también en el padre
        syncToParent({
            dni: '',
            nombres: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            fecha_nacimiento: '',
            sexo: undefined
        });
    }, [syncToParent]);

    // Manejar Enter en campo DNI
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchApplicant();
        }
    }, [handleSearchApplicant]);

    // Manejar cambio en input de búsqueda DNI (solo números)
    const handleDniChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
        setSearchDni(value);
        setSearchError('');
        setSearchSuccess(false);
    }, []);

    // Agregar solicitante (desde búsqueda o manual)
    const handleAddSolicitante = useCallback(() => {
        const { dni, nombres, apellidoPaterno, apellidoMaterno, fecha_nacimiento, sexo } = formApplicant;
        if (!dni || !nombres || !apellidoPaterno || !apellidoMaterno || !fecha_nacimiento || sexo === undefined) {
            setSearchError('Complete todos los campos antes de agregar');
            return;
        }

        // Verificar duplicados por DNI
        const isDuplicate = solicitantesAgregados.some(s => s.dni === dni);
        if (isDuplicate) {
            setSearchError('Este DNI ya ha sido agregado a la solicitud');
            return;
        }

        const id = crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;

        const nuevoSolicitante: SolicitanteAgregado = {
            id,
            nombres,
            apellidoPaterno,
            apellidoMaterno,
            fecha_nacimiento,
            sexo,
            dni,
        };

        setSolicitantesAgregados(prev => [...prev, nuevoSolicitante]);

        // Limpiar el formulario después de agregar
        handleClearSearch();

        // feedback visual mínimo
        setSearchSuccess(true);
        setTimeout(() => setSearchSuccess(false), 1400);
    }, [formApplicant, solicitantesAgregados, handleClearSearch]);

    // Eliminar solicitante
    const handleRemoveSolicitante = useCallback((id: string) => {
        setSolicitantesAgregados(prev => prev.filter(s => s.id !== id));
    }, []);

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                    <i className="fas fa-user text-blue-600"></i>
                    Datos del Solicitante
                </div>
                {tipoSolicitudNombre && (
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-lg">
                        <i className="fas fa-file-alt mr-2"></i>
                        {tipoSolicitudNombre.toUpperCase()}
                    </span>
                )}
            </h3>

            {/* Buscador por DNI */}
            <div className='mb-2'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar por DNI
                </label>
                <p id="dni-help" className="mt-2 text-xs text-gray-500">
                    <i className="fas fa-info-circle mr-1"></i>
                    DNIs de prueba: 12345678, 87654321, 45678912, 98765432, 11223344
                </p>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i className="fas fa-search text-gray-400"></i>
                    </div>
                    <input
                        type="text"
                        value={searchDni}
                        onChange={handleDniChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ingrese DNI del solicitante (8 dígitos)"
                        className={`w-full pl-11 pr-24 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all ${searchSuccess
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
                            className="absolute inset-y-0 right-16 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                            title="Limpiar"
                            aria-label="Limpiar búsqueda"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSearchApplicant}
                        disabled={isSearching || searchDni.length !== 8}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="Buscar"
                        aria-label="Buscar solicitante"
                    >
                        {isSearching ? (
                            <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                            <i className="fas fa-arrow-right"></i>
                        )}
                    </button>
                </div>
                <div className='h-4 p-1'>
                    {/* Mensajes de feedback */}
                    {searchError && (
                        <p className=" text-sm text-red-600 flex items-center gap-1">
                            <i className="fas fa-exclamation-circle"></i>
                            {searchError}
                        </p>
                    )}
                    {searchSuccess && (
                        <p className=" text-sm text-green-600 flex items-center gap-1">
                            <i className="fas fa-check-circle"></i>
                            Solicitante listo para agregar
                        </p>
                    )}
                </div>

            </div>

            {/* Formulario de datos (ahora editable) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        DNI <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="dniSolicitante"
                        value={formApplicant.dni}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white outline-0 transition-all"
                        placeholder="Resultado de búsqueda / Escribe DNI"
                        maxLength={8}
                    />
                </div>
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombres <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="nombresSolicitante"
                        value={formApplicant.nombres}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white outline-0 transition-all"
                        placeholder="Resultado de búsqueda / Escribe nombres"
                    />
                </div>

                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido Paterno <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="apellidoPaternoSolicitante"
                        value={formApplicant.apellidoPaterno}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white outline-0 transition-all"
                        placeholder="Resultado de búsqueda / Escribe apellido paterno"
                    />
                </div>

                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido Materno <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="apellidoMaternoSolicitante"
                        value={formApplicant.apellidoMaterno}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white outline-0 transition-all"
                        placeholder="Resultado de búsqueda / Escribe apellido materno"
                    />
                </div>
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="fechaNacimientoSolicitante"
                        value={formApplicant.fecha_nacimiento || ''}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white outline-0 transition-all"
                        placeholder="Resultado de búsqueda / Escribe fecha de nacimiento"
                    />
                </div>
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sexo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="sexoSolicitante"
                        value={formApplicant.sexo}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white outline-0 transition-all"
                        placeholder="Resultado de búsqueda / Escribe sexo"
                    />
                </div>

            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-3 justify-end">
                <button
                    type="button"
                    onClick={handleClearSearch}
                    disabled={!formApplicant.nombres && !formApplicant.dni && !selectedApplicant}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    <i className="fas fa-eraser"></i>
                    Limpiar Formulario
                </button>
                <button
                    type="button"
                    onClick={handleAddSolicitante}
                    disabled={!formApplicant.nombres || !formApplicant.apellidoPaterno || !formApplicant.apellidoMaterno || !formApplicant.dni}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    <i className="fas fa-plus-circle"></i>
                    Agregar Solicitante
                </button>
            </div>

            {/* Lista de Solicitantes Agregados */}
            {solicitantesAgregados.length > 0 ? (
                <div className="mt-8">
                    <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="fas fa-users text-blue-600"></i>
                        Solicitantes Agregados ({solicitantesAgregados.length})
                    </h4>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            DNI
                                        </th>
                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nombres Completos
                                        </th>
                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha de Nacimiento
                                        </th>
                                        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sexo
                                        </th>
                                        <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {solicitante.dni}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {solicitante.nombres} {solicitante.apellidoPaterno} {solicitante.apellidoMaterno}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {solicitante.fecha_nacimiento}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {solicitante.sexo}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
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
                </div>
            ) : (
                <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <i className="fas fa-users text-gray-400 text-4xl mb-3"></i>
                    <p className="text-gray-600 text-sm font-medium mb-1">
                        No hay solicitantes agregados aún
                    </p>
                    <p className="text-gray-500 text-xs">
                        Busque una persona por DNI o ingrésela manualmente y agréguela a la lista
                    </p>
                </div>
            )}
        </div>
    );
}
