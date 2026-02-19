import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDetailsApplication } from '../../../hooks/useApplicationDetails.ts';
import { useUpdatePayment } from '../../../hooks/useUpdatePayment.ts';
import { uploadPaymentEvidence } from '../../../services/PaymentUpdateService.ts';
import { paymentSchema, type PaymentFormData } from '../../../Validations/validationPayment.ts';

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
        setValue('pagado', (p.pagado === '1' ? '1' : '0') as '0' | '1', { shouldDirty: true });
        setValue('estado', p.estado || 'Pendiente', { shouldDirty: true });
        setValue('numero_comprobante', p.numero_comprobante || '', { shouldDirty: true });

        // Formatear fecha para el input tipo date (YYYY-MM-DD)
        const fechaPago = p.fecha_pago || '';
        const fechaFormateada = fechaPago ? fechaPago.split(' ')[0] : '';
        setValue('fecha_pago', fechaFormateada, { shouldDirty: true });
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
                // Upload evidence file if provided
                if (evidenceFile && applicationId) {
                    setIsUploadingEvidence(true);
                    try {
                        await uploadPaymentEvidence(applicationId as number, evidenceFile);
                    } catch (e: unknown) {
                        const error = e as Error;
                        setAlert({ type: 'error', msg: error.message || 'Pago guardado, pero no se pudo subir la evidencia' });
                        setIsUploadingEvidence(false);
                        return;
                    }
                    setIsUploadingEvidence(false);
                }
                setAlert({ type: 'success', msg: 'Pago actualizado correctamente' });
                setTimeout(() => { setAlert(null); navigate(-1); }, 2500);
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

    const pago = application?.pago;
    const estadoActual = pago?.estado || '—';

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
            {pago && (
                <div className="bg-green-50 border border-green-200 shadow px-6 py-3 flex flex-wrap items-center gap-4 text-base text-green-800">
                    <span className={`inline-flex items-center gap-1 border px-3 py-1.5 rounded-full font-semibold ${estadoBadge[estadoActual] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        <i className="fas fa-tag"></i> {estadoActual}
                    </span>
                    <span>
                        <i className="fas fa-receipt mr-1"></i>
                        <strong>Comprobante:</strong> {pago.numero_comprobante || '—'}
                    </span>
                    <span>
                        <i className="fas fa-calendar mr-1"></i>
                        <strong>Fecha pago:</strong> {pago.fecha_pago || '—'}
                    </span>
                    <span>
                        <i className={`fas ${pago.pagado === '1' ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-500'} mr-1`}></i>
                        <strong>Pagado:</strong> {pago.pagado === '1' ? 'Sí' : 'No'}
                    </span>
                    <span>
                        <i className="fas fa-dollar-sign mr-1"></i>
                        <strong>Monto:</strong> S/ {application?.precio?.toFixed(2) ?? '—'}
                    </span>
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
                                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-green-500"
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
                                    disabled={pagadoValue !== '1'}
                                    className={`w-full px-3 py-2 text-base border rounded-lg outline-0 focus:ring-2 focus:ring-green-500 transition-all ${
                                        pagadoValue !== '1' 
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
                                    {...register('fecha_pago')}
                                    disabled={pagadoValue !== '1'}
                                    className={`w-full px-3 py-2 text-base border rounded-lg outline-0 focus:ring-2 focus:ring-green-500 transition-all ${
                                        pagadoValue !== '1'
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : errors.fecha_pago
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-300 bg-white'
                                    }`}
                                />
                                {errors.fecha_pago && <p className="text-red-500 text-xs mt-1">{errors.fecha_pago.message}</p>}
                            </div>

                            {/* Evidencia del comprobante */}
                            <div className="sm:col-span-2 lg:col-span-3">
                                <label className="block text-base font-medium text-gray-700 mb-1">
                                    Comprobante / Evidencia de Pago
                                    <span className="ml-2 text-xs font-normal text-gray-400">(PDF, JPG, PNG — máx. 5 MB)</span>
                                </label>
                                <div
                                    className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-5 cursor-pointer transition-all ${
                                        evidenceFile
                                            ? 'border-green-400 bg-green-50'
                                            : 'border-gray-300 bg-white hover:border-green-400 hover:bg-green-50'
                                    }`}
                                    onClick={() => document.getElementById('evidence-input')?.click()}
                                >
                                    <input
                                        id="evidence-input"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
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
                            <i className="fas fa-times mr-1"></i> Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating || isUploadingEvidence}
                            className="btn btn-primary text-white gap-2"
                        >
                            {isUpdating
                                ? <><span className="loading loading-spinner loading-sm"></span> Guardando...</>
                                : isUploadingEvidence
                                    ? <><span className="loading loading-spinner loading-sm"></span> Subiendo evidencia...</>
                                    : <><i className="fas fa-save mr-1"></i> Guardar Cambios</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Pagos;
