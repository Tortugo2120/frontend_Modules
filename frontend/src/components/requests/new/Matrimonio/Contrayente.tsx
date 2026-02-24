import { useState, useCallback, useEffect } from 'react';
import { usePersonSearch } from '../../../../hooks/usePersonSearch';
import { useUbigeo } from '../../../../hooks/useUbigeo';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchTypeDocument } from "../../../../Validations/validationSearchTypeDocument.ts";
import { contrayenteSchema, type ContrayenteFormData } from '../../../../Validations/validationContrayente.ts';
import { useApplicationContext } from '../../../../context/ApplicationContext.tsx';
import { z } from "zod";
import type { Participant } from "../../../../model/aplicationModel.ts";
import Alert from '../../../Alert.tsx';

interface Solicitud {
    tipoSolicitudNombre?: string;
    descriptionSolicitud?: string;
    onContrayentesChange?: (contrayentes: Participant[]) => void;
    onValidationChange?: (isValid: boolean) => void;
}

type inputSearch = z.infer<typeof searchTypeDocument>;

const Contrayente = (props: Solicitud) => {
    const { tipoSolicitudNombre, descriptionSolicitud, onContrayentesChange, onValidationChange } = props;
    const { addParticipant, deleteParticipant, formDataAplication } = useApplicationContext();

    const esDivorcio = tipoSolicitudNombre
        ? tipoSolicitudNombre.toLowerCase().includes('divorcio')
        : false;

    // Rol dinámico según el tipo de solicitud
    const rolParticipante = esDivorcio ? 'divorciado' : 'contrayente';

    // Estados para búsqueda de Contrayente 1
    const {
        register: register1,
        watch: watch1,
        formState: { errors: errors1 },
        reset: resetSearch1
    } = useForm<inputSearch>({
        resolver: zodResolver(searchTypeDocument),
        defaultValues: {
            documentType: 'dni',
            documentNumber: ''
        }
    });

    // Estados para búsqueda de Contrayente 2
    const {
        register: register2,
        watch: watch2,
        formState: { errors: errors2 },
        reset: resetSearch2
    } = useForm<inputSearch>({
        resolver: zodResolver(searchTypeDocument),
        defaultValues: {
            documentType: 'dni',
            documentNumber: ''
        }
    });

    // Formulario de datos del Contrayente 1
    const {
        register: registerForm1,
        handleSubmit: handleSubmitForm1,
        formState: { errors: formErrors1 },
        setValue: setValueForm1,
        reset: resetForm1,
        watch: watchForm1
    } = useForm<ContrayenteFormData>({
        resolver: zodResolver(contrayenteSchema),
        defaultValues: {
            cui: '',
            documentTypeId: 1,
            names: '',
            paternalSurname: '',
            maternalSurname: '',
            birthdate: '',
            gender: undefined,
            address: '',
            email: '',
            phone: '',
            ubigeoId: '',
            maritalStatus: undefined
        }
    });

    // Formulario de datos del Contrayente 2
    const {
        register: registerForm2,
        handleSubmit: handleSubmitForm2,
        formState: { errors: formErrors2 },
        setValue: setValueForm2,
        reset: resetForm2,
        watch: watchForm2
    } = useForm<ContrayenteFormData>({
        resolver: zodResolver(contrayenteSchema),
        defaultValues: {
            cui: '',
            documentTypeId: 1,
            names: '',
            paternalSurname: '',
            maternalSurname: '',
            birthdate: '',
            gender: undefined,
            address: '',
            email: '',
            phone: '',
            ubigeoId: '',
            maritalStatus: undefined
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

    const [contrayente1Added, setContrayente1Added] = useState(false);
    const [contrayente2Added, setContrayente2Added] = useState(false);
    const [sameGenderError, setSameGenderError] = useState('');

    // Estados para detectar si el formulario ha sido modificado
    const [isForm1Modified, setIsForm1Modified] = useState(false);
    const [isForm2Modified, setIsForm2Modified] = useState(false);

    // Estados para controlar apertura del panel de formulario
    const [open1, setOpen1] = useState(false);
    const [open2, setOpen2] = useState(false);

    // Ubigeo
    const { ubigeos, loading: ubigeoLoading } = useUbigeo();
    const [ubigeoFilter1, setUbigeoFilter1] = useState('');
    const [ubigeoFilter2, setUbigeoFilter2] = useState('');

    // Campos bloqueados (rellenados por la API)
    const [lockedFields1, setLockedFields1] = useState<Set<string>>(new Set());
    const [lockedFields2, setLockedFields2] = useState<Set<string>>(new Set());

    // Cargar datos desde localStorage al montar el componente
    useEffect(() => {
        const contrayentes = formDataAplication.participants.filter((p: Participant) =>
            p.rol === rolParticipante
        );

        // Llenar formulario del contrayente 1 si existe en localStorage
        if (contrayentes.length >= 1) {
            const contrayente1 = contrayentes[0];
            setValueForm1('cui', contrayente1.cui);
            setValueForm1('documentTypeId', contrayente1.documentTypeId);
            setValueForm1('names', contrayente1.names);
            setValueForm1('paternalSurname', contrayente1.paternalSurname);
            setValueForm1('maternalSurname', contrayente1.maternalSurname || '');
            setValueForm1('birthdate', contrayente1.birthdate);
            setValueForm1('gender', contrayente1.gender);
            setValueForm1('address', contrayente1.address);
            setValueForm1('email', contrayente1.email || '');
            setValueForm1('phone', contrayente1.phone || '');
            setValueForm1('ubigeoId', contrayente1.ubigeoId);
            setValueForm1('maritalStatus', contrayente1.maritalStatus as any);
            setContrayente1Added(true);
            setOpen1(true);
        }

        // Llenar formulario del contrayente 2 si existe en localStorage
        if (contrayentes.length >= 2) {
            const contrayente2 = contrayentes[1];
            setValueForm2('cui', contrayente2.cui);
            setValueForm2('documentTypeId', contrayente2.documentTypeId);
            setValueForm2('names', contrayente2.names);
            setValueForm2('paternalSurname', contrayente2.paternalSurname);
            setValueForm2('maternalSurname', contrayente2.maternalSurname || '');
            setValueForm2('birthdate', contrayente2.birthdate);
            setValueForm2('gender', contrayente2.gender);
            setValueForm2('address', contrayente2.address);
            setValueForm2('email', contrayente2.email || '');
            setValueForm2('phone', contrayente2.phone || '');
            setValueForm2('ubigeoId', contrayente2.ubigeoId);
            setValueForm2('maritalStatus', contrayente2.maritalStatus as any);
            setContrayente2Added(true);
            setOpen2(true);
        }
        // Solo ejecutar al montar el componente
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sincronizar con el estado global del contexto
    useEffect(() => {
        const contrayentes = formDataAplication.participants.filter((p: Participant) =>
            p.rol === rolParticipante
        );
        setContrayente1Added(contrayentes.length >= 1);
        setContrayente2Added(contrayentes.length >= 2);

        if (onContrayentesChange) {
            onContrayentesChange(contrayentes);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formDataAplication.participants]);

    useEffect(() => {
        const isStepValid = contrayente1Added && contrayente2Added;

        if (onValidationChange) {
            onValidationChange(isStepValid);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contrayente1Added, contrayente2Added]);

    // Detectar cambios en el formulario 1 para habilitar el botón de edición
    useEffect(() => {
        const subscription = watchForm1(() => {
            if (contrayente1Added) {
                setIsForm1Modified(true);
            }
        });
        return () => subscription.unsubscribe();
    }, [watchForm1, contrayente1Added]);

    // Detectar cambios en el formulario 2 para habilitar el botón de edición
    useEffect(() => {
        const subscription = watchForm2(() => {
            if (contrayente2Added) {
                setIsForm2Modified(true);
            }
        });
        return () => subscription.unsubscribe();
    }, [watchForm2, contrayente2Added]);

    // Función para buscar persona
    const handleSearchContrayente = useCallback(async (contrayenteNum: 1 | 2) => {
        const isContrayente1 = contrayenteNum === 1;
        const tipoDoc = isContrayente1 ? tipoDoc1 : tipoDoc2;
        const numDoc = isContrayente1 ? numDoc1 : numDoc2;
        const setError = isContrayente1 ? setSearchError1 : setSearchError2;
        const setSuccess = isContrayente1 ? setSearchSuccess1 : setSearchSuccess2;
        const setValueForm = isContrayente1 ? setValueForm1 : setValueForm2;

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
                return;
            }

            const personData = response.data;
            const validGender = personData.gender === 'M' || personData.gender === 'F'
                ? personData.gender as 'M' | 'F'
                : undefined;

            // Llenar el formulario con los datos encontrados
            setValueForm('cui', numDoc);
            setValueForm('documentTypeId', documentTypeNumber);
            setValueForm('names', personData.name || '');
            setValueForm('paternalSurname', personData.paternalSurname || '');
            setValueForm('maternalSurname', personData.maternalSurname || '');
            setValueForm('birthdate', personData.birthdate || '');
            if (validGender) setValueForm('gender', validGender);
            setValueForm('address', personData.address || '');
            setValueForm('email', personData.email || '');
            setValueForm('phone', personData.phone || '');
            setValueForm('ubigeoId', personData.ubigeoId || '');
            if (personData.maritalStatus) setValueForm('maritalStatus', personData.maritalStatus as any);

            // Bloquear solo los campos que la API proporcionó con valor
            const locked = new Set<string>();
            locked.add('cui'); // siempre viene del doc buscado
            if (personData.name)          locked.add('names');
            if (personData.paternalSurname) locked.add('paternalSurname');
            if (personData.maternalSurname) locked.add('maternalSurname');
            if (personData.birthdate)     locked.add('birthdate');
            if (validGender)              locked.add('gender');
            if (personData.address)       locked.add('address');
            if (personData.email)         locked.add('email');
            if (personData.phone)         locked.add('phone');
            if (personData.ubigeoId)      locked.add('ubigeoId');
            if (personData.maritalStatus) locked.add('maritalStatus');
            if (isContrayente1) setLockedFields1(locked); else setLockedFields2(locked);

            setSuccess(true);
            // Auto-abrir el formulario al encontrar persona
            if (isContrayente1) setOpen1(true); else setOpen2(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (error: any) {
            console.error('Error al buscar persona:', error);
            setError(error.response?.data?.message || 'Error al buscar persona');
        }
    }, [tipoDoc1, numDoc1, tipoDoc2, numDoc2, fetchPersonSearch, setValueForm1, setValueForm2]);

    // Función para limpiar búsqueda
    const handleClearSearch = useCallback((contrayenteNum: 1 | 2) => {
        const isContrayente1 = contrayenteNum === 1;
        const setError = isContrayente1 ? setSearchError1 : setSearchError2;
        const setSuccess = isContrayente1 ? setSearchSuccess1 : setSearchSuccess2;
        const resetForm = isContrayente1 ? resetForm1 : resetForm2;
        const resetSearch = isContrayente1 ? resetSearch1 : resetSearch2;

        setError('');
        setSuccess(false);
        resetForm();
        resetSearch();
        // Liberar campos al limpiar
        if (isContrayente1) setLockedFields1(new Set()); else setLockedFields2(new Set());
    }, [resetForm1, resetForm2, resetSearch1, resetSearch2]);

    // Función para agregar contrayente al contexto
    const handleAddContrayente = useCallback((contrayenteNum: 1 | 2) => {
        const handleSubmit = contrayenteNum === 1 ? handleSubmitForm1 : handleSubmitForm2;
        const setAdded = contrayenteNum === 1 ? setContrayente1Added : setContrayente2Added;
        const setError = contrayenteNum === 1 ? setSearchError1 : setSearchError2;
        const setModified = contrayenteNum === 1 ? setIsForm1Modified : setIsForm2Modified;
        const tipoDoc = contrayenteNum === 1 ? tipoDoc1 : tipoDoc2;

        const documentTypeMapping: Record<string, number> = {
            'dni': 1,
            'pas': 2,
            'ced': 3
        };
        handleSubmit((data: ContrayenteFormData) => {
            // Verificar si ya existe como contrayente
            const isDuplicateContrayente = formDataAplication.participants.some((p: Participant) =>
                p.cui === data.cui && p.rol === rolParticipante
            );

            if (isDuplicateContrayente) {
                setError('Este DNI ya ha sido agregado como contrayente');
                return;
            }

            // Validar que los contrayentes sean de sexo diferente
            const contrayentes = formDataAplication.participants.filter((p: Participant) =>
                p.rol === rolParticipante
            );

            if (contrayentes.length > 0) {
                const otroContrayente = contrayentes[0];
                if (otroContrayente.gender === data.gender) {
                    setSameGenderError('Los contrayentes deben ser de sexo diferente (hombre y mujer)');
                    return;
                } else {
                    // Limpiar error si los géneros son diferentes
                    setSameGenderError('');
                }
            }

            // Limpiar error de mismo sexo si existe
            setSameGenderError('');

            // Agregar con el rol dinámico según tipo de solicitud y ctry null
            addParticipant({
                ...data,
                rol: rolParticipante,
                documentTypeId: documentTypeMapping[tipoDoc] || 1,
                ctry: null
            });
            setAdded(true);
            setModified(false); // Resetear el flag de modificación
            setError('');
        })();
    }, [handleSubmitForm1, handleSubmitForm2, addParticipant, formDataAplication.participants, tipoDoc1, tipoDoc2]);

    // Función para eliminar contrayente
    const handleDeleteContrayente = useCallback((cui: string, contrayenteNum: 1 | 2) => {
        // Eliminar el participante completamente
        deleteParticipant(cui);

        const setAdded = contrayenteNum === 1 ? setContrayente1Added : setContrayente2Added;
        const resetForm = contrayenteNum === 1 ? resetForm1 : resetForm2;
        const resetSearch = contrayenteNum === 1 ? resetSearch1 : resetSearch2;

        setAdded(false);
        resetForm();
        resetSearch();
    }, [deleteParticipant, resetForm1, resetForm2, resetSearch1, resetSearch2]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, contrayenteNum: 1 | 2) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchContrayente(contrayenteNum);
        }
    }, [handleSearchContrayente]);

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

    // Renderizar formulario de contrayente
    const renderContrayenteForm = (
        contrayenteNum: 1 | 2,
        registerSearch: any,
        errorsSearch: any,
        watchSearch: any,
        registerForm: any,
        errorsForm: any,
        searchError: string,
        searchSuccess: boolean,
        isAdded: boolean,
        isModified: boolean
    ) => {
        const tipoDoc = watchSearch('documentType');
        const numDoc = watchSearch('documentNumber');
        const isOpen = contrayenteNum === 1 ? open1 : open2;
        const setIsOpen = contrayenteNum === 1 ? setOpen1 : setOpen2;
        const lockedFields = contrayenteNum === 1 ? lockedFields1 : lockedFields2;
        const isLocked = (field: string) => lockedFields.has(field);
        const inputCls = (field: string) =>
            `w-full px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isLocked(field)
                    ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                    : 'border-gray-300 bg-white'
            }`;

        return (
            <div className="space-y-4">

                <div className="bg-base-100 border border-indigo-200 rounded-lg overflow-hidden">
                    <div
                        className="font-semibold bg-indigo-50 p-4 cursor-pointer"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <div className='w-full flex flex-row-reverse items-end'>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                                className="relative h-full px-3 flex items-center text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
                                title={isOpen ? 'Cerrar formulario' : 'Abrir formulario'}
                            >
                                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-2xl`}></i>
                            </button>
                        </div>
                        <div className='flex flex-col md:flex-row items-start gap-4 relative pr-10'>
                            {/* Tipo de documento */}
                            <div className={"flex-1 w-full"}>
                                <label className="text-sm font-medium text-gray-700 mb-2">
                                    Tipo de documento
                                </label>
                                <p className="mt-2 text-xs text-gray-500 mb-3 min-h-8">
                                    <i className="fas fa-info-circle mr-1"></i>
                                    <span>Seleccione el tipo de documento</span>
                                </p>
                                <select
                                    defaultValue={"dni"}
                                    className={"select outline-0 w-full py-2 sm:py-2.5 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 transition-all bg-white px-3 border border-gray-300 rounded-lg"}
                                    onClick={(e) => e.stopPropagation()}
                                    {...registerSearch('documentType')}
                                >
                                    <option value="dni">DNI</option>
                                    <option value="pas">PASAPORTE</option>
                                    <option value="ced">CEDULA</option>
                                </select>
                            </div>
                            {/* Número de documento */}
                            <div className={"flex-1 w-full"}>
                                <label className="text-sm font-medium text-gray-700 mb-2">
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
                                        onKeyDown={(e) => handleKeyDown(e, contrayenteNum)}
                                        onInput={(e) => handleDocumentInput(e, tipoDoc)}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`w-full pl-9 sm:pl-11 pr-20 sm:pr-24 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all ${searchSuccess ? 'border-green-500 bg-green-50'
                                            : searchError ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300'
                                            }`}
                                        {...registerSearch('documentNumber')}
                                        placeholder={tipoDoc === 'dni' ? "8 dígitos" : tipoDoc === 'pas' ? "Pasaporte" : "Cédula"}
                                        maxLength={tipoDoc === 'dni' ? 8 : tipoDoc === 'ced' ? 10 : 20}
                                    />
                                    {numDoc && numDoc.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); handleClearSearch(contrayenteNum); }}
                                            className="absolute inset-y-0 right-12 sm:right-16 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Limpiar"
                                        >
                                            <i className="fas fa-times text-sm"></i>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleSearchContrayente(contrayenteNum); }}
                                        disabled={!!errorsSearch.documentNumber || !numDoc || numDoc.length === 0}
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

                    </div>

                    {/* Formulario de datos */}
                    {isOpen && (
                        <div className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {/* DNI */}
                                <div className='mb-0'>
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                        CUI <span className="text-red-500">*</span>
                                        {isLocked('cui') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                                    </label>
                                    <input
                                        type="text"
                                        {...registerForm('cui')}
                                        disabled={isLocked('cui')}
                                        className={inputCls('cui')}
                                        placeholder="DNI"
                                        maxLength={8}
                                    />
                                    {errorsForm.cui && (
                                        <p className="text-red-500 text-xs mt-1">{errorsForm.cui.message}</p>
                                    )}
                                </div>

                                {/* Nombres */}
                                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                        Nombres <span className="text-red-500">*</span>
                                        {isLocked('names') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                                    </label>
                                    <input
                                        type="text"
                                        {...registerForm('names')}
                                        disabled={isLocked('names')}
                                        className={inputCls('names')}
                                        placeholder="Nombres"
                                    />
                                    {errorsForm.names && (
                                        <p className="text-red-500 text-xs mt-1">{errorsForm.names.message}</p>
                                    )}
                                </div>

                                {/* Apellido Paterno */}
                                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                        Apellido Paterno <span className="text-red-500">*</span>
                                        {isLocked('paternalSurname') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                                    </label>
                                    <input
                                        type="text"
                                        {...registerForm('paternalSurname')}
                                        disabled={isLocked('paternalSurname')}
                                        className={inputCls('paternalSurname')}
                                        placeholder="Apellido paterno"
                                    />
                                    {errorsForm.paternalSurname && (
                                        <p className="text-red-500 text-xs mt-1">{errorsForm.paternalSurname.message}</p>
                                    )}
                                </div>

                                {/* Apellido Materno */}
                                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                        Apellido Materno <span className="text-red-500">*</span>
                                        {isLocked('maternalSurname') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                                    </label>
                                    <input
                                        type="text"
                                        {...registerForm('maternalSurname')}
                                        disabled={isLocked('maternalSurname')}
                                        className={inputCls('maternalSurname')}
                                        placeholder="Apellido materno"
                                    />
                                    {errorsForm.maternalSurname && (
                                        <p className="text-red-500 text-xs mt-1">{errorsForm.maternalSurname.message}</p>
                                    )}
                                </div>

                                {/* Fecha de Nacimiento */}
                                <div className='mb-0'>
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                        Fecha Nacimiento <span className="text-red-500">*</span>
                                        {isLocked('birthdate') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                                    </label>
                                    <input
                                        type="date"
                                        {...registerForm('birthdate')}
                                        disabled={isLocked('birthdate')}
                                        className={inputCls('birthdate')}
                                    />
                                    {errorsForm.birthdate && (
                                        <p className="text-red-500 text-xs mt-1">{errorsForm.birthdate.message}</p>
                                    )}
                                </div>

                                {/* Sexo */}
                                <div className='mb-0'>
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                        Sexo <span className="text-red-500">*</span>
                                        {isLocked('gender') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                                    </label>
                                    <select
                                        {...registerForm('gender')}
                                        disabled={isLocked('gender')}
                                        className={inputCls('gender')}
                                    >
                                        <option value="">Seleccione</option>
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                    </select>
                                    {errorsForm.gender && (
                                        <p className="text-red-500 text-xs mt-1">{errorsForm.gender.message}</p>
                                    )}
                                </div>

                                {/* Dirección */}
                                <div className='mb-0 sm:col-span-2 lg:col-span-2'>
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                        Dirección <span className="text-red-500">*</span>
                                        {isLocked('address') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                                    </label>
                                    <input
                                        type="text"
                                        {...registerForm('address')}
                                        disabled={isLocked('address')}
                                        className={inputCls('address')}
                                        placeholder="Dirección"
                                    />
                                    {errorsForm.address && (
                                        <p className="text-red-500 text-xs mt-1">{errorsForm.address.message}</p>
                                    )}
                                </div>

                                {/* Correo */}
                                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                        Correo Electrónico <span className="text-red-500">*</span>
                                        {isLocked('email') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                                    </label>
                                    <input
                                        type="email"
                                        {...registerForm('email')}
                                        disabled={isLocked('email')}
                                        className={inputCls('email')}
                                        placeholder="correo@ejemplo.com"
                                    />
                                    {errorsForm.email && (
                                        <p className="text-red-500 text-xs mt-1">{errorsForm.email.message}</p>
                                    )}
                                </div>

                                {/* Teléfono */}
                                <div className='mb-0 sm:col-span-2 lg:col-span-1 mt-1.5'>
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                        Teléfono <span className="text-red-500">*</span>
                                        {isLocked('phone') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                                    </label>
                                    <input
                                        type="text"
                                        {...registerForm('phone')}
                                        disabled={isLocked('phone')}
                                        className={inputCls('phone')}
                                        placeholder="987654321"
                                        maxLength={9}
                                    />
                                    {errorsForm.phone && (
                                        <p className="text-red-500 text-xs mt-1">{errorsForm.phone.message}</p>
                                    )}
                                </div>

                                {/* Ubigeo */}
                                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                                    {(() => {
                                        const currentUbigeoId = contrayenteNum === 1 ? watchForm1('ubigeoId') : watchForm2('ubigeoId');
                                        const setVal = contrayenteNum === 1 ? setValueForm1 : setValueForm2;
                                        const ubigeoFilter = contrayenteNum === 1 ? ubigeoFilter1 : ubigeoFilter2;
                                        const setUbigeoFilter = contrayenteNum === 1 ? setUbigeoFilter1 : setUbigeoFilter2;
                                        const filtered = ubigeoFilter.trim().length === 0
                                            ? ubigeos
                                            : ubigeos.filter(u => {
                                                const text = `${u.departamento} ${u.provincia} ${u.distrito}`.toLowerCase();
                                                return text.includes(ubigeoFilter.toLowerCase());
                                            });
                                        const selectedLabel = ubigeos.find(u => u.id === currentUbigeoId);
                                        return ubigeoLoading ? (
                                            <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                                                <span className="loading loading-spinner loading-xs"></span> Cargando ubigeos...
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5">
                                                {/* Label + buscador en la misma fila */}
                                                <div className="flex items-center gap-2 mb-1">
                                                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap flex items-center gap-1">
                                                        Ubigeo <span className="text-red-500">*</span>
                                                        {isLocked('ubigeoId') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                                                    </label>
                                                    <div className="relative flex-1">
                                                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                                            <i className={`fas fa-search text-xs ${isLocked('ubigeoId') ? 'text-gray-300' : 'text-gray-400'}`}></i>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder={isLocked('ubigeoId') ? 'Bloqueado por la API' : 'Buscar depto., provincia o distrito...'}
                                                            value={ubigeoFilter}
                                                            disabled={isLocked('ubigeoId')}
                                                            onChange={e => setUbigeoFilter(e.target.value)}
                                                            className={`w-full pl-7 pr-3 py-1.5 text-xs border rounded-lg outline-0 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                                isLocked('ubigeoId') ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300 bg-white'
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                                {/* Código de ubigeo bajo el label */}
                                                <p className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                                    {currentUbigeoId
                                                        ? <><span className="">{currentUbigeoId}</span></>
                                                        : <span className="text-gray-300">Código: —</span>
                                                    }
                                                </p>
                                                {ubigeoFilter.trim().length > 0 && (
                                                    <ul className="w-full max-h-40 overflow-y-auto border border-blue-300 rounded-lg bg-white shadow-md text-xs divide-y divide-gray-100">
                                                        {filtered.length === 0 ? (
                                                            <li className="px-3 py-2 text-gray-400 italic">Sin resultados</li>
                                                        ) : filtered.map(u => (
                                                            <li
                                                                key={u.id}
                                                                onMouseDown={() => {
                                                                    setVal('ubigeoId', u.id);
                                                                    setUbigeoFilter('');
                                                                }}
                                                                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors ${currentUbigeoId === u.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'}`}
                                                            >
                                                                {u.departamento}, {u.provincia}, {u.distrito}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {selectedLabel && ubigeoFilter.trim().length === 0 && (
                                                    <p className="text-xs text-blue-600 font-medium">
                                                        <i className="fas fa-map-marker-alt mr-1"></i>
                                                        {selectedLabel.departamento}, {selectedLabel.provincia}, {selectedLabel.distrito}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })()}
                                    {errorsForm.ubigeoId && (
                                        <p className="text-red-500 text-xs mt-1">{errorsForm.ubigeoId.message}</p>
                                    )}
                                </div>

                                {/* Estado Civil */}
                                <div className='mb-0 sm:col-span-2 lg:col-span-1 mt-1.5'>
                                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                        Estado Civil <span className="text-red-500">*</span>
                                        {isLocked('maritalStatus') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                                    </label>
                                    <select
                                        {...registerForm('maritalStatus')}
                                        disabled={isLocked('maritalStatus')}
                                        className={inputCls('maritalStatus')}
                                    >
                                        <option value="">Seleccione</option>
                                        <option value="Soltero">Soltero(a)</option>
                                        <option value="Casado">Casado(a)</option>
                                        <option value="Divorciado">Divorciado(a)</option>
                                        <option value="Viudo">Viudo(a)</option>
                                    </select>
                                    {errorsForm.maritalStatus && (
                                        <p className="text-red-500 text-xs mt-1">{errorsForm.maritalStatus.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Botón para agregar contrayente */}
                            <div className="flex justify-end mt-4">
                                <button
                                    type="button"
                                    onClick={() => handleAddContrayente(contrayenteNum)}
                                    disabled={isAdded && !isModified}
                                    className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <i className={isAdded && !isModified ? "fas fa-check-circle" : isModified ? "fas fa-save" : "fas fa-plus-circle"}></i>
                                    <span>
                                        {isAdded && !isModified
                                            ? 'Contrayente Agregado'
                                            : isModified
                                                ? 'Actualizar Contrayente'
                                                : 'Agregar Contrayente'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
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
                    <span>{esDivorcio ? 'Datos de los Involucrados' : 'Datos de los Prometidos'}</span>
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

            {/* Alerta de error de mismo sexo */}
            {sameGenderError && (
                <Alert
                    type="warning"
                    message={sameGenderError}
                    onClose={() => setSameGenderError('')}
                />
            )}

            {/* Contrayente 1 */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-user-circle text-blue-600"></i>
                    {esDivorcio ? 'Datos del Involucrado' : 'Datos del Prometido'}
                </h4>
                {renderContrayenteForm(
                    1,
                    register1,
                    errors1,
                    watch1,
                    registerForm1,
                    formErrors1,
                    searchError1,
                    searchSuccess1,
                    contrayente1Added,
                    isForm1Modified
                )}
            </div>

            {/* Contrayente 2 */}
            <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-user-circle text-pink-600"></i>
                    {esDivorcio ? 'Datos de la Involucrada' : 'Datos de la Prometida'}
                </h4>
                {renderContrayenteForm(
                    2,
                    register2,
                    errors2,
                    watch2,
                    registerForm2,
                    formErrors2,
                    searchError2,
                    searchSuccess2,
                    contrayente2Added,
                    isForm2Modified
                )}
            </div>
            {/* Alerta de error de mismo sexo */}
            {sameGenderError && (
                <Alert
                    type="warning"
                    message={sameGenderError}
                    onClose={() => setSameGenderError('')}
                />
            )}
            {/* Tabla de contrayentes agregados */}
            {formDataAplication.participants.filter((p: Participant) => p.rol === rolParticipante).length > 0 && (
                <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-list text-blue-600"></i>
                        {esDivorcio ? 'Involucrados Agregados' : 'Prometidos Agregados'}
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">DNI</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Nombres Completos</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Sexo</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Estado Civil</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Email</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Rol</th>
                                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formDataAplication.participants.filter((p: Participant) => p.rol === rolParticipante).map((contrayente: Participant, index: number) => (
                                    <tr key={contrayente.cui} className="border-t border-gray-200">
                                        <td className="px-4 py-2 text-sm text-gray-700">{contrayente.cui}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            {contrayente.names} {contrayente.paternalSurname} {contrayente.maternalSurname}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            {contrayente.gender === 'M' ? 'Masculino' : 'Femenino'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{contrayente.maritalStatus}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{contrayente.email}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                {contrayente.rol}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteContrayente(contrayente.cui, (index + 1) as 1 | 2)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                title="Eliminar rol de contrayente"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contrayente;


