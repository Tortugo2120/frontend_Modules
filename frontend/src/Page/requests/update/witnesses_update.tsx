import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { testigoSchema, type TestigoFormData } from '../../../Validations/validationTestigo.ts';
import { searchTypeDocument } from '../../../Validations/validationSearchTypeDocument.ts';
import { usePersonSearch } from '../../../hooks/usePersonSearch.ts';
import { useUbigeo } from '../../../hooks/useUbigeo.ts';
import type { UbigeoItem } from '../../../model/ubigeoModel.ts';
import { useDetailsApplication } from '../../../hooks/useApplicationDetails.ts';
import { useUpdateWitnesses } from '../../../hooks/useUpdateWitnesses.ts';
import { useGetParticipants } from '../../../hooks/useGetParticipants.ts';
import type { WitnessUpdatePayload } from '../../../model/witnessModel.ts';
import type { ParticipantItem } from '../../../model/participantsModel.ts';

type InputSearch = z.infer<typeof searchTypeDocument>;

const documentTypeMap: Record<string, number> = { dni: 1, pas: 2, ced: 3 };

const buildDefaultTestigo = (): TestigoFormData => ({
    cui: '',
    documentTypeId: 1,
    names: '',
    paternalSurname: '',
    maternalSurname: '',
    birthdate: '',
    gender: undefined as any,
    address: '',
    email: '',
    phone: '',
    ubigeoId: '',
    maritalStatus: undefined as any,
});

const fillFormFromParticipantItem = (
    p: ParticipantItem,
    setValue: (field: keyof TestigoFormData, value: any) => void
) => {
    setValue('documentTypeId', p.tipoDocumentoId ?? 1);
    setValue('cui', p.numeroDocumento || '');
    setValue('names', p.nombres || '');
    setValue('paternalSurname', p.apellidoPaterno || '');
    setValue('maternalSurname', p.apellidoMaterno || '');
    setValue('birthdate', p.fechaNacimiento || '');
    const g = p.sexo === 'M' || p.sexo === 'F' ? p.sexo : undefined;
    if (g) setValue('gender', g);
    setValue('address', p.direccion || '');
    setValue('email', p.correo || '');
    setValue('phone', p.telefono || '');
    setValue('ubigeoId', p.ubigeo ? String(p.ubigeo.id).padStart(6, '0') : '');
    setValue('maritalStatus', p.estadoCivil as any || undefined);
};

interface WitnessFormBlockProps {
    registerForm: any;
    errorsForm: any;
    searchError: string;
    searchSuccess: boolean;
    loading: boolean;
    registerSearch: any;
    errorsSearch: any;
    watchSearch: (name: string) => any;
    onSearch: () => void;
    onClear: () => void;
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
    onSave: () => void;
    savedIndividual: boolean;
    isUpdating: boolean;
    /* ubigeo */
    ubigeos: UbigeoItem[];
    ubigeoLoading: boolean;
    ubigeoFilter: string;
    setUbigeoFilter: (v: string) => void;
    currentUbigeoId: string;
    onUbigeoSelect: (id: string) => void;
    /* field locking */
    lockedFields: Set<string>;
}

const WitnessFormBlock = ({
    registerForm,
    errorsForm,
    searchError,
    searchSuccess,
    loading,
    registerSearch,
    errorsSearch,
    watchSearch,
    onSearch,
    onClear,
    isOpen,
    setIsOpen,
    onSave,
    savedIndividual,
    isUpdating,
    ubigeos,
    ubigeoLoading,
    ubigeoFilter,
    setUbigeoFilter,
    currentUbigeoId,
    onUbigeoSelect,
    lockedFields,
}: WitnessFormBlockProps) => {
    const tipoDoc = watchSearch('documentType');
    const numDoc = watchSearch('documentNumber');

    const isLocked = (field: string) => lockedFields.has(field);
    const inputCls = (field: string) =>
        `w-full px-3 py-2 text-sm border rounded-lg outline-0 focus:ring-2 focus:ring-indigo-500 transition-all ${
            isLocked(field)
                ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'border-gray-300 bg-white'
        }`;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { e.preventDefault(); onSearch(); }
    };
    const handleDocInput = (e: React.FormEvent<HTMLInputElement>) => {
        if (tipoDoc === 'dni' || tipoDoc === 'ced') {
            const inp = e.currentTarget;
            const numeric = inp.value.replace(/\D/g, '');
            if (inp.value !== numeric) inp.value = numeric;
        }
    };

    return (
        <div className="bg-base-100 border border-indigo-200 rounded-lg overflow-hidden">
            {/* Accordion header */}
            <div
                className="font-semibold bg-indigo-50 p-4 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Chevron */}
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
                <div className="flex flex-col md:flex-row items-start gap-4 relative pr-10">
                    {/* Tipo de documento */}
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de documento</label>
                        <p className="mt-1 text-xs text-gray-500 mb-2 min-h-4">
                            <i className="fas fa-info-circle mr-1"></i>Seleccione el tipo de documento
                        </p>
                        <select
                            defaultValue="dni"
                            className="select outline-0 w-full py-2 text-sm border border-gray-300 rounded-lg bg-white px-3 focus:ring-2 focus:ring-indigo-500"
                            onClick={(e) => e.stopPropagation()}
                            {...registerSearch('documentType')}
                        >
                            <option value="dni">DNI</option>
                            <option value="pas">PASAPORTE</option>
                            <option value="ced">CÉDULA</option>
                        </select>
                    </div>
                    {/* Número de documento */}
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Documento</label>
                        <p className="mt-1 text-xs text-gray-500 mb-2 min-h-4">
                            <i className="fas fa-info-circle mr-1"></i>Ingrese el documento para buscar
                        </p>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-search text-gray-400 text-sm"></i>
                            </div>
                            <input
                                type="text"
                                onKeyDown={handleKeyDown}
                                onInput={handleDocInput}
                                onClick={(e) => e.stopPropagation()}
                                placeholder={tipoDoc === 'dni' ? '8 dígitos' : tipoDoc === 'pas' ? 'Pasaporte' : 'Cédula'}
                                maxLength={tipoDoc === 'dni' ? 8 : tipoDoc === 'ced' ? 10 : 20}
                                className={`w-full pl-9 pr-20 py-2 text-sm border rounded-lg outline-0 focus:ring-2 focus:ring-indigo-500 transition-all ${searchSuccess ? 'border-green-500 bg-green-50' : searchError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                                {...registerSearch('documentNumber')}
                            />
                            {numDoc && numDoc.length > 0 && (
                                <button type="button"
                                    onClick={(e) => { e.stopPropagation(); onClear(); }}
                                    className="absolute inset-y-0 right-12 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                                    title="Limpiar">
                                    <i className="fas fa-times text-sm"></i>
                                </button>
                            )}
                            <button type="button"
                                onClick={(e) => { e.stopPropagation(); onSearch(); }}
                                disabled={!!errorsSearch.documentNumber || !numDoc || numDoc.length === 0}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                title="Buscar">
                                {loading ? <i className="fas fa-spinner fa-spin text-sm"></i> : <i className="fas fa-arrow-right text-sm"></i>}
                            </button>
                        </div>
                        <div className="h-4 mt-1">
                            {errorsSearch.documentNumber && <p className="text-red-500 text-xs">{errorsSearch.documentNumber.message}</p>}
                            {searchError && <p className="text-red-500 text-xs">{searchError}</p>}
                            {searchSuccess && <p className="text-green-600 text-xs"><i className="fas fa-check mr-1"></i>Persona encontrada</p>}
                        </div>
                    </div>
                </div>

            </div>

            {/* Form grid */}
            {isOpen && (
                <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                        {/* CUI */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                CUI <span className="text-red-500">*</span>
                                {isLocked('cui') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                            </label>
                            <input type="text" {...registerForm('cui')} maxLength={8}
                                disabled={isLocked('cui')}
                                className={inputCls('cui')} placeholder="CUI" />
                            {errorsForm.cui && <p className="text-red-500 text-xs mt-1">{errorsForm.cui.message}</p>}
                        </div>

                        {/* Nombres */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                Nombres <span className="text-red-500">*</span>
                                {isLocked('names') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                            </label>
                            <input type="text" {...registerForm('names')}
                                disabled={isLocked('names')}
                                className={inputCls('names')} placeholder="Nombres" />
                            {errorsForm.names && <p className="text-red-500 text-xs mt-1">{errorsForm.names.message}</p>}
                        </div>

                        {/* Ap. Paterno */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                Apellido Paterno <span className="text-red-500">*</span>
                                {isLocked('paternalSurname') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                            </label>
                            <input type="text" {...registerForm('paternalSurname')}
                                disabled={isLocked('paternalSurname')}
                                className={inputCls('paternalSurname')} placeholder="Apellido paterno" />
                            {errorsForm.paternalSurname && <p className="text-red-500 text-xs mt-1">{errorsForm.paternalSurname.message}</p>}
                        </div>

                        {/* Ap. Materno */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                Apellido Materno <span className="text-red-500">*</span>
                                {isLocked('maternalSurname') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                            </label>
                            <input type="text" {...registerForm('maternalSurname')}
                                disabled={isLocked('maternalSurname')}
                                className={inputCls('maternalSurname')} placeholder="Apellido materno" />
                            {errorsForm.maternalSurname && <p className="text-red-500 text-xs mt-1">{errorsForm.maternalSurname.message}</p>}
                        </div>

                        {/* Fecha nacimiento */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                Fecha Nacimiento <span className="text-red-500">*</span>
                                {isLocked('birthdate') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                            </label>
                            <input type="date" {...registerForm('birthdate')}
                                disabled={isLocked('birthdate')}
                                className={inputCls('birthdate')} />
                            {errorsForm.birthdate && <p className="text-red-500 text-xs mt-1">{errorsForm.birthdate.message}</p>}
                        </div>

                        {/* Sexo */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                Sexo <span className="text-red-500">*</span>
                                {isLocked('gender') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                            </label>
                            <select {...registerForm('gender')}
                                disabled={isLocked('gender')}
                                className={inputCls('gender')}>
                                <option value="">Seleccione</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                            {errorsForm.gender && <p className="text-red-500 text-xs mt-1">{errorsForm.gender.message}</p>}
                        </div>

                        {/* Dirección */}
                        <div className="sm:col-span-2">
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                Dirección <span className="text-red-500">*</span>
                                {isLocked('address') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                            </label>
                            <input type="text" {...registerForm('address')}
                                disabled={isLocked('address')}
                                className={inputCls('address')} placeholder="Dirección" />
                            {errorsForm.address && <p className="text-red-500 text-xs mt-1">{errorsForm.address.message}</p>}
                        </div>

                        {/* Correo */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                Correo Electrónico <span className="text-red-500">*</span>
                                {isLocked('email') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                            </label>
                            <input type="email" {...registerForm('email')}
                                disabled={isLocked('email')}
                                className={inputCls('email')} placeholder="correo@ejemplo.com" />
                            {errorsForm.email && <p className="text-red-500 text-xs mt-1">{errorsForm.email.message}</p>}
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 mt-2.5">
                                Teléfono <span className="text-red-500">*</span>
                                {isLocked('phone') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                            </label>
                            <input type="text" {...registerForm('phone')} maxLength={9}
                                disabled={isLocked('phone')}
                                className={inputCls('phone')} placeholder="987654321" />
                            {errorsForm.phone && <p className="text-red-500 text-xs mt-1">{errorsForm.phone.message}</p>}
                        </div>

                        {/* Ubigeo */}
                        <div>
                            {ubigeoLoading ? (
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
                                                className={`w-full pl-7 pr-3 py-1.5 text-xs border rounded-lg outline-0 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                                                    isLocked('ubigeoId') ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300 bg-white'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                    {/* Código de ubigeo */}
                                    <p className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-0">
                                        {currentUbigeoId
                                            ? <span>{currentUbigeoId}</span>
                                            : <span className="text-gray-300">Código: —</span>
                                        }
                                    </p>
                                    {ubigeoFilter.trim().length > 0 && (() => {
                                        const filtered = ubigeos.filter(u => {
                                            const text = `${u.departamento} ${u.provincia} ${u.distrito}`.toLowerCase();
                                            return text.includes(ubigeoFilter.toLowerCase());
                                        });
                                        return (
                                            <ul className="w-full max-h-40 overflow-y-auto border border-indigo-300 rounded-lg bg-white shadow-md text-xs divide-y divide-gray-100">
                                                {filtered.length === 0 ? (
                                                    <li className="px-3 py-2 text-gray-400 italic">Sin resultados</li>
                                                ) : filtered.map(u => (
                                                    <li
                                                        key={u.id}
                                                        onMouseDown={() => {
                                                            onUbigeoSelect(u.id);
                                                            setUbigeoFilter('');
                                                        }}
                                                        className={`px-3 py-2 cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition-colors ${currentUbigeoId === u.id ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-700'}`}
                                                    >
                                                        {u.departamento}, {u.provincia}, {u.distrito}
                                                    </li>
                                                ))}
                                            </ul>
                                        );
                                    })()}
                                    {(() => {
                                        const selectedLabel = ubigeos.find(u => u.id === currentUbigeoId);
                                        return selectedLabel && ubigeoFilter.trim().length === 0 ? (
                                            <p className="text-xs text-indigo-600 font-medium">
                                                <i className="fas fa-map-marker-alt mr-1"></i>
                                                {selectedLabel.departamento}, {selectedLabel.provincia}, {selectedLabel.distrito}
                                            </p>
                                        ) : null;
                                    })()}
                                </div>
                            )}
                            {errorsForm.ubigeoId && <p className="text-red-500 text-xs mt-1">{errorsForm.ubigeoId.message}</p>}
                        </div>

                        {/* Estado Civil */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 mt-2.5">
                                Estado Civil <span className="text-red-500">*</span>
                                {isLocked('maritalStatus') && <i className="fas fa-lock text-gray-400 text-xs"></i>}
                            </label>
                            <select {...registerForm('maritalStatus')}
                                disabled={isLocked('maritalStatus')}
                                className={inputCls('maritalStatus')}>
                                <option value="">Seleccione</option>
                                <option value="Soltero">Soltero(a)</option>
                                <option value="Casado">Casado(a)</option>
                                <option value="Divorciado">Divorciado(a)</option>
                                <option value="Viudo">Viudo(a)</option>
                            </select>
                            {errorsForm.maritalStatus && <p className="text-red-500 text-xs mt-1">{errorsForm.maritalStatus.message}</p>}
                        </div>
                    </div>

                    {/* Botones del formulario */}
                    <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClear}
                            disabled={isUpdating || savedIndividual}
                            className="btn btn-soft btn-secondary border-secondary gap-2"
                        >
                            <i className="fas fa-eraser mr-1"></i> Limpiar Campos
                        </button>
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={isUpdating || savedIndividual}
                            className="btn bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                        >
                            {isUpdating
                                ? <><span className="loading loading-spinner loading-sm"></span> Guardando...</>
                                : savedIndividual
                                    ? <><i className="fas fa-check-circle mr-1"></i> Guardado</>
                                    : <><i className="fas fa-save mr-1"></i> Guardar</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};



const Testigos_update = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const id = (location.state as { id?: string })?.id;
    const applicationId = id ? parseInt(id, 10) : null;

    const { application, loading: loadingDetail, refetch: refetchApplication } = useDetailsApplication(id);
    const { fetchPersonSearch, loading: loadingSearch } = usePersonSearch();
    const { updateWitnesses, isUpdating } = useUpdateWitnesses();
    const { participants, loading: loadingParticipants } = useGetParticipants(applicationId);

    /* nombre completo de un participante */
    const fullName = (p: ParticipantItem) =>
        `${p.nombres} ${p.apellidoPaterno} ${p.apellidoMaterno}`.trim();

    /* DNIs de los contrayentes, disponibles para handleSave */
    const contrayenteDnis = [
        participants?.contrayente1?.numeroDocumento ?? '',
        participants?.contrayente2?.numeroDocumento ?? '',
    ];

    /* ── Search forms ── */
    const { register: reg1, watch: watch1, formState: { errors: errs1 }, reset: resetSearch1 } =
        useForm<InputSearch>({ resolver: zodResolver(searchTypeDocument), defaultValues: { documentType: 'dni', documentNumber: '' } });
    const { register: reg2, watch: watch2, formState: { errors: errs2 }, reset: resetSearch2 } =
        useForm<InputSearch>({ resolver: zodResolver(searchTypeDocument), defaultValues: { documentType: 'dni', documentNumber: '' } });

    /* ── Data forms ── */
    const { register: regF1, handleSubmit: hSub1, formState: { errors: fErr1 }, setValue: sVal1, reset: resetF1, watch: wVal1 } =
        useForm<TestigoFormData>({ resolver: zodResolver(testigoSchema), defaultValues: buildDefaultTestigo() });
    const { register: regF2, handleSubmit: hSub2, formState: { errors: fErr2 }, setValue: sVal2, reset: resetF2, watch: wVal2 } =
        useForm<TestigoFormData>({ resolver: zodResolver(testigoSchema), defaultValues: buildDefaultTestigo() });

    /* ── UI state ── */
    const [searchErr1, setSearchErr1] = useState('');
    const [searchOk1, setSearchOk1] = useState(false);
    const [searchErr2, setSearchErr2] = useState('');
    const [searchOk2, setSearchOk2] = useState(false);
    const [open1, setOpen1] = useState(false);
    const [open2, setOpen2] = useState(false);

    const [saved1, setSaved1] = useState(false);
    const [saved2, setSaved2] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    /* Ubigeo */
    const { ubigeos, loading: ubigeoLoading } = useUbigeo();
    const [ubigeoFilter1, setUbigeoFilter1] = useState('');
    const [ubigeoFilter2, setUbigeoFilter2] = useState('');

    /* Campos bloqueados */
    const [lockedFields1, setLockedFields1] = useState<Set<string>>(new Set());
    const [lockedFields2, setLockedFields2] = useState<Set<string>>(new Set());

    /* Carga de datos de testigos usando la asociación correcta contrayente ↔ testigo */
    useEffect(() => {
        if (!participants) return;
        const t1 = participants.contrayente1?.testigo;
        const t2 = participants.contrayente2?.testigo;
        if (t1) { fillFormFromParticipantItem(t1, sVal1); setOpen1(true); }
        if (t2) { fillFormFromParticipantItem(t2, sVal2); setOpen2(true); }
    }, [participants]);

    const handleSearch = useCallback(async (num: 1 | 2) => {
        const tipoDoc = num === 1 ? watch1('documentType') : watch2('documentType');
        const numDoc = num === 1 ? watch1('documentNumber') : watch2('documentNumber');
        const setErr = num === 1 ? setSearchErr1 : setSearchErr2;
        const setOk = num === 1 ? setSearchOk1 : setSearchOk2;
        const sVal = num === 1 ? sVal1 : sVal2;

        setErr(''); setOk(false);

        // Validar que el documento buscado no pertenezca a uno de los contrayentes
        if (numDoc && contrayenteDnis.includes(numDoc)) {
            setErr('Esta persona es uno de los contrayentes y no puede ser registrada como testigo');
            return;
        }

        try {
            const docTypeNum = documentTypeMap[tipoDoc] ?? 1;
            const response = await fetchPersonSearch(numDoc, docTypeNum);
            if (!response?.status || !response.data) {
                setErr('No se encontró ninguna persona con ese documento'); return;
            }
            const d = response.data;
            const validGender = d.gender === 'M' || d.gender === 'F' ? d.gender as 'M' | 'F' : undefined;
            sVal('cui', numDoc);
            sVal('documentTypeId', docTypeNum);
            sVal('names', d.name || '');
            sVal('paternalSurname', d.paternalSurname || '');
            sVal('maternalSurname', d.maternalSurname || '');
            sVal('birthdate', d.birthdate || '');
            if (validGender) sVal('gender', validGender);
            sVal('address', d.address || '');
            sVal('email', d.email || '');
            sVal('phone', d.phone || '');
            sVal('ubigeoId', d.ubigeoId || '');
            if (d.maritalStatus) sVal('maritalStatus', d.maritalStatus as any);

            // Bloquear campos que la API proporcionó con valor
            const locked = new Set<string>();
            locked.add('cui');
            if (d.name)            locked.add('names');
            if (d.paternalSurname) locked.add('paternalSurname');
            if (d.maternalSurname) locked.add('maternalSurname');
            if (d.birthdate)       locked.add('birthdate');
            if (validGender)       locked.add('gender');
            if (d.address)         locked.add('address');
            if (d.email)           locked.add('email');
            if (d.phone)           locked.add('phone');
            if (d.ubigeoId)        locked.add('ubigeoId');
            if (d.maritalStatus)   locked.add('maritalStatus');
            if (num === 1) setLockedFields1(locked); else setLockedFields2(locked);

            setOk(true);
            if (num === 1) setOpen1(true); else setOpen2(true);
            setTimeout(() => setOk(false), 2500);
        } catch (e: any) {
            setErr(e.response?.data?.message || 'Error al buscar persona');
        }
    }, [watch1, watch2, fetchPersonSearch, sVal1, sVal2, contrayenteDnis]);

    /* ── Clear handler ── */
    const handleClear = useCallback((num: 1 | 2) => {
        if (num === 1) {
            resetSearch1(); resetF1(); setSearchErr1(''); setSearchOk1(false); setSaved1(false);
            setLockedFields1(new Set()); setUbigeoFilter1('');
        } else {
            resetSearch2(); resetF2(); setSearchErr2(''); setSearchOk2(false); setSaved2(false);
            setLockedFields2(new Set()); setUbigeoFilter2('');
        }
    }, [resetSearch1, resetSearch2, resetF1, resetF2]);

    /* ── Individual save handlers ── */
    const handleSave1 = useCallback(() => {
        hSub1((data) => {
            if (!applicationId) { setAlert({ type: 'error', msg: 'No se encontró el ID de la solicitud' }); return; }
            const witnesses: WitnessUpdatePayload[] = [{
                documentTypeId: data.documentTypeId,
                cui: data.cui,
                names: data.names,
                paternalSurname: data.paternalSurname,
                maternalSurname: data.maternalSurname,
                birthdate: data.birthdate,
                gender: data.gender,
                address: data.address,
                email: data.email,
                phone: data.phone,
                ubigeoId: data.ubigeoId,
                maritalStatus: data.maritalStatus,
                rol: 'testigo',
                ctry: contrayenteDnis[0],
            }];
            updateWitnesses(applicationId, witnesses)
                .then(res => {
                    if (res.status) {
                        setAlert({ type: 'success', msg: 'Testigo 1 actualizado correctamente' });
                        setSaved1(true);
                        refetchApplication();
                    } else {
                        setAlert({ type: 'error', msg: res.message || 'Error al actualizar testigo' });
                    }
                })
                .catch((e: any) => {
                    const detail = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Error al actualizar testigo';
                    setAlert({ type: 'error', msg: detail });
                });
        })();
    }, [hSub1, applicationId, contrayenteDnis, updateWitnesses, refetchApplication]);

    const handleSave2 = useCallback(() => {
        hSub2((data) => {
            if (!applicationId) { setAlert({ type: 'error', msg: 'No se encontró el ID de la solicitud' }); return; }
            const witnesses: WitnessUpdatePayload[] = [{
                documentTypeId: data.documentTypeId,
                cui: data.cui,
                names: data.names,
                paternalSurname: data.paternalSurname,
                maternalSurname: data.maternalSurname,
                birthdate: data.birthdate,
                gender: data.gender,
                address: data.address,
                email: data.email,
                phone: data.phone,
                ubigeoId: data.ubigeoId,
                maritalStatus: data.maritalStatus,
                rol: 'testigo',
                ctry: contrayenteDnis[1],
            }];
            updateWitnesses(applicationId, witnesses)
                .then(res => {
                    if (res.status) {
                        setAlert({ type: 'success', msg: 'Testigo 2 actualizado correctamente' });
                        setSaved2(true);
                        refetchApplication();
                    } else {
                        setAlert({ type: 'error', msg: res.message || 'Error al actualizar testigo' });
                    }
                })
                .catch((e: any) => {
                    const detail = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Error al actualizar testigo';
                    setAlert({ type: 'error', msg: detail });
                });
        })();
    }, [hSub2, applicationId, contrayenteDnis, updateWitnesses, refetchApplication]);

    


    if (loadingDetail || loadingParticipants) {
        return (
            <div className="min-h-screen bg-blue-300/40 flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                    <p className="mt-4 text-gray-600 font-medium">Cargando testigos...</p>
                </div>
            </div>
        );
    }

    const testigos = application?.participantes.filter(p => p.rol === 'TESTIGO') ?? [];

    return (
        <div className="min-h-screen bg-blue-300/40 p-4 sm:p-6">

            {/* Alert toast */}
            {alert && (
                <div className="fixed top-4 right-4 z-50">
                    <div className={`alert shadow-lg ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xl`}></i>
                        <span>{alert.msg}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-t-lg shadow-lg p-6 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-users text-indigo-600 text-xl"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Actualizar Testigos</h1>
                            <p className="text-gray-500 text-sm mt-0.5">
                                {application ? `Expediente: ${application.expediente}` : 'Cargando solicitud...'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => navigate(-1)} className="btn btn-soft btn-secondary border-secondary gap-2">
                        <i className="fas fa-times mr-1"></i> Cerrar
                    </button>
                </div>
            </div>

            {/* Info chips */}
            {testigos.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-none shadow px-6 py-3 flex flex-wrap gap-3">
                    {testigos.map((t, i) => {
                        const ctry = i === 0 ? participants?.contrayente2 : participants?.contrayente1;
                        return (
                            <span key={i} className="inline-flex items-center gap-2 bg-white border border-indigo-200 text-indigo-700 text-xs px-3 py-1.5 rounded-full shadow-sm">
                                <i className="fas fa-user-check"></i>
                                <span className="font-semibold">
                                    {ctry ? `Testigo de ${fullName(ctry)}` : `Testigo ${i + 1}`}:
                                </span>{t.nombre} · {t.numero_identificacion}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Forms */}
            <div className="bg-white shadow-lg rounded-b-lg p-6 space-y-8">

                {/* Testigo 2 */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                    <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-user-check text-indigo-600"></i>
                        {participants?.contrayente2 ? `Testigo de ${fullName(participants.contrayente2)}` : 'Testigo 2'}
                    </h4>
                    <WitnessFormBlock
                        registerForm={regF2} errorsForm={fErr2}
                        searchError={searchErr2} searchSuccess={searchOk2}
                        loading={loadingSearch}
                        registerSearch={reg2} errorsSearch={errs2} watchSearch={watch2}
                        onSearch={() => handleSearch(2)}
                        onClear={() => handleClear(2)}
                        isOpen={open2} setIsOpen={setOpen2}
                        onSave={handleSave2}
                        savedIndividual={saved2}
                        isUpdating={isUpdating}
                        ubigeos={ubigeos}
                        ubigeoLoading={ubigeoLoading}
                        ubigeoFilter={ubigeoFilter2}
                        setUbigeoFilter={setUbigeoFilter2}
                        currentUbigeoId={wVal2('ubigeoId') ?? ''}
                        onUbigeoSelect={(id) => sVal2('ubigeoId', id)}
                        lockedFields={lockedFields2}
                    />
                </div>

                {/* Testigo 1 */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                    <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-user-check text-indigo-600"></i>
                        {participants?.contrayente1 ? `Testigo de ${fullName(participants.contrayente1)}` : 'Testigo 1'}
                    </h4>
                    <WitnessFormBlock
                        registerForm={regF1} errorsForm={fErr1}
                        searchError={searchErr1} searchSuccess={searchOk1}
                        loading={loadingSearch}
                        registerSearch={reg1} errorsSearch={errs1} watchSearch={watch1}
                        onSearch={() => handleSearch(1)}
                        onClear={() => handleClear(1)}
                        isOpen={open1} setIsOpen={setOpen1}
                        onSave={handleSave1}
                        savedIndividual={saved1}
                        isUpdating={isUpdating}
                        ubigeos={ubigeos}
                        ubigeoLoading={ubigeoLoading}
                        ubigeoFilter={ubigeoFilter1}
                        setUbigeoFilter={setUbigeoFilter1}
                        currentUbigeoId={wVal1('ubigeoId') ?? ''}
                        onUbigeoSelect={(id) => sVal1('ubigeoId', id)}
                        lockedFields={lockedFields1}
                    />
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        disabled={isUpdating}
                        className="btn btn-soft btn-secondary border-secondary gap-2"
                    >
                        <i className="fas fa-angle-left mr-1"></i> Volver
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Testigos_update;