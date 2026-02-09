import { useState, useCallback, useEffect } from 'react';
import { usePersonSearch } from '../../../../hooks/usePersonSearch';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchTypeDocument } from "../../../../Validations/validationSearchTypeDocument.ts";
import { contrayenteSchema, type ContrayenteFormData } from '../../../../Validations/validationContrayente.ts';
import { useApplicationContext } from '../../../../context/ApplicationContext.tsx';
import { z } from "zod";
import type { Participant } from "../../../../model/aplicationModel.ts";

interface Solicitud {
    tipoSolicitudNombre?: string;
    onContrayentesChange?: (contrayentes: Participant[]) => void;
}

type inputSearch = z.infer<typeof searchTypeDocument>;

const Contrayente = (props: Solicitud) => {
    const { tipoSolicitudNombre, onContrayentesChange } = props;
    const { addParticipant, deleteParticipant, formDataAplication } = useApplicationContext();

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
        reset: resetForm1
    } = useForm<ContrayenteFormData>({
        resolver: zodResolver(contrayenteSchema),
        defaultValues: {
            dni: '',
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
        reset: resetForm2
    } = useForm<ContrayenteFormData>({
        resolver: zodResolver(contrayenteSchema),
        defaultValues: {
            dni: '',
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

    // Sincronizar con el estado global del contexto
    useEffect(() => {
        const contrayentes = formDataAplication.participants.filter((p: Participant) =>
            p.roles.includes('contrayente')
        );
        setContrayente1Added(contrayentes.length >= 1);
        setContrayente2Added(contrayentes.length >= 2);

        if (onContrayentesChange) {
            onContrayentesChange(contrayentes);
        }
    }, [formDataAplication.participants, onContrayentesChange]);

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
            setValueForm('dni', numDoc);
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
    }, [resetForm1, resetForm2, resetSearch1, resetSearch2]);

    // Función para agregar contrayente al contexto
    const handleAddContrayente = useCallback((contrayenteNum: 1 | 2) => {
        const handleSubmit = contrayenteNum === 1 ? handleSubmitForm1 : handleSubmitForm2;
        const setAdded = contrayenteNum === 1 ? setContrayente1Added : setContrayente2Added;
        const setError = contrayenteNum === 1 ? setSearchError1 : setSearchError2;

        handleSubmit((data: ContrayenteFormData) => {
            // Verificar si ya existe como contrayente
            const isDuplicateContrayente = formDataAplication.participants.some((p: Participant) =>
                p.dni === data.dni && p.roles.includes('contrayente')
            );

            if (isDuplicateContrayente) {
                setError('Este DNI ya ha sido agregado como contrayente');
                return;
            }

            // Agregar como contrayente (puede tener otros roles también)
            addParticipant({ ...data, rol: 'contrayente' });
            setAdded(true);
            setError('');
        })();
    }, [handleSubmitForm1, handleSubmitForm2, addParticipant, formDataAplication.participants]);

    // Función para eliminar contrayente
    const handleDeleteContrayente = useCallback((dni: string, contrayenteNum: 1 | 2) => {
        // Solo eliminar el rol de 'contrayente', no todo el participante
        deleteParticipant(dni, 'contrayente');

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
                                className={`w-full pl-9 sm:pl-11 pr-20 sm:pr-24 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all ${
                                    searchSuccess
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
                                    onClick={() => handleClearSearch(contrayenteNum)}
                                    className="absolute inset-y-0 right-12 sm:right-16 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Limpiar"
                                >
                                    <i className="fas fa-times text-sm"></i>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleSearchContrayente(contrayenteNum)}
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
                </div>

                {/* Formulario de datos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* DNI */}
                    <div className='mb-0'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            DNI <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...registerForm('dni')}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="DNI"
                            maxLength={8}
                        />
                        {errorsForm.dni && (
                            <p className="text-red-500 text-xs mt-1">{errorsForm.dni.message}</p>
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
                            <option value="Single">Soltero(a)</option>
                            <option value="CASADO">Casado(a)</option>
                            <option value="Divorced">Divorciado(a)</option>
                            <option value="VIUDO">Viudo(a)</option>
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
                        disabled={isAdded}
                        className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <i className="fas fa-plus-circle"></i>
                        <span>{isAdded ? 'Contrayente Agregado' : 'Agregar Contrayente'}</span>
                    </button>
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
                {renderContrayenteForm(
                    1,
                    register1,
                    errors1,
                    watch1,
                    registerForm1,
                    formErrors1,
                    searchError1,
                    searchSuccess1,
                    contrayente1Added
                )}
            </div>

            <div className="border-solid border-b border-b-blue-300"></div>

            {/* Contrayente 2 */}
            <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-user-circle text-pink-600"></i>
                    Contrayente 2
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
                    contrayente2Added
                )}
            </div>

            {/* Tabla de contrayentes agregados */}
            {formDataAplication.participants.filter((p: Participant) => p.roles.includes('contrayente')).length > 0 && (
                <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-list text-blue-600"></i>
                        Contrayentes Agregados
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">DNI</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Nombres Completos</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Sexo</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Email</th>
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Roles</th>
                                    <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formDataAplication.participants.filter((p: Participant) => p.roles.includes('contrayente')).map((contrayente: Participant, index: number) => (
                                    <tr key={contrayente.dni} className="border-t border-gray-200">
                                        <td className="px-4 py-2 text-sm text-gray-700">{contrayente.dni}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            {contrayente.names} {contrayente.paternalSurname} {contrayente.maternalSurname}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            {contrayente.gender === 'M' ? 'Masculino' : 'Femenino'}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{contrayente.email}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">
                                            <div className="flex flex-wrap gap-1">
                                                {contrayente.roles.map((rol) => (
                                                    <span
                                                        key={rol}
                                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                    >
                                                        {rol}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteContrayente(contrayente.dni, (index + 1) as 1 | 2)}
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