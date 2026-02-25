import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDetailsApplication } from '../../../hooks/useApplicationDetails.ts';
import { useUpdatePayment } from '../../../hooks/useUpdatePayment.ts';
import { paymentSchema, type PaymentFormData } from '../../../Validations/validationPayment.ts';

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const estadoBadge: Record<string, string> = {
    Pendiente:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    'En Proceso':'bg-blue-100   text-blue-700   border-blue-200',
    Completado:  'bg-green-100  text-green-700  border-green-200',
    Anulado:     'bg-red-100    text-red-700    border-red-200',
};

const Pagos = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = (location.state as { id?: string; paymentId?: string }) || {};
    const applicationId = id ? parseInt(id, 10) : null;

    const { application, loading: loadingDetail } = useDetailsApplication(id);
    const { updatePayment, isUpdating } = useUpdatePayment();

    const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
    const [saved, setSaved] = useState(false);
    const [displayPago, setDisplayPago] = useState<{ estado: string; numero_comprobante: string; fecha_pago: string; pagado: string } | null>(null);
    // Si el pago ya fue realizado (pagado === '1' al cargar), bloquear el formulario
    const [yaFuePagado, setYaFuePagado] = useState(false);

    // Obtener el ID del pago desde application.pago.id
    const paymentId = application?.pago?.id;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: { pagado: '0', estado: 'Pendiente', numero_comprobante: '', fecha_pago: '' },
    });

    const pagadoValue = watch('pagado');

    useEffect(() => {
        if (!application?.pago) return;
        const p = application.pago;
        const esPagado = p.pagado === '1';

        setValue('pagado', (esPagado ? '1' : '0') as '0' | '1', { shouldDirty: true });
        setValue('estado', p.estado || 'Pendiente', { shouldDirty: true });
        setValue('numero_comprobante', p.numero_comprobante || '', { shouldDirty: true });

        // Formatear fecha para el input tipo date (YYYY-MM-DD)
        const fechaPago = p.fecha_pago || '';
        const fechaFormateada = fechaPago ? fechaPago.split(' ')[0] : '';
        setValue('fecha_pago', fechaFormateada, { shouldDirty: true });
        setDisplayPago({
            estado: p.estado || 'Pendiente',
            numero_comprobante: p.numero_comprobante || '',
            fecha_pago: fechaFormateada,
            pagado: esPagado ? '1' : '0',
        });

        // Si ya fue pagado al cargar, bloquear el formulario
        if (esPagado) setYaFuePagado(true);
    }, [application]);

    const onSubmit = (data: PaymentFormData) => {
        if (!paymentId) {
            setAlert({ type: 'error', msg: 'No se encontró el ID del pago' });
            return;
        }

        // Si el pago está marcado como "1" (pagado), cambiar automáticamente el estado a "Completado"
        const estadoFinal = data.pagado === '1' ? 'Completado' : data.estado;

        updatePayment(paymentId, {
            pagado: data.pagado,
            estado: estadoFinal,
            numero_comprobante: data.numero_comprobante || '',
            fecha_pago: data.fecha_pago || '',
        })
            .then(async res => {
                if (!res.status) {
                    setAlert({ type: 'error', msg: res.message || 'Error al actualizar el pago' });
                    return;
                }
                setAlert({ type: 'success', msg: 'Pago actualizado correctamente' });
                setSaved(true);
                setDisplayPago({
                    estado: estadoFinal,
                    numero_comprobante: data.numero_comprobante || '',
                    fecha_pago: data.fecha_pago || '',
                    pagado: data.pagado,
                });
            })
            .catch((e: Error) => {
                setAlert({ type: 'error', msg: e.message || 'Error al actualizar el pago' });
            });
    };

    if (loadingDetail) {
        return (
            <div className="min-h-screen bg-blue-300/40 flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-green-600"></span>
                    <p className="mt-4 text-gray-600 font-medium">Cargando información del pago...</p>
                </div>
            </div>
        );
    }

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
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-credit-card text-green-600 text-xl"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Confirmar y Registrar Pago</h1>
                            <p className="text-gray-500 text-sm mt-0.5">
                                {application ? `Expediente: ${application.expediente}` : 'Cargando solicitud...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current payment summary chips */}
            {displayPago && (
                <div className="bg-green-50 border border-green-200 shadow px-6 py-3 flex flex-wrap items-center gap-4 text-base text-green-800">
                    <span className={`inline-flex items-center gap-1 border px-3 py-1.5 rounded-full font-semibold ${estadoBadge[displayPago.estado] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        <i className="fas fa-tag"></i> {displayPago.estado}
                    </span>
                    <span>
                        <i className="fas fa-receipt mr-1"></i>
                        <strong>Comprobante:</strong> {displayPago.numero_comprobante || '—'}
                    </span>
                    <span>
                        <i className="fas fa-calendar mr-1"></i>
                        <strong>Fecha pago:</strong> {displayPago.fecha_pago || '—'}
                    </span>
                    <span>
                        <i className={`fas ${displayPago.pagado === '1' ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-500'} mr-1`}></i>
                        <strong>Pagado:</strong> {displayPago.pagado === '1' ? 'Sí' : 'No'}
                    </span>
                    <span>
                        <i className="fas fa-dollar-sign mr-1"></i>
                        <strong>Monto:</strong> S/ {application?.precio?.toFixed(2) ?? '—'}
                    </span>
                </div>
            )}

            {/* Banner de pago ya registrado */}
            {yaFuePagado && (
                <div className="flex items-center gap-3 bg-green-100 border border-green-400 rounded-lg px-5 py-3 mt-4 text-green-800 font-medium shadow-sm">
                    <i className="fas fa-lock text-green-600 text-lg"></i>
                    <span>Este pago ya fue <strong>confirmado y registrado</strong>. No se puede modificar.</span>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="bg-white shadow-lg rounded-b-lg p-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-5 space-y-6">

                        <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <i className="fas fa-edit text-green-600"></i> Datos del Pago
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                            {/* Pagado */}
                            <div className="lg:col-span-3">
                                <label className="block text-base font-medium text-gray-700 mb-1">
                                    ¿Pago confirmado? <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('pagado')}
                                    disabled={yaFuePagado}
                                    className={`w-full px-3 py-2 text-base border border-gray-300 rounded-lg outline-0 focus:ring-2 focus:ring-green-500 ${yaFuePagado ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'}`}
                                >
                                    <option value="0">No pagado</option>
                                    <option value="1">Pagado</option>
                                </select>
                                {errors.pagado && <p className="text-red-500 text-xs mt-1">{errors.pagado.message}</p>}
                            </div>

                            {/* Número de Comprobante - Solo habilitado cuando pagado === '1' */}
                            <div className="sm:col-span-2 lg:col-span-1">
                                <label className="block text-base font-medium text-gray-700 mb-1">
                                    N° de Comprobante
                                    {pagadoValue === '1' && <span className="text-red-500"> *</span>}
                                </label>
                                <input
                                    type="text"
                                    {...register('numero_comprobante')}
                                    placeholder="Ej: 001-0000123"
                                    disabled={yaFuePagado || pagadoValue !== '1'}
                                    className={`w-full px-3 py-2 text-base border rounded-lg outline-0 focus:ring-2 focus:ring-green-500 transition-all ${
                                        yaFuePagado || pagadoValue !== '1'
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                            : errors.numero_comprobante 
                                                ? 'border-red-300 bg-red-50' 
                                                : 'border-gray-300 bg-white'
                                    }`}
                                />
                                {errors.numero_comprobante && <p className="text-red-500 text-xs mt-1">{errors.numero_comprobante.message}</p>}
                            </div>

                            {/* Fecha de Pago - Solo habilitado cuando pagado === '1' */}
                            <div className="sm:col-span-2 lg:col-span-2">
                                <label className="block text-base font-medium text-gray-700 mb-1">
                                    Fecha de Pago
                                    {pagadoValue === '1' && <span className="text-red-500"> *</span>}
                                </label>
                                <input
                                    type="date"
                                    max={getTodayStr()}
                                    {...register('fecha_pago')}
                                    disabled={yaFuePagado || pagadoValue !== '1'}
                                    className={`w-full px-3 py-2 text-base border rounded-lg outline-0 focus:ring-2 focus:ring-green-500 transition-all ${
                                        yaFuePagado || pagadoValue !== '1'
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : errors.fecha_pago
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 bg-white'
                                    }`}
                                />
                                {errors.fecha_pago && <p className="text-red-500 text-xs mt-1">{errors.fecha_pago.message}</p>}
                            </div>

                            {/* Evidencia del comprobante */}
                            {/*
                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="block text-base font-medium text-gray-700 mb-1">
                                    Comprobante / Evidencia de Pago
                                    <span className="ml-2 text-xs font-normal text-gray-400">(PDF, JPG, PNG — máx. 5 MB)</span>
                                </label>
                                <div
                                    className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-5 transition-all ${
                                        yaFuePagado
                                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                            : evidenceFile
                                                ? 'border-green-400 bg-green-50 cursor-pointer'
                                                : 'border-gray-300 bg-white hover:border-green-400 hover:bg-green-50 cursor-pointer'
                                    }`}
                                    onClick={() => !yaFuePagado && document.getElementById('evidence-input')?.click()}
                                >
                                    <input
                                        id="evidence-input"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        disabled={yaFuePagado}
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] ?? null;
                                            if (file && file.size > 5 * 1024 * 1024) {
                                                setAlert({ type: 'error', msg: 'El archivo no puede superar los 5 MB' });
                                                return;
                                            }
                                            setEvidenceFile(file);
                                        }}
                                    />
                                    {evidenceFile ? (
                                        <>
                                            <i className="fas fa-file-check text-3xl text-green-500"></i>
                                            <span className="text-sm font-medium text-green-700">{evidenceFile.name}</span>
                                            <span className="text-xs text-gray-400">{(evidenceFile.size / 1024).toFixed(1)} KB</span>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setEvidenceFile(null); }}
                                                className="absolute top-2 right-3 text-gray-400 hover:text-red-500 transition-colors text-sm"
                                                title="Quitar archivo"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-cloud-upload-alt text-3xl text-gray-400"></i>
                                            <span className="text-sm text-gray-500">Haz clic o arrastra el archivo aquí</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            */}

                        </div>

                        {/* Información */}
                        {pagadoValue === '1' && (
                            <div className="flex items-start gap-3 bg-green-100 border border-green-300 rounded-lg p-3 text-base text-green-800">
                                <i className="fas fa-info-circle mt-0.5 text-green-600"></i>
                                <span>Al marcar como <strong>Pagado</strong>, el número de comprobante y la fecha de pago son obligatorios.</span>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            disabled={isUpdating || isUploadingEvidence}
                            className="btn btn-soft btn-secondary border-secondary gap-2"
                        >
                            <i className="fas fa-angle-left mr-1"></i> Volver
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating || isUploadingEvidence || saved || yaFuePagado}
                            className="btn btn-primary text-white gap-2"
                        >
                            {isUpdating
                                ? <><span className="loading loading-spinner loading-sm"></span> Guardando...</>
                                : isUploadingEvidence
                                    ? <><span className="loading loading-spinner loading-sm"></span> Subiendo evidencia...</>
                                    : saved
                                        ? <><i className="fas fa-check-circle mr-1"></i> Cambios Guardados</>
                                        : <><i className="fas fa-save mr-1"></i> Guardar Cambios</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Pagos;
