import { useState, useCallback, useEffect } from 'react';
import { usePersonSearch } from '../../../hooks/usePersonSearch';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchTypeDocument } from "../../../Validations/validationSearchTypeDocument.ts";
import { z } from "zod";

interface Testigo {
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

interface TestigoAgregado extends Testigo {
    id: string;
}

interface Solicitud {
    tipoSolicitudNombre?: string;
    onTestigosChange?: (Testigos: TestigoAgregado[]) => void;
}

// Función auxiliar para crear Testigo vacío
const createEmptyTestigo = (): Testigo => ({
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
});

type inputSearch = z.infer<typeof searchTypeDocument>;

const Testigo = (props: Solicitud) => {
    const { tipoSolicitudNombre, onTestigosChange } = props;

    // Estados para Testigo 1
    const {
        register: register1,
        watch: watch1,
        formState: { errors: errors1 }
    } = useForm<inputSearch>({
        resolver: zodResolver(searchTypeDocument),
        defaultValues: {
            documentType: 'dni',
            documentNumber: ''
        }
    });

    // Estados para Testigo 2
    const {
        register: register2,
        watch: watch2,
        formState: { errors: errors2 }
    } = useForm<inputSearch>({
        resolver: zodResolver(searchTypeDocument),
        defaultValues: {
            documentType: 'dni',
            documentNumber: ''
        }
    });

    const tipoDoc1 = watch1('documentType');
    const numDoc1 = watch1('documentNumber');
    const tipoDoc2 = watch2('documentType');
    const numDoc2 = watch2('documentNumber');

    const { fetchPersonSearch, loading } = usePersonSearch();

    const [searchError1, setSearchError1] = useState('');
    const [searchSuccess1, setSearchSuccess1] = useState(false);
    const [searchError2, setSearchError2] = useState('');
    const [searchSuccess2, setSearchSuccess2] = useState(false);

    const [Testigo1, setTestigo1] = useState<Testigo>(createEmptyTestigo());
    const [Testigo2, setTestigo2] = useState<Testigo>(createEmptyTestigo());

    const [TestigosAgregados, setTestigosAgregados] = useState<TestigoAgregado[]>([]);

    useEffect(() => {
        if (onTestigosChange) {
            onTestigosChange(TestigosAgregados);
        }
    }, [TestigosAgregados, onTestigosChange]);

    // Función para buscar persona
    const handleSearchTestigo = useCallback(async (TestigoNum: 1 | 2) => {
        const isTestigo1 = TestigoNum === 1;
        const tipoDoc = isTestigo1 ? tipoDoc1 : tipoDoc2;
        const numDoc = isTestigo1 ? numDoc1 : numDoc2;
        const setError = isTestigo1 ? setSearchError1 : setSearchError2;
        const setSuccess = isTestigo1 ? setSearchSuccess1 : setSearchSuccess2;
        const setTestigo = isTestigo1 ? setTestigo1 : setTestigo2;

        setError('');
        setSuccess(false);

        try {
            const documentTypeMapping: Record<string, number> = {
                'dni': 1,
                'pas': 2,
                'ced': 3
            };

            const documentTypeNumber = documentTypeMapping[tipoDoc] || 1;
            const response = await fetchPersonSearch(numDoc, documentTypeNumber);

            if (!response || !response.status || !response.data) {
                setError('No se encontró ninguna persona con ese documento');
                setTestigo(createEmptyTestigo());
                return;
            }

            const personData = response.data;
            const validGender = personData.gender === 'M' || personData.gender === 'F'
                ? personData.gender as 'M' | 'F'
                : undefined;

            const foundTestigo: Testigo = {
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

            setTestigo(foundTestigo);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2500);
        } catch (err) {
            console.error('Error al buscar Testigo:', err);
            setError('Error al buscar la persona. Intente nuevamente.');
            setTestigo(createEmptyTestigo());
        }
    }, [numDoc1, tipoDoc1, numDoc2, tipoDoc2, fetchPersonSearch]);

    // Función para limpiar búsqueda
    const handleClearSearch = useCallback((TestigoNum: 1 | 2) => {
        const isTestigo1 = TestigoNum === 1;
        const setError = isTestigo1 ? setSearchError1 : setSearchError2;
        const setSuccess = isTestigo1 ? setSearchSuccess1 : setSearchSuccess2;
        const setTestigo = isTestigo1 ? setTestigo1 : setTestigo2;

        setError('');
        setSuccess(false);
        setTestigo(createEmptyTestigo());
    }, []);

    // Función para manejar cambios en los inputs
    const handleInputChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        TestigoNum: 1 | 2
    ) => {
        const { name, value } = e.target;
        const setTestigo = TestigoNum === 1 ? setTestigo1 : setTestigo2;

        setTestigo(prev => {
            const updatedTestigo = { ...prev };

            switch (name) {
                case 'tipoDocSolicitante':
                    updatedTestigo.tipoDocumento = value;
                    break;
                case 'dniSolicitante':
                    updatedTestigo.dni = value.replace(/\D/g, '').slice(0, 8);
                    break;
                case 'nombresSolicitante':
                    updatedTestigo.nombres = value;
                    break;
                case 'apellidoPaternoSolicitante':
                    updatedTestigo.apellidoPaterno = value;
                    break;
                case 'apellidoMaternoSolicitante':
                    updatedTestigo.apellidoMaterno = value;
                    break;
                case 'fechaNacimientoSolicitante':
                    updatedTestigo.fecha_nacimiento = value;
                    break;
                case 'sexoSolicitante':
                    updatedTestigo.sexo = (value === 'M' || value === 'F') ? value as 'M' | 'F' : undefined;
                    break;
                case 'direccionSolicitante':
                    updatedTestigo.direccion = value;
                    break;
                case 'correoSolicitante':
                    updatedTestigo.correo = value;
                    break;
                case 'telefonoSolicitante':
                    updatedTestigo.telefono = value.replace(/\D/g, '').slice(0, 9);
                    break;
                case 'ubigeoSolicitante':
                    updatedTestigo.ubigeo = value.replace(/\D/g, '').slice(0, 6);
                    break;
                case 'estadoCivilSolicitante':
                    updatedTestigo.estado_civil = value;
                    break;
            }

            return updatedTestigo;
        });
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, TestigoNum: 1 | 2) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchTestigo(TestigoNum);
        }
    }, [handleSearchTestigo]);

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

    // Validar si el Testigo está completo
    const isTestigoValid = useCallback((Testigo: Testigo) => {
        return !!(
            Testigo.dni && Testigo.dni.length === 8 &&
            Testigo.nombres && Testigo.nombres.trim() &&
            Testigo.apellidoPaterno && Testigo.apellidoPaterno.trim() &&
            Testigo.apellidoMaterno && Testigo.apellidoMaterno.trim() &&
            Testigo.fecha_nacimiento &&
            Testigo.sexo &&
            Testigo.direccion && Testigo.direccion.trim() &&
            Testigo.correo && Testigo.correo.trim() &&
            Testigo.telefono && Testigo.telefono.trim() &&
            Testigo.ubigeo &&
            Testigo.estado_civil && Testigo.estado_civil.trim()
        );
    }, []);

    // Agregar ambos Testigos
    const handleAgregarTestigos = useCallback(() => {
        // Validar Testigo 1
        if (!isTestigoValid(Testigo1)) {
            setSearchError1('Por favor complete todos los campos obligatorios del Testigo 1');
            return;
        }

        // Validar Testigo 2
        if (!isTestigoValid(Testigo2)) {
            setSearchError2('Por favor complete todos los campos obligatorios del Testigo 2');
            return;
        }

        // Verificar que no sean el mismo DNI
        if (Testigo1.dni === Testigo2.dni) {
            setSearchError1('Los Testigos no pueden tener el mismo DNI');
            setSearchError2('Los Testigos no pueden tener el mismo DNI');
            return;
        }

        const id1 = crypto?.randomUUID?.() || `${Date.now()}-1`;
        const id2 = crypto?.randomUUID?.() || `${Date.now()}-2`;

        const nuevosTestigos: TestigoAgregado[] = [
            { id: id1, ...Testigo1 },
            { id: id2, ...Testigo2 }
        ];

        setTestigosAgregados(nuevosTestigos);
        
        setSearchSuccess1(true);
        setSearchSuccess2(true);
        setTimeout(() => {
            setSearchSuccess1(false);
            setSearchSuccess2(false);
        }, 1400);
    }, [Testigo1, Testigo2, isTestigoValid]);

    // Limpiar todo
    const handleLimpiarTodo = useCallback(() => {
        setTestigo1(createEmptyTestigo());
        setTestigo2(createEmptyTestigo());
        setSearchError1('');
        setSearchError2('');
        setSearchSuccess1(false);
        setSearchSuccess2(false);
        setTestigosAgregados([]);
    }, []);

    // Formatear fecha para mostrar
    const formatDisplayDate = (dateString: string) => {
        if (!dateString) return '';
        if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }
        return dateString;
    };

    // Renderizar formulario de Testigo
    const renderTestigoForm = (
        Testigo: Testigo,
        TestigoNum: 1 | 2,
        register: any,
        errors: any,
        watch: any,
        searchError: string,
        searchSuccess: boolean
    ) => {
        const tipoDoc = watch('documentType');
        const numDoc = watch('documentNumber');

        return (
            <div className="space-y-4">
                {/* Búsqueda */}
                <div className='mb-2 flex flex-col md:flex-row items-start gap-4'>
                    <div className={"flex-1 w-full"}>
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
                                onKeyDown={(e) => handleKeyDown(e, TestigoNum)}
                                onInput={(e) => handleDocumentInput(e, tipoDoc)}
                                className={`w-full pl-9 sm:pl-11 pr-20 sm:pr-24 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all ${
                                    searchSuccess
                                        ? 'border-green-500 bg-green-50'
                                        : searchError
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-300'
                                }`}
                                {...register('documentNumber')}
                                placeholder={tipoDoc === 'dni' ? "8 dígitos" : tipoDoc === 'pas' ? "Pasaporte" : "Cédula"}
                                maxLength={tipoDoc === 'dni' ? 8 : tipoDoc === 'ced' ? 10 : 20}
                            />
                            {numDoc && numDoc.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleClearSearch(TestigoNum)}
                                    className="absolute inset-y-0 right-12 sm:right-16 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Limpiar"
                                >
                                    <i className="fas fa-times text-sm"></i>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleSearchTestigo(TestigoNum)}
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
                    <div className={"flex-1 w-full"}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de documento
                        </label>
                        <p className="mt-2 text-xs text-gray-500 mb-3 min-h-8">
                            <i className="fas fa-info-circle mr-1"></i>
                            <span>Seleccione el tipo de documento</span>
                        </p>
                        <select
                            defaultValue={"dni"}
                            className={"select outline-0 w-full py-2 sm:py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 transition-all bg-white px-3 border border-gray-300 rounded-lg"}
                            {...register('documentType')}
                        >
                            <option value="dni">DNI</option>
                            <option value="pas">PASAPORTE</option>
                            <option value="ced">CEDULA</option>
                        </select>
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
                            value={Testigo.tipoDocumento}
                            onChange={(e) => handleInputChange(e, TestigoNum)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            value={Testigo.dni}
                            onChange={(e) => handleInputChange(e, TestigoNum)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="DNI"
                            maxLength={8}
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
                            value={Testigo.nombres}
                            onChange={(e) => handleInputChange(e, TestigoNum)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            value={Testigo.apellidoPaterno}
                            onChange={(e) => handleInputChange(e, TestigoNum)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            value={Testigo.apellidoMaterno}
                            onChange={(e) => handleInputChange(e, TestigoNum)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            value={Testigo.fecha_nacimiento || ''}
                            onChange={(e) => handleInputChange(e, TestigoNum)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Dirección */}
                    <div className='mb-0 sm:col-span-2 lg:col-span-2'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dirección <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="direccionSolicitante"
                            value={Testigo.direccion || ''}
                            onChange={(e) => handleInputChange(e, TestigoNum)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            value={Testigo.sexo || ''}
                            onChange={(e) => handleInputChange(e, TestigoNum)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            value={Testigo.correo || ''}
                            onChange={(e) => handleInputChange(e, TestigoNum)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            value={Testigo.telefono || ''}
                            onChange={(e) => handleInputChange(e, TestigoNum)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="987654321"
                            maxLength={9}
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
                            value={Testigo.ubigeo || ''}
                            onChange={(e) => handleInputChange(e, TestigoNum)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="150101"
                            maxLength={6}
                        />
                    </div>

                    {/* Estado Civil */}
                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado Civil <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="estadoCivilSolicitante"
                            value={Testigo.estado_civil || ''}
                            onChange={(e) => handleInputChange(e, TestigoNum)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Seleccione</option>
                            <option value="Single">Soltero(a)</option>
                            <option value="Married">Casado(a)</option>
                            <option value="Divorced">Divorciado(a)</option>
                            <option value="Widower">Viudo(a)</option>
                        </select>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 pb-3 border-b border-b-blue-300">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-user text-blue-600"></i>
                    <span>Datos de los Testigos</span>
                </h3>
                {tipoSolicitudNombre && (
                    <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg inline-flex items-center w-fit">
                        <i className="fas fa-file-alt mr-2"></i>
                        {tipoSolicitudNombre.toUpperCase()}
                    </span>
                )}
            </div>

            {/* Testigo 1 */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-user-circle text-blue-600"></i>
                    Testigo 1
                </h4>
                {renderTestigoForm(
                    Testigo1,
                    1,
                    register1,
                    errors1,
                    watch1,
                    searchError1,
                    searchSuccess1
                )}
            </div>

            <div className="border-solid border-b border-b-blue-300"></div>

            {/* Testigo 2 */}
            <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-user-circle text-pink-600"></i>
                    Testigo 2
                </h4>
                {renderTestigoForm(
                    Testigo2,
                    2,
                    register2,
                    errors2,
                    watch2,
                    searchError2,
                    searchSuccess2
                )}
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
                    onClick={handleAgregarTestigos}
                    disabled={!isTestigoValid(Testigo1) || !isTestigoValid(Testigo2)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    <i className="fas fa-heart"></i>
                    <span>Confirmar Testigos</span>
                </button>
            </div>

            {/* Lista de Testigos Agregados */}
            {TestigosAgregados.length > 0 && (
                <div className="mt-6 sm:mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="fas fa-check-circle text-green-600"></i>
                        <span>Testigos Confirmados</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {TestigosAgregados.map((Testigo, index) => (
                            <div
                                key={Testigo.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                            >
                                <h5 className="font-semibold text-gray-900 text-base mb-3 flex items-center gap-2">
                                    <i className={`fas fa-user-circle ${index === 0 ? 'text-blue-600' : 'text-pink-600'}`}></i>
                                    Testigo {index + 1}
                                </h5>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-gray-600">Nombre:</span> <span className="font-medium">{Testigo.nombres} {Testigo.apellidoPaterno} {Testigo.apellidoMaterno}</span></p>
                                    <p><span className="text-gray-600">DNI:</span> <span className="font-medium">{Testigo.dni}</span></p>
                                    <p><span className="text-gray-600">Fecha Nac.:</span> <span className="font-medium">{formatDisplayDate(Testigo.fecha_nacimiento || '')}</span></p>
                                    <p><span className="text-gray-600">Sexo:</span> <span className="font-medium">{Testigo.sexo === 'M' ? 'Masculino' : 'Femenino'}</span></p>
                                    <p><span className="text-gray-600">Teléfono:</span> <span className="font-medium">{Testigo.telefono}</span></p>
                                    <p><span className="text-gray-600">Email:</span> <span className="font-medium">{Testigo.correo}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Testigo;