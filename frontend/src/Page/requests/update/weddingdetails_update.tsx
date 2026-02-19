
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDetailsApplication } from '../../../hooks/useApplicationDetails.ts';
import { useGetOficiantes } from '../../../hooks/useGetOficiantes.ts';
import { useUpdateWedding } from '../../../hooks/useUpdateWedding.ts';
import { useState } from 'react';

const weddingSchema = z.object({
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  hora: z.string().min(1, 'La hora es obligatoria'),
  direccion: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  oficianteId: z.string().min(1, 'Debe seleccionar un oficiante'),
});

type WeddingFormData = z.infer<typeof weddingSchema>;

const DetallesMatrimonio_update = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const id = (location.state as { id?: string })?.id;
  const applicationId = id ? parseInt(id, 10) : null;

  const { application, loading: loadingDetail } = useDetailsApplication(id);
  const { oficiantes, loading: loadingOficiantes } = useGetOficiantes('oficiante');
  const { updateWedding, isUpdating } = useUpdateWedding();

  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WeddingFormData>({
    resolver: zodResolver(weddingSchema),
    defaultValues: { fecha: '', hora: '', direccion: '', oficianteId: '' },
  });

  useEffect(() => {
    if (!application?.matrimonio) return;
    const m = application.matrimonio;
    setValue('fecha', m.fecha || '', { shouldDirty: true });
    setValue('hora', m.hora || '', { shouldDirty: true });
    setValue('direccion', m.direccion || '', { shouldDirty: true });

    setValue('oficianteId', m.oficiante || '', { shouldDirty: true });

  }, [application]);

  useEffect(() => {
    if (!application?.matrimonio || !oficiantes.length) return;
    const raw = application.matrimonio.oficiante;
    const match = oficiantes.find(o => o.id === raw || o.full_name === raw);
    if (match) setValue('oficianteId', match.id, { shouldDirty: true });
  }, [oficiantes]);

  const onSubmit = (data: WeddingFormData) => {
    if (!applicationId) {
      setAlert({ type: 'error', msg: 'No se encontró el ID de la solicitud' });
      return;
    }
    updateWedding(applicationId, {
      fecha: data.fecha,
      hora: data.hora,
      direccion: data.direccion,
      oficianteId: data.oficianteId,
    })
      .then(res => {
        if (res.status) {
          setAlert({ type: 'success', msg: 'Detalles del matrimonio actualizados correctamente' });
          setTimeout(() => { setAlert(null); navigate(-1); }, 2500);
        } else {
          setAlert({ type: 'error', msg: res.message || 'Error al actualizar' });
        }
      })
      .catch((e: Error) => {
        setAlert({ type: 'error', msg: e.message || 'Error al actualizar' });
      });
  };

  /* ─── Loading ─── */
  if (loadingDetail) {
    return (
      <div className="min-h-screen bg-blue-300/40 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-pink-600"></span>
          <p className="mt-4 text-gray-600 font-medium">Cargando detalles del matrimonio...</p>
        </div>
      </div>
    );
  }

  const matrimonio = application?.matrimonio;
  {/*const contrayentes = application?.participantes.filter(p => p.rol === 'CONTRAYENTE') ?? [];*/}

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
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-ring text-pink-600 text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Actualizar Detalles del Matrimonio</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {application ? `Expediente: ${application.expediente}` : 'Cargando solicitud...'}
              </p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Contrayentes info chips 
            {contrayentes.length > 0 && (
                <div className="bg-pink-50 border border-pink-200 shadow px-6 py-3 flex flex-wrap gap-3">
                    {contrayentes.map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-2 bg-white border border-pink-200 text-pink-700 text-lg px-3 py-1.5 rounded-full shadow-sm">
                            <i className="fas fa-user"></i>
                            <span className="font-semibold">Prometido {i + 1}:</span> {c.nombre} · {c.numero_identificacion}
                        </span>
                    ))}
                </div>
            )}
      */}
      {/* Current wedding summary */}
      {matrimonio && (
        <div className="bg-pink-50 border border-pink-200 shadow px-6 py-3 flex flex-wrap gap-6 text-lg text-pink-800">
          <span><i className="fas fa-calendar mr-1"></i><strong>Fecha actual:</strong> {matrimonio.fecha}</span>
          <span><i className="fas fa-clock mr-1"></i><strong>Hora actual:</strong> {matrimonio.hora}</span>
          <span><i className="fas fa-map-marker-alt mr-1"></i><strong>Lugar actual:</strong> {matrimonio.direccion}</span>
          <span><i className="fas fa-user-tie mr-1"></i><strong>Oficiante actual:</strong> {matrimonio.oficiante}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="bg-white shadow-lg rounded-b-lg p-6">
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-5 space-y-6">

            <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <i className="fas fa-edit text-pink-600"></i> Datos del Acto Matrimonial
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Fecha */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">
                  Fecha del Matrimonio <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('fecha')}
                  className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-pink-500"
                />
                {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha.message}</p>}
              </div>

              {/* Hora */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">
                  Hora del Matrimonio <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  {...register('hora')}
                  className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-pink-500"
                />
                {errors.hora && <p className="text-red-500 text-xs mt-1">{errors.hora.message}</p>}
              </div>

              {/* Oficiante */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-1">
                  Oficiante <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('oficianteId')}
                  disabled={loadingOficiantes}
                  className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingOficiantes ? 'Cargando...' : 'Seleccione un oficiante'}
                  </option>
                  {oficiantes.map(o => (
                    <option key={o.id} value={o.id}>{o.full_name}</option>
                  ))}
                </select>
                {errors.oficianteId && <p className="text-red-500 text-xs mt-1">{errors.oficianteId.message}</p>}
              </div>

              {/* Dirección */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-lg font-medium text-gray-700 mb-1">
                  Lugar / Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('direccion')}
                  placeholder="Av. ejemplo 123, Distrito, Ciudad"
                  className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg bg-white outline-0 focus:ring-2 focus:ring-pink-500"
                />
                {errors.direccion && <p className="text-red-500 text-xs mt-1">{errors.direccion.message}</p>}
              </div>

            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isUpdating}
              className="btn btn-soft btn-secondary border-secondary gap-2"
            >
              <i className="fas fa-times mr-1"></i> Cancelar
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="btn btn-primary gap-2"
            >
              {isUpdating
                ? <><span className="loading loading-spinner loading-sm"></span> Guardando...</>
                : <><i className="fas fa-save mr-1"></i> Guardar Cambios</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DetallesMatrimonio_update;