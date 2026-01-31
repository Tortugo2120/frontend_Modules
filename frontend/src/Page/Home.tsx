"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type Solicitud = {
    expediente: string;
    tipo: string;
    solicitante: string;
    estado: 'Pendiente' | 'Completado' | 'En Proceso' | 'Observado';
    fecha: string;
}

type Actividad = {
    tipo: 'pago' | 'documento' | 'espera' | 'nueva';
    titulo: string;
    descripcion: string;
    tiempo: string;
}

export default function Home() {

    const solicitudes: Solicitud[] = [
        {
            expediente: "EXP-2026-001245",
            tipo: "Matrimonio",
            solicitante: "María García López",
            estado: "Pendiente",
            fecha: "28/01/2026"
        },
        {
            expediente: "EXP-2026-001244",
            tipo: "Matrimonio",
            solicitante: "Juan Pérez Torres",
            estado: "Completado",
            fecha: "27/01/2026"
        },
        {
            expediente: "EXP-2026-001243",
            tipo: "Divorcio",
            solicitante: "Carlos Mendoza Ruiz",
            estado: "En Proceso",
            fecha: "27/01/2026"
        },
        {
            expediente: "EXP-2026-001242",
            tipo: "Copia de expediente",
            solicitante: "Ana Díaz Vega",
            estado: "Completado",
            fecha: "26/01/2026"
        },
        {
            expediente: "EXP-2026-001241",
            tipo: "Divorcio",
            solicitante: "Luis Sánchez Paredes",
            estado: "Observado",
            fecha: "26/01/2026"
        }
    ];

    const actividades: Actividad[] = [
        {
            tipo: 'pago',
            titulo: 'Pago registrado',
            descripcion: 'EXP-2026-001244 - S/ 35.00',
            tiempo: 'Hace 15 minutos'
        },
        {
            tipo: 'documento',
            titulo: 'Documento generado',
            descripcion: 'Acta de Nacimiento #1244',
            tiempo: 'Hace 32 minutos'
        },
        {
            tipo: 'espera',
            titulo: 'Solicitud en espera',
            descripcion: 'EXP-2026-001245',
            tiempo: 'Hace 1 hora'
        },
        {
            tipo: 'nueva',
            titulo: 'Nueva solicitud creada',
            descripcion: 'Matrimonio Civil',
            tiempo: 'Hace 2 horas'
        }
    ];

    // Datos para el gráfico de recaudación
    const recaudacionData = [
        { mes: 'Jul', monto: 5200 },
        { mes: 'Ago', monto: 6800 },
        { mes: 'Sep', monto: 5900 },
        { mes: 'Oct', monto: 7200 },
        { mes: 'Nov', monto: 8100 },
        { mes: 'Dic', monto: 7500 },
        { mes: 'Ene', monto: 8420 }
    ];

    const getEstadoClasses = (estado: string) => {
        switch (estado) {
            case 'Pendiente':
                return 'bg-amber-100 text-amber-700';
            case 'Completado':
                return 'bg-green-100 text-green-700';
            case 'En Proceso':
                return 'bg-blue-100 text-blue-700';
            case 'Observado':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getActividadIcon = (tipo: string) => {
        switch (tipo) {
            case 'pago':
                return {
                    icon: 'fa-check',
                    bgColor: 'bg-green-100',
                    iconColor: 'text-green-600'
                };
            case 'documento':
                return {
                    icon: 'fa-file-alt',
                    bgColor: 'bg-blue-100',
                    iconColor: 'text-blue-600'
                };
            case 'espera':
                return {
                    icon: 'fa-clock',
                    bgColor: 'bg-amber-100',
                    iconColor: 'text-amber-600'
                };
            case 'nueva':
                return {
                    icon: 'fa-user-plus',
                    bgColor: 'bg-indigo-100',
                    iconColor: 'text-indigo-600'
                };
            default:
                return {
                    icon: 'fa-info',
                    bgColor: 'bg-gray-100',
                    iconColor: 'text-gray-600'
                };
        }
    };

    return (
        <>
            <div className="bg-blue-300/40 p-4 sm:p-6 lg:p-10">
                <div className="mb-6 lg:mb-10">
                    <h1 className="text-3xl font-trispace lg:text-4xl font-semibold text-info-content">Panel de Control</h1>
                    <p className="text-gray-800 mt-1.5 lg:mt-2 font-normal text-sm lg:text-base">Resumen general del sistema de Registro Civil</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-10">
                    <div className="bg-white overflow-hidden rounded-md shadow-sm">
                        <div className="bg-blue-950 px-5 lg:px-6 py-4">
                            <h3 className="text-white font-medium text-sm">Solicitudes Pendientes</h3>
                        </div>
                        <div className="px-5 lg:px-6 py-6 lg:py-7">
                            <p className="text-3xl lg:text-4xl font-bold text-gray-800">24</p>
                            <p className="text-gray-500 text-sm mt-2 lg:mt-3 font-normal">
                                <span className="text-accent font-medium">+3</span> desde ayer
                            </p>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden rounded-md shadow-sm">
                        <div className="bg-green-600 px-5 lg:px-6 py-4">
                            <h3 className="text-white font-medium text-sm">Trámites Completados</h3>
                        </div>
                        <div className="px-5 lg:px-6 py-6 lg:py-7">
                            <p className="text-3xl lg:text-4xl font-bold text-gray-800">156</p>
                            <p className="text-gray-500 text-sm mt-2 lg:mt-3 font-normal">
                                <span className="text-success font-medium">+12%</span> este mes
                            </p>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden rounded-md shadow-sm">
                        <div className="bg-orange-400 px-5 lg:px-6 py-4">
                            <h3 className="text-white font-medium text-sm">Pagos Registrados</h3>
                        </div>
                        <div className="px-5 lg:px-6 py-6 lg:py-7">
                            <p className="text-3xl lg:text-4xl font-bold text-gray-800">S/ 8,420</p>
                            <p className="text-gray-500 text-sm mt-2 lg:mt-3 font-normal">
                                <span className="text-warning font-medium">Hoy:</span> S/ 1,250
                            </p>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden rounded-md shadow-sm">
                        <div className="bg-red-600 px-5 lg:px-6 py-4">
                            <h3 className="text-white font-medium text-sm">Documentos Pendientes</h3>
                        </div>
                        <div className="px-5 lg:px-6 py-6 lg:py-7">
                            <p className="text-3xl lg:text-4xl font-bold text-gray-800">7</p>
                            <p className="text-gray-500 text-sm mt-2 lg:mt-3 font-normal">
                                <span className="text-danger font-medium">Urgentes:</span> 2
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
                    {/* Tabla de Solicitudes Recientes */}
                    <div className="xl:col-span-8 bg-white shadow-sm">
                        <div className="px-5 lg:px-6 py-4 lg:py-5 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-800">Solicitudes Recientes</h3>
                        </div>
                        <div className="p-4 lg:p-6 overflow-x-auto">
                            <table className="w-full min-w-auto">
                                <thead>
                                    <tr className="text-left text-gray-500 text-xs lg:text-sm font-medium uppercase tracking-wide">
                                        <th className="pb-4">N° Expediente</th>
                                        <th className="pb-4">Tipo</th>
                                        <th className="pb-4">Solicitante</th>
                                        <th className="pb-4">Estado</th>
                                        <th className="pb-4">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {solicitudes.map((solicitud, index) => (
                                        <tr key={index} className="border-t border-gray-100">
                                            <td className="py-4 font-medium text-gray-800">{solicitud.expediente}</td>
                                            <td className="py-4 text-gray-600 font-normal">{solicitud.tipo}</td>
                                            <td className="py-4 text-gray-600 font-normal">{solicitud.solicitante}</td>
                                            <td className="py-4">
                                                <span className={`${getEstadoClasses(solicitud.estado)} px-3 py-1 text-xs font-medium`}>
                                                    {solicitud.estado}
                                                </span>
                                            </td>
                                            <td className="py-4 text-gray-500 font-normal">{solicitud.fecha}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Panel lateral */}
                    <div className="xl:col-span-4 space-y-4 lg:space-y-6">
                        {/* Acciones Rápidas */}
                        <div className="bg-white shadow-sm">
                            <div className="px-5 lg:px-6 py-4 lg:py-5 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800">Acciones Rápidas</h3>
                            </div>
                            <div className="p-4 lg:p-6 space-y-3">
                                <button className="w-full flex items-center gap-4 px-5 py-3.5 bg-accent text-white hover:bg-info-content/90 transition-colors">
                                    <i className="fas fa-plus w-5 text-center"></i>
                                    <span className="font-medium text-sm">Nueva Solicitud</span>
                                </button>
                                <button className="w-full flex items-center gap-4 px-5 py-3.5 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                                    <i className="fas fa-search w-5 text-center text-gray-400"></i>
                                    <span className="font-normal text-sm">Buscar Expediente</span>
                                </button>
                                <button className="w-full flex items-center gap-4 px-5 py-3.5 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                                    <i className="fas fa-receipt w-5 text-center text-gray-400"></i>
                                    <span className="font-normal text-sm">Registrar Pago</span>
                                </button>
                                <button className="w-full flex items-center gap-4 px-5 py-3.5 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                                    <i className="fas fa-print w-5 text-center text-gray-400"></i>
                                    <span className="font-normal text-sm">Imprimir Documento</span>
                                </button>
                            </div>
                        </div>

                        {/* Actividad Reciente */}
                        <div className="bg-white shadow-sm">
                            <div className="px-5 lg:px-6 py-4 lg:py-5 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-800">Actividad Reciente</h3>
                            </div>
                            <div className="p-4 lg:p-6">
                                <div className="space-y-5">
                                    {actividades.map((actividad, index) => {
                                        const iconConfig = getActividadIcon(actividad.tipo);
                                        return (
                                            <div key={index} className="flex gap-4">
                                                <div className={`w-9 h-9 ${iconConfig.bgColor} flex items-center justify-center`}>
                                                    <i className={`fas ${iconConfig.icon} ${iconConfig.iconColor} text-xs`}></i>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm text-gray-800 font-normal">{actividad.titulo}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5 font-normal truncate">{actividad.descripcion}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5 font-normal">{actividad.tiempo}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gráfico de Recaudación - Nueva Sección */}
                <div className="mt-4 lg:mt-6 bg-white shadow-sm">
                    <div className="px-5 lg:px-6 py-4 lg:py-5 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-800">Recaudación Mensual</h3>
                        <p className="text-gray-500 text-sm mt-1">Últimos 7 meses</p>
                    </div>
                    <div className="p-4 lg:p-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={recaudacionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="mes"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                />
                                <YAxis
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    axisLine={{ stroke: '#e5e7eb' }}
                                    tickFormatter={(value) => `S/ ${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}
                                    formatter={(value) => [`S/ ${value}`, 'Recaudación']}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
                                />
                                <Bar
                                    dataKey="monto"
                                    fill="#fb923c"
                                    name="Monto Recaudado"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </>
    )
}