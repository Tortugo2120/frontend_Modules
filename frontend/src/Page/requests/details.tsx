import { useParams, useNavigate } from "react-router-dom";
import { useDetailsApplication } from "../../hooks/useApplicationDetails";
import { ExportApplicationById } from "../../services/AplicationServices";
import { useState } from "react";

export const Detalles = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { application, loading, error } = useDetailsApplication(id);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!id) return;
    setIsExporting(true);
    try {
      await ExportApplicationById(parseInt(id, 10));
      // Opcional: mostrar una notificación de éxito
    } catch (exportError) {
      // Opcional: mostrar una notificación de error
      console.error(exportError);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <div className="min-h-screen font-bold text-xl flex flex-col items-center justify-center">
    <span className="loading loading-dots loading-xl text-indigo-800"></span>
    Cargando detalles...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
  if (!application) return null;

  const contrayentes = application.participantes.filter(p => p.rol === "CONTRAYENTE");
  const testigos = application.participantes.filter(p => p.rol === "TESTIGO");

  return (
    <div className="min-h-screen bg-blue-300/40 p-2 md:p-2">
      <div className="flex justify-between items-center mx-4 mb-4 sticky top-20 z-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-info-content font-semibold rounded shadow hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <span>←</span> Volver
        </button>
      </div>
      <div className="max-w-5xl mx-auto bg-white shadow-lg">
        {/* Header */}
        <div className="bg-info-content text-white p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-info-content font-bold text-xl">JLO</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold">MUNICIPALIDAD</h1>
              <h2 className="text-xl">José Leonardo Ortiz</h2>
            </div>
          </div>
          <h3 className="text-lg font-semibold mt-2">Registro Civil - {application.nombreSolicitud}</h3>
        </div>

        {/* Contenido principal */}
        <div className="p-6 md:p-8">
          {/* DATOS GENERALES */}
          <section className="mb-8">
            <div className="bg-info-content text-white px-4 py-2 mb-4">
              <h2 className="text-lg font-bold">DATOS GENERALES DE LA SOLICITUD</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-gray-700">Nro. Expediente:</span>
                <span>{application.expediente}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-gray-700">Tipo de Solicitud:</span>
                <span className="bg-blue-100 px-2">{application.nombreSolicitud}</span>
              </div>
              <div className="md:col-span-2 flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-gray-700">Descripción:</span>
                <span>{application.descripcionSolicitud}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-gray-700">Precio:</span>
                <span>S/ {application.precio.toFixed(2)}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-gray-700">Estado:</span>
                <span className="bg-blue-100 px-2">{application.estado}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-gray-700">Encargado:</span>
                <span>{application.encargado}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-gray-700">Fecha de Inicio:</span>
                <span>{new Date(application.fechaInicio).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-gray-700">Fecha de Fin:</span>
                <span>{application.fechaFin ? new Date(application.fechaFin).toLocaleDateString() : "-"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-gray-700">Última Actualización:</span>
                <span>{new Date(application.fechaActualizacion).toLocaleDateString()}</span>
              </div>
            </div>
          </section>

          {/* CONTRAYENTES DINÁMICOS */}
          <section className="mb-8">
            <div className="bg-info-content text-white px-4 py-2 mb-4">
              <h2 className="text-lg font-bold">CONTRAYENTES</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contrayentes.map((c, index) => (
                <div key={index} className="space-y-2 border-l-4 border-info-content pl-4">
                  <h3 className="font-semibold text-gray-700 mb-3">Datos de {index === 0 ? 'la Contrayente' : 'del Contrayente'}:</h3>
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700">Nombre:</span>
                    <span className="text-gray-600">{c.nombre}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700">Estado Civil:</span>
                    <span className="text-gray-600">{c.estado_civil}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700">Natural de:</span>
                    <span className="text-gray-600">{c.ubigeo_completo}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700">Domiciliado:</span>
                    <span className="text-gray-600">{c.direccion}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700">{c.tipo_identificacion} :</span>
                    <span className="text-gray-600">N° {c.numero_identificacion}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TESTIGOS DINÁMICOS */}
          <section className="mb-8">
            <div className="bg-info-content text-white px-4 py-2 mb-4">
              <h2 className="text-lg font-bold">TESTIGOS</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testigos.map((t, index) => (
                <div key={index} className="space-y-2 border-l-4 border-gray-300 pl-4">
                  <h3 className="font-semibold text-gray-700 mb-3">Testigo {index + 1}:</h3>
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700">Nombre:</span>
                    <span className="text-gray-600">{t.nombre}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700">{t.tipo_identificacion} :</span>
                    <span className="text-gray-600">N° {t.numero_identificacion}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-gray-700">Domiciliado:</span>
                    <span className="text-gray-600 text-sm">{t.direccion}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* REQUISITOS DINÁMICOS */}
          <section className="mb-8">
            <div className="bg-info-content text-white px-4 py-2 mb-4">
              <h2 className="text-lg font-bold">REQUISITOS</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-info-content text-white">
                    <th className="border border-gray-300 px-4 py-2 text-left">Requisito</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Estado</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Fecha Entrega</th>
                  </tr>
                </thead>
                <tbody>
                  {application.requisitos.map((req, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="border border-gray-300 px-4 py-3 text-sm">{req.nombre_requisito}</td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${req.estado_entrega === 'Entregado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {req.estado_entrega}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm">
                        {req.fecha_entrega ? new Date(req.fecha_entrega).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* INFORMACIÓN DE PAGO DINÁMICA */}
          <section className="mb-4">
            <div className="bg-info-content text-white px-4 py-2 mb-4">
              <h2 className="text-lg font-bold">INFORMACIÓN DE PAGO</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-gray-700">Nro. Comprobante:</span>
                <span>{application.pago.numero_comprobante || "-"}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-gray-700">Estado:</span>
                <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${application.pago.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {application.pago.estado}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="font-semibold text-gray-700">Fecha de Pago:</span>
                <span>{application.pago.fecha_pago ? new Date(application.pago.fecha_pago).toLocaleDateString() : "-"}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
      <div className="sticky bottom-4 z-30 flex justify-end px-4 pb-4">
        <button
          onClick={handleExport}
          disabled={isExporting}
          tabIndex={0}
          className="flex items-center gap-2 p-5 bg-green-600 text-white font-semibold rounded-full shadow hover:bg-green-700 cursor-pointer transition-all duration-200 hover:-translate-y-3 hover:scale-105 disabled:bg-gray-400 disabled:hover:translate-y-0 disabled:hover:scale-100"
        >
          <svg className="fill-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" /></svg>
        </button>
      </div>
    </div>
  );
};