import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { testigoSchema, type TestigoFormData } from '../../../Validations/validationTestigo.ts';
import { searchTypeDocument } from '../../../Validations/validationSearchTypeDocument.ts';
import { usePersonSearch } from '../../../hooks/usePersonSearch.ts';
import { useDetailsApplication } from '../../../hooks/useApplicationDetails.ts';
import { useUpdateWitnesses } from '../../../hooks/useUpdateWitnesses.ts';
import { useGetParticipants } from '../../../hooks/useGetParticipants.ts';
import type { ParticipanteDetalle } from '../../../model/detailRequestModel.ts';
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

const fillFormFromParticipant = (
    p: ParticipanteDetalle,
    setValue: (field: keyof TestigoFormData, value: any) => void
) => {
    const parts = p.nombre.trim().split(' ');

    const paternalSurname = parts[0] || '';
    const maternalSurname = parts.length >= 2 ? parts[1] : '';
    const names = parts.length >= 3 ? parts.slice(2).join(' ') : '';

    const docTypeMap: Record<string, number> = { DNI: 1, PASAPORTE: 2, CEDULA: 3 };
    setValue('documentTypeId', docTypeMap[p.tipo_identificacion?.toUpperCase()] ?? 1);
    setValue('cui', p.numero_identificacion || '');
    setValue('names', names);
    setValue('paternalSurname', paternalSurname);
    setValue('maternalSurname', maternalSurname);
    setValue('birthdate', p.fecha_nacimiento || '');
    const g = p.sexo === 'M' || p.sexo === 'F' ? p.sexo : undefined;
    if (g) setValue('gender', g);
    setValue('address', p.direccion || '');
    setValue('email', p.correo || '');
    setValue('phone', p.telefono || '');
    setValue('ubigeoId', String(p.ubigeo).padStart(6, '0'));
    setValue('maritalStatus', p.estado_civil as any || undefined);
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
}: WitnessFormBlockProps) => {
    const tipoDoc = watchSearch('documentType');
    const numDoc = watchSearch('documentNumber');

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
        <div className="space-y-4">
            {/* Search bar */}
            <div className="flex flex-col md:flex-row items-start gap-4 mb-2">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de documento</label>
                    <select
                        defaultValue="dni"
                        className="select outline-0 w-full py-2 text-sm border border-gray-300 rounded-lg bg-white px-3 focus:ring-2 focus:ring-indigo-500"
                        {...registerSearch('documentType')}
                    >
                        <option value="dni">DNI</option>
                        <option value="pas">PASAPORTE</option>
                        <option value="ced">CÉDULA</option>
                    </select>
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Documento</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fas fa-search text-gray-400 text-sm"></i>
                        </div>
                        <input
                            type="text"
                            onKeyDown={handleKeyDown}
                            onInput={handleDocInput}
                            placeholder={tipoDoc === 'dni' ? '8 dígitos' : tipoDoc === 'pas' ? 'Pasaporte' : 'Cédula'}
                            maxLength={tipoDoc === 'dni' ? 8 : tipoDoc === 'ced' ? 10 : 20}
                            className={`w-full pl-9 pr-20 py-2 text-sm border rounded-lg outline-0 focus:ring-2 focus:ring-indigo-500 transition-all ${searchSuccess ? 'border-green-500 bg-green-50' : searchError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                            {...registerSearch('documentNumber')}
                        />
                        {numDoc && numDoc.length > 0 && (
                            <button type="button" onClick={onClear}
                                className="absolute inset-y-0 right-12 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                                title="Limpiar">
                                <i className="fas fa-times text-sm"></i>
                            </button>
                        )}
                        <button type="button" onClick={onSearch}
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

            {/* Form grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* CUI */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CUI <span className="text-red-500">*</span></label>
                    <input type="text" {...registerForm('cui')} maxLength={8}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-indigo-500" placeholder="CUI" />
                    {errorsForm.cui && <p className="text-red-500 text-xs mt-1">{errorsForm.cui.message}</p>}
                </div>

                {/* Nombres */}
                <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombres <span className="text-red-500">*</span></label>
                    <input type="text" {...registerForm('names')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-indigo-500" placeholder="Nombres" />
                    {errorsForm.names && <p className="text-red-500 text-xs mt-1">{errorsForm.names.message}</p>}
                </div>

                {/* Ap. Paterno */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno <span className="text-red-500">*</span></label>
                    <input type="text" {...registerForm('paternalSurname')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-indigo-500" placeholder="Apellido paterno" />
                    {errorsForm.paternalSurname && <p className="text-red-500 text-xs mt-1">{errorsForm.paternalSurname.message}</p>}
                </div>

                {/* Ap. Materno */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno <span className="text-red-500">*</span></label>
                    <input type="text" {...registerForm('maternalSurname')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-indigo-500" placeholder="Apellido materno" />
                    {errorsForm.maternalSurname && <p className="text-red-500 text-xs mt-1">{errorsForm.maternalSurname.message}</p>}
                </div>

                {/* Fecha nacimiento */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Nacimiento <span className="text-red-500">*</span></label>
                    <input type="date" {...registerForm('birthdate')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-indigo-500" />
                    {errorsForm.birthdate && <p className="text-red-500 text-xs mt-1">{errorsForm.birthdate.message}</p>}
                </div>

                {/* Sexo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sexo <span className="text-red-500">*</span></label>
                    <select {...registerForm('gender')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-indigo-500">
                        <option value="">Seleccione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </select>
                    {errorsForm.gender && <p className="text-red-500 text-xs mt-1">{errorsForm.gender.message}</p>}
                </div>

                {/* Dirección */}
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección <span className="text-red-500">*</span></label>
                    <input type="text" {...registerForm('address')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-indigo-500" placeholder="Dirección" />
                    {errorsForm.address && <p className="text-red-500 text-xs mt-1">{errorsForm.address.message}</p>}
                </div>

                {/* Correo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
                    <input type="email" {...registerForm('email')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-indigo-500" placeholder="correo@ejemplo.com" />
                    {errorsForm.email && <p className="text-red-500 text-xs mt-1">{errorsForm.email.message}</p>}
                </div>

                {/* Teléfono */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-500">*</span></label>
                    <input type="text" {...registerForm('phone')} maxLength={9}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-indigo-500" placeholder="987654321" />
                    {errorsForm.phone && <p className="text-red-500 text-xs mt-1">{errorsForm.phone.message}</p>}
                </div>

                {/* Ubigeo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubigeo <span className="text-red-500">*</span></label>
                    <input type="text" {...registerForm('ubigeoId')} maxLength={6}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-indigo-500" placeholder="150101" />
                    {errorsForm.ubigeoId && <p className="text-red-500 text-xs mt-1">{errorsForm.ubigeoId.message}</p>}
                </div>

                {/* Estado Civil */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil <span className="text-red-500">*</span></label>
                    <select {...registerForm('maritalStatus')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-indigo-500">
                        <option value="">Seleccione</option>
                        <option value="Single">Soltero(a)</option>
                        <option value="CASADO">Casado(a)</option>
                        <option value="Divorced">Divorciado(a)</option>
                        <option value="Widowed">Viudo(a)</option>
                    </select>
                    {errorsForm.maritalStatus && <p className="text-red-500 text-xs mt-1">{errorsForm.maritalStatus.message}</p>}
                </div>
            </div>
        </div>
    );
};



const Testigos_update = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const id = (location.state as { id?: string })?.id;
    const applicationId = id ? parseInt(id, 10) : null;

    const { application, loading: loadingDetail } = useDetailsApplication(id);
    const { fetchPersonSearch, loading: loadingSearch } = usePersonSearch();
    const { updateWitnesses, isUpdating } = useUpdateWitnesses();
    const { participants, loading: loadingParticipants } = useGetParticipants(applicationId);

    /* Helper: nombre completo de un participante */
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
    const { register: regF1, handleSubmit: hSub1, formState: { errors: fErr1 }, setValue: sVal1, reset: resetF1 } =
        useForm<TestigoFormData>({ resolver: zodResolver(testigoSchema), defaultValues: buildDefaultTestigo() });
    const { register: regF2, handleSubmit: hSub2, formState: { errors: fErr2 }, setValue: sVal2, reset: resetF2 } =
        useForm<TestigoFormData>({ resolver: zodResolver(testigoSchema), defaultValues: buildDefaultTestigo() });

    /* ── UI state ── */
    const [searchErr1, setSearchErr1] = useState('');
    const [searchOk1, setSearchOk1] = useState(false);
    const [searchErr2, setSearchErr2] = useState('');
    const [searchOk2, setSearchOk2] = useState(false);
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    /* Carga de datos de testigos */
    useEffect(() => {
        if (!application) return;
        const testigos = application.participantes.filter(p => p.rol === 'TESTIGO');
        if (testigos[0]) fillFormFromParticipant(testigos[0], sVal1);
        if (testigos[1]) fillFormFromParticipant(testigos[1], sVal2);

    }, [application]);

    /* Search handler */
    const handleSearch = useCallback(async (num: 1 | 2) => {
        const tipoDoc = num === 1 ? watch1('documentType') : watch2('documentType');
        const numDoc = num === 1 ? watch1('documentNumber') : watch2('documentNumber');
        const setErr = num === 1 ? setSearchErr1 : setSearchErr2;
        const setOk = num === 1 ? setSearchOk1 : setSearchOk2;
        const sVal = num === 1 ? sVal1 : sVal2;

        setErr(''); setOk(false);
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
            setOk(true);
            setTimeout(() => setOk(false), 2500);
        } catch (e: any) {
            setErr(e.response?.data?.message || 'Error al buscar persona');
        }
    }, [watch1, watch2, fetchPersonSearch, sVal1, sVal2]);

    /* ── Clear handler ── */
    const handleClear = useCallback((num: 1 | 2) => {
        if (num === 1) { resetSearch1(); resetF1(); setSearchErr1(''); setSearchOk1(false); }
        else { resetSearch2(); resetF2(); setSearchErr2(''); setSearchOk2(false); }
    }, [resetSearch1, resetSearch2, resetF1, resetF2]);

    /* Guardar */
    const handleSave = () => {
        let formOneData: TestigoFormData | null = null;
        let formTwoData: TestigoFormData | null = null;
        let pendingForms = 2;

        const trySubmit = () => {
            if (pendingForms > 0) return;
            if (!formOneData || !formTwoData) return;

            if (!applicationId) {
                setAlert({ type: 'error', msg: 'No se encontró el ID de la solicitud' }); return;
            }

            const witnesses: WitnessUpdatePayload[] = [formOneData, formTwoData].map((d, i) => ({
                documentTypeId: d.documentTypeId,
                cui: d.cui,
                names: d.names,
                paternalSurname: d.paternalSurname,
                maternalSurname: d.maternalSurname,
                birthdate: d.birthdate,
                gender: d.gender,
                address: d.address,
                email: d.email,
                phone: d.phone,
                ubigeoId: parseInt(d.ubigeoId, 10),  // convertir a integer para el backend
                maritalStatus: d.maritalStatus,
                rol: 'testigo',
                ctry: contrayenteDnis[i],
            }));

            updateWitnesses(applicationId, witnesses)
                .then(res => {
                    if (res.status) {
                        setAlert({ type: 'success', msg: 'Testigos actualizados correctamente' });
                        setTimeout(() => { setAlert(null); navigate(-1); }, 2500);
                    } else {
                        setAlert({ type: 'error', msg: res.message || 'Error al actualizar testigos' });
                    }
                })
                .catch((e: any) => {
                    const detail = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Error al actualizar testigos';
                    setAlert({ type: 'error', msg: detail });
                });
        };

        hSub1((data) => { formOneData = data; pendingForms--; trySubmit(); })();
        hSub2((data) => { formTwoData = data; pendingForms--; trySubmit(); })();
    };


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
                        const ctry = i === 0 ? participants?.contrayente1 : participants?.contrayente2;
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
                    />
                </div>

                <div className="border-b border-indigo-200"></div>

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
                        <i className="fas fa-times mr-1"></i> Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="btn bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                    >
                        {isUpdating
                            ? <><span className="loading loading-spinner loading-sm"></span> Guardando...</>
                            : <><i className="fas fa-save mr-1"></i> Guardar Cambios</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Testigos_update;