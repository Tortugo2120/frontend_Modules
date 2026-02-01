"use client";
import StatsCard from '../components/home/StatsCard';
import RecentReq from '../components/home/RecentReq';
import QuickActions from '../components/home/QuickActions';
import RecentActivity from '../components/home/RecentActivity';
import RevenueChart from '../components/home/RevenueChart';
import type { Solicitud, Actividad, RecaudacionData } from '../Types/index';

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

    const recaudacionData: RecaudacionData[] = [
        { mes: 'Jul', monto: 5200 },
        { mes: 'Ago', monto: 6800 },
        { mes: 'Sep', monto: 5900 },
        { mes: 'Oct', monto: 7200 },
        { mes: 'Nov', monto: 8100 },
        { mes: 'Dic', monto: 7500 },
        { mes: 'Ene', monto: 8420 }
    ];

    return (
        <>
            <div className="bg-blue-300/40 p-4 sm:p-6 lg:p-8">
                <div className="mb-6 lg:mb-8">
                    <h1 className="text-3xl font-trispace lg:text-4xl font-semibold text-info-content">Panel de Control</h1>
                    <p className="text-gray-800 mt-1.5 lg:mt-2 font-normal text-sm lg:text-base">Resumen general del sistema de Registro Civil</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-10">
                    <StatsCard
                        title="Solicitudes Pendientes"
                        value="24"
                        subtitle="desde ayer"
                        highlightText="+3"
                        bgColor="bg-blue-950"
                        textColor="text-blue-600"
                    />
                    <StatsCard
                        title="Trámites Completados"
                        value="156"
                        subtitle="este mes"
                        highlightText="+12%"
                        bgColor="bg-green-600"
                        textColor="text-green-600"
                    />
                    <StatsCard
                        title="Pagos Registrados"
                        value="S/ 8,420"
                        subtitle="S/ 1,250"
                        highlightText="Hoy:"
                        bgColor="bg-orange-400"
                        textColor='text-orange-600'
                    />
                    <StatsCard
                        title="Documentos Pendientes"
                        value="7"
                        subtitle="2"
                        highlightText="Urgentes:"
                        bgColor="bg-red-600"
                        textColor='text-red-600'
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
                    {/* Tabla de Solicitudes Recientes */}
                    <RecentReq solicitudes={solicitudes} />
                    
                    {/* Panel lateral */}
                    <div className="xl:col-span-4 space-y-4 lg:space-y-6">
                        {/* Acciones Rápidas */}
                        <QuickActions />
                        {/* Actividad Reciente */}
                        <RecentActivity actividades={actividades} />
                    </div>
                </div>

                {/* Gráfico de Recaudación - Nueva Sección */}
                <RevenueChart data={recaudacionData} />
            </div>
        </>
    )
}