import { useState, useCallback, useEffect } from 'react';
import { usePersonSearch } from '../../../../hooks/usePersonSearch.ts';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchTypeDocument } from "../../../../Validations/validationSearchTypeDocument.ts";
import { testigoSchema, type TestigoFormData } from '../../../../Validations/validationTestigo.ts';
import { useApplicationContext } from '../../../../context/ApplicationContext.tsx';
import { z } from "zod";
import type { Participant, MaritalStatus } from "../../../../model/aplicationModel.ts";
import Alert from "../../../Alert.tsx";

interface Solicitud {
    tipoSolicitudNombre?: string;
    descriptionSolicitud?: string;
    onTestigosChange?: (testigos: Participant[]) => void;
    onValidationChange?: (isValid: boolean) => void;
}

type inputSearch = z.infer<typeof searchTypeDocument>;

const Testigo = (props: Solicitud) => {
    const { tipoSolicitudNombre, descriptionSolicitud, onTestigosChange, onValidationChange } = props;
    const { addParticipant, deleteParticipant, formDataAplication } = useApplicationContext();
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    // Estados para búsqueda de Testigo 1
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

    // Estados para búsqueda de Testigo 2
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

    // Formulario de datos del Testigo 1
    const {
        register: registerForm1,
        handleSubmit: handleSubmitForm1,
        formState: { errors: formErrors1 },
        setValue: setValueForm1,
        reset: resetForm1
    } = useForm<TestigoFormData>({
        resolver: zodResolver(testigoSchema),
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

    // Formulario de datos del Testigo 2
    const {
        register: registerForm2,
        handleSubmit: handleSubmitForm2,
        formState: { errors: formErrors2 },
        setValue: setValueForm2,
        reset: resetForm2
    } = useForm<TestigoFormData>({
        resolver: zodResolver(testigoSchema),
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

    const [testigo1Added, setTestigo1Added] = useState(false);
    const [testigo2Added, setTestigo2Added] = useState(false);

    // Estados para el contrayente seleccionado
    const [selectedContrayente1, setSelectedContrayente1] = useState('');
    const [selectedContrayente2, setSelectedContrayente2] = useState('');

    // Cargar datos desde localStorage al montar el componente
    useEffect(() => {
        const testigos = formDataAplication.participants.filter((p: Participant) =>
            p.rol === 'testigo'
        );

        // Llenar formulario del testigo 1 si existe en localStorage
        if (testigos.length >= 1) {
            const testigo1 = testigos[0];
            setValueForm1('cui', testigo1.cui);
            setValueForm1('documentTypeId', testigo1.documentTypeId);
            setValueForm1('names', testigo1.names);
            setValueForm1('paternalSurname', testigo1.paternalSurname);
            setValueForm1('maternalSurname', testigo1.maternalSurname || '');
            setValueForm1('birthdate', testigo1.birthdate);
            setValueForm1('gender', testigo1.gender);
            setValueForm1('address', testigo1.address);
            setValueForm1('email', testigo1.email || '');
            setValueForm1('phone', testigo1.phone || '');
            setValueForm1('ubigeoId', testigo1.ubigeoId);
            setValueForm1('maritalStatus', testigo1.maritalStatus as MaritalStatus);
            setTestigo1Added(true);
            if (testigo1.ctry) {
                setSelectedContrayente1(testigo1.ctry);
            }
        }

        // Llenar formulario del testigo 2 si existe en localStorage
        if (testigos.length >= 2) {
            const testigo2 = testigos[1];
            setValueForm2('cui', testigo2.cui);
            setValueForm2('documentTypeId', testigo2.documentTypeId);
            setValueForm2('names', testigo2.names);
            setValueForm2('paternalSurname', testigo2.paternalSurname);
            setValueForm2('maternalSurname', testigo2.maternalSurname || '');
            setValueForm2('birthdate', testigo2.birthdate);
            setValueForm2('gender', testigo2.gender);
            setValueForm2('address', testigo2.address);
            setValueForm2('email', testigo2.email || '');
            setValueForm2('phone', testigo2.phone || '');
            setValueForm2('ubigeoId', testigo2.ubigeoId);
            setValueForm2('maritalStatus', testigo2.maritalStatus as MaritalStatus);
            setTestigo2Added(true);
            if (testigo2.ctry) {
                setSelectedContrayente2(testigo2.ctry);
            }
        }
        // Solo ejecutar al montar el componente
    }, []);

    // Sincronizar con el estado global del contexto
    useEffect(() => {
        const testigos = formDataAplication.participants.filter((p: Participant) =>
            p.rol === 'testigo'
        );
        setTestigo1Added(testigos.length >= 1);
        setTestigo2Added(testigos.length >= 2);

        if (onTestigosChange) {
            onTestigosChange(testigos);
        }
    }, [formDataAplication.participants]);

    // Validar como mínimo 2 testigos
    useEffect(() => {
        const isStepValid = testigo1Added && testigo2Added;

        if (onValidationChange) {
            onValidationChange(isStepValid);
        }
    }, [testigo1Added, testigo2Added]);



    // Función para buscar persona
    const handleSearchTestigo = useCallback(async (testigoNum: 1 | 2) => {
        const isTestigo1 = testigoNum === 1;
        const tipoDoc = isTestigo1 ? tipoDoc1 : tipoDoc2;
        const numDoc = isTestigo1 ? numDoc1 : numDoc2;
        const setError = isTestigo1 ? setSearchError1 : setSearchError2;
        const setSuccess = isTestigo1 ? setSearchSuccess1 : setSearchSuccess2;
        const setValueForm = isTestigo1 ? setValueForm1 : setValueForm2;

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

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (error: any) {
            console.error('Error al buscar persona:', error);
            setError(error.response?.data?.message || 'Error al buscar persona');
        }
    }, [tipoDoc1, numDoc1, tipoDoc2, numDoc2, fetchPersonSearch, setValueForm1, setValueForm2]);

    // Función para limpiar búsqueda
    const handleClearSearch = useCallback((testigoNum: 1 | 2) => {
        const isTestigo1 = testigoNum === 1;
        const setError = isTestigo1 ? setSearchError1 : setSearchError2;
        const setSuccess = isTestigo1 ? setSearchSuccess1 : setSearchSuccess2;
        const resetForm = isTestigo1 ? resetForm1 : resetForm2;
        const resetSearch = isTestigo1 ? resetSearch1 : resetSearch2;

        setError('');
        setSuccess(false);
        resetForm();
        resetSearch();
    }, [resetForm1, resetForm2, resetSearch1, resetSearch2]);

    // Función para agregar testigo al contexto
    const handleAddTestigo = useCallback((testigoNum: 1 | 2) => {
        const handleSubmit = testigoNum === 1 ? handleSubmitForm1 : handleSubmitForm2;
        const setAdded = testigoNum === 1 ? setTestigo1Added : setTestigo2Added;
        const setError = testigoNum === 1 ? setSearchError1 : setSearchError2;
        const tipoDoc = testigoNum === 1 ? tipoDoc1 : tipoDoc2;
        const selectedContrayente = testigoNum === 1 ? selectedContrayente1 : selectedContrayente2;

        const documentTypeMapping: Record<string, number> = {
            'dni': 1,
            'pas': 2,
            'ced': 3
        };

        // Validar que se haya seleccionado un contrayente
        if (!selectedContrayente) {
            setError('Debe seleccionar un contrayente al que respalda este testigo');
            return;
        }

        handleSubmit((data: TestigoFormData) => {
            // Verificar si ya existe como testigo
            const existingTestigo = formDataAplication.participants.find((p: Participant) =>
                p.cui === data.cui && p.rol === 'testigo'
            );

            if (existingTestigo) {
                // Verificar si el testigo ya está asignado a otro contrayente
                if (existingTestigo.ctry && existingTestigo.ctry !== selectedContrayente) {
                    const contrayenteActual = formDataAplication.participants.find(
                        (p: Participant) => p.cui === existingTestigo.ctry && p.rol === 'contrayente'
                    );
                    setShowAlert(true);
                    setAlertMessage(`Este testigo ya está asignado al contrayente ${contrayenteActual?.names} ${contrayenteActual?.paternalSurname}. ` +
                        `Un testigo solo puede respaldar a un contrayente.`);
                    return;
                }

                setError('Este DNI ya ha sido agregado como testigo');
                return;
            }

            // Validar que el contrayente seleccionado no tenga ya un testigo asignado
            const testigoDelContrayente = formDataAplication.participants.find((p: Participant) =>
                p.rol === 'testigo' && p.ctry === selectedContrayente
            );

            if (testigoDelContrayente) {
                const contrayente = formDataAplication.participants.find(
                    (p: Participant) => p.cui === selectedContrayente && p.rol === 'contrayente'
                );

                setShowAlert(true);
                setAlertMessage( `El contrayente ${contrayente?.names} ${contrayente?.paternalSurname} ya tiene un testigo asignado. ` +
                    `Cada contrayente solo puede tener un testigo.`);
                return;
            }

            // Agregar como testigo con el ctry conteniendo el DNI del contrayente
            addParticipant({
                ...data,
                rol: 'testigo',
                documentTypeId: documentTypeMapping[tipoDoc] || 1,
                ctry: selectedContrayente
            });
            setAdded(true);
            setError('');
        })();
    }, [handleSubmitForm1, handleSubmitForm2, addParticipant, formDataAplication.participants, tipoDoc1, tipoDoc2, selectedContrayente1, selectedContrayente2]);

    // Función para eliminar testigo
    const handleDeleteTestigo = useCallback((cui: string, testigoNum: 1 | 2) => {
        // Eliminar el participante completamente
        deleteParticipant(cui);

        const setAdded = testigoNum === 1 ? setTestigo1Added : setTestigo2Added;
        const resetForm = testigoNum === 1 ? resetForm1 : resetForm2;
        const resetSearch = testigoNum === 1 ? resetSearch1 : resetSearch2;
        const setSelectedContrayente = testigoNum === 1 ? setSelectedContrayente1 : setSelectedContrayente2;

        setAdded(false);
        resetForm();
        resetSearch();
        setSelectedContrayente(''); // Limpiar el contrayente seleccionado
    }, [deleteParticipant, resetForm1, resetForm2, resetSearch1, resetSearch2]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, testigoNum: 1 | 2) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchTestigo(testigoNum);
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

    // Renderizar formulario de testigo
    const renderTestigoForm = (
        testigoNum: 1 | 2,
        registerSearch: any,
        errorsSearch: any,
        watchSearch: any,
        registerForm: any,
        errorsForm: any,
        searchError: string,
        searchSuccess: boolean,
        isAdded: boolean
    ) => {
        const tipoDoc = watchSearch('documentType');
        const numDoc = watchSearch('documentNumber');

        return (
            <div className="space-y-4">
                {/* Búsqueda */}
                <div className='mb-2 flex flex-col md:flex-row items-start gap-4'>
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
                            {...registerSearch('documentType')}
                        >
                            <option value="dni">DNI</option>
                            <option value="pas">PASAPORTE</option>
                            <option value="ced">CEDULA</option>
                        </select>
                    </div>
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
                                onKeyDown={(e) => handleKeyDown(e, testigoNum)}
                                onInput={(e) => handleDocumentInput(e, tipoDoc)}
                                className={`w-full pl-9 sm:pl-11 pr-20 sm:pr-24 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all ${searchSuccess
                                    ? 'border-green-500 bg-green-50'
                                    : searchError
                                        ? 'border-red-300 bg-red-50'
                                        : 'border-gray-300'
                                    }`}
                                {...registerSearch('documentNumber')}
                                placeholder={tipoDoc === 'dni' ? "8 dígitos" : tipoDoc === 'pas' ? "Pasaporte" : "Cédula"}
                                maxLength={tipoDoc === 'dni' ? 8 : tipoDoc === 'ced' ? 10 : 20}
                            />
                            {numDoc && numDoc.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleClearSearch(testigoNum)}
                                    className="absolute inset-y-0 right-12 sm:right-16 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Limpiar"
                                >
                                    <i className="fas fa-times text-sm"></i>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleSearchTestigo(testigoNum)}
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

                {/* Formulario de datos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* DNI */}
                    <div className='mb-0'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            CUI <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className='w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            {...registerForm('cui')}
                            placeholder="CUI"
                            maxLength={8}
                        />
                        {errorsForm.cui && (
                            <p className="text-red-500 text-xs mt-1">{errorsForm.cui.message}</p>
                        )}
                    </div>

                    {/* Nombres */}
                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombres <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...registerForm('names')}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nombres"
                        />
                        {errorsForm.names && (
                            <p className="text-red-500 text-xs mt-1">{errorsForm.names.message}</p>
                        )}
                    </div>

                    {/* Apellido Paterno */}
                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Apellido Paterno <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...registerForm('paternalSurname')}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Apellido paterno"
                        />
                        {errorsForm.paternalSurname && (
                            <p className="text-red-500 text-xs mt-1">{errorsForm.paternalSurname.message}</p>
                        )}
                    </div>

                    {/* Apellido Materno */}
                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Apellido Materno <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...registerForm('maternalSurname')}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Apellido materno"
                        />
                        {errorsForm.maternalSurname && (
                            <p className="text-red-500 text-xs mt-1">{errorsForm.maternalSurname.message}</p>
                        )}
                    </div>

                    {/* Fecha de Nacimiento */}
                    <div className='mb-0'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fecha Nacimiento <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            {...registerForm('birthdate')}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {errorsForm.birthdate && (
                            <p className="text-red-500 text-xs mt-1">{errorsForm.birthdate.message}</p>
                        )}
                    </div>

                    {/* Sexo */}
                    <div className='mb-0'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sexo <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...registerForm('gender')}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dirección <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...registerForm('address')}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Dirección"
                        />
                        {errorsForm.address && (
                            <p className="text-red-500 text-xs mt-1">{errorsForm.address.message}</p>
                        )}
                    </div>

                    {/* Correo */}
                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correo Electrónico <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            {...registerForm('email')}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="correo@ejemplo.com"
                        />
                        {errorsForm.email && (
                            <p className="text-red-500 text-xs mt-1">{errorsForm.email.message}</p>
                        )}
                    </div>

                    {/* Teléfono */}
                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...registerForm('phone')}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="987654321"
                            maxLength={9}
                        />
                        {errorsForm.phone && (
                            <p className="text-red-500 text-xs mt-1">{errorsForm.phone.message}</p>
                        )}
                    </div>

                    {/* Ubigeo */}
                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ubigeo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...registerForm('ubigeoId')}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="150101"
                            maxLength={6}
                        />
                        {errorsForm.ubigeoId && (
                            <p className="text-red-500 text-xs mt-1">{errorsForm.ubigeoId.message}</p>
                        )}
                    </div>

                    {/* Estado Civil */}
                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado Civil <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...registerForm('maritalStatus')}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                    {/* Selector de Contrayente */}
                    <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prometido al que Respalda <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={testigoNum === 1 ? selectedContrayente1 : selectedContrayente2}
                            onChange={(e) => testigoNum === 1 ? setSelectedContrayente1(e.target.value) : setSelectedContrayente2(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Seleccione un contrayente</option>
                            {formDataAplication.participants
                                .filter((p: Participant) => p.rol === 'contrayente')
                                .map((contrayente: Participant, index: number) => (
                                    <option key={contrayente.cui} value={contrayente.cui}>
                                        {contrayente.names} {contrayente.paternalSurname} - DNI: {contrayente.cui} - Contrayente {index + 1}
                                    </option>
                                ))}
                        </select>
                        {searchError && !(testigoNum === 1 ? selectedContrayente1 : selectedContrayente2) && (
                            <p className="text-red-500 text-xs mt-1">Debe seleccionar un contrayente</p>
                        )}
                    </div>
                </div>

                {/* Botón para agregar testigo */}
                <div className="flex justify-end mt-4">
                    <button
                        type="button"
                        onClick={() => handleAddTestigo(testigoNum)}
                        disabled={isAdded || !(testigoNum === 1 ? selectedContrayente1 : selectedContrayente2)}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <i className="fas fa-user-check"></i>
                        <span>{isAdded ? 'Testigo Agregado' : 'Agregar Testigo'}</span>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 pb-3 border-b border-b-green-300">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-users text-green-600"></i>
                    <span>Datos de los Testigos</span>
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

            {/* Testigo 1 */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-user-check text-green-600"></i>
                    Testigo 1
                </h4>
                {renderTestigoForm(
                    1,
                    register1,
                    errors1,
                    watch1,
                    registerForm1,
                    formErrors1,
                    searchError1,
                    searchSuccess1,
                    testigo1Added
                )}
            </div>

            <div className="border-solid border-b border-b-blue-300"></div>

            {/* Testigo 2 */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-user-check text-green-600"></i>
                    Testigo 2
                </h4>
                {renderTestigoForm(
                    2,
                    register2,
                    errors2,
                    watch2,
                    registerForm2,
                    formErrors2,
                    searchError2,
                    searchSuccess2,
                    testigo2Added
                )}
            </div>

            {/* Tabla de testigos agregados */}
            {showAlert && (<Alert message={alertMessage} type={"warning"} onClose={()=>setShowAlert(false)}/>)}
            {formDataAplication.participants.filter((p: Participant) => p.rol === 'testigo').length > 0 && (
                <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-list text-green-600"></i>
                        Testigos Agregados
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
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Prometido al que Respalda</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Rol</th>
                                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formDataAplication.participants.filter((p: Participant) => p.rol === 'testigo').map((testigo: Participant, index: number) => {
                                    const contrayente = formDataAplication.participants.find(
                                        (p: Participant) => p.cui === testigo.ctry && p.rol === 'contrayente'
                                    );

                                    return (
                                    <tr key={testigo.cui} className="border-t border-gray-200">
                                        <td className="px-4 py-2 text-sm text-gray-700">{testigo.cui}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            {testigo.names} {testigo.paternalSurname} {testigo.maternalSurname}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            {testigo.gender === 'M' ? 'Masculino' : 'Femenino'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{testigo.maritalStatus}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{testigo.email}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            {contrayente ? (
                                                <span className="text-blue-600 font-medium">
                                                    {contrayente.names} {contrayente.paternalSurname}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">No asignado</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                {testigo.rol}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteTestigo(testigo.cui, (index + 1) as 1 | 2)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                title="Eliminar testigo"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Testigo;