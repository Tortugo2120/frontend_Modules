"use client";
import StatsCard from '../components/home/StatsCard';
import RecentReq from '../components/home/RecentReq';
import QuickActions from '../components/home/QuickActions';
import type { Solicitud } from '../Types';
import useAplicatCountPendig from "../hooks/useAplicatCountPendig.ts";
import useAplicatCountComplet from "../hooks/useAplicCountComple.ts";
import {usePagosResumen} from "../hooks/usePagosResumen.ts";
import { useApplicationHistory } from "../hooks/useApplicationHistory.ts";

export default function Home() {

    const {aplicatCountPendig} = useAplicatCountPendig();
    const {aplicatCountComplet} = useAplicatCountComplet();
    const {data} = usePagosResumen();
    const { solicitudes, loading } = useApplicationHistory();

    // Mapear ApplicationItem al formato que espera RecentReq
    const solicitudesRecientes: Solicitud[] = solicitudes.slice(0, 5).map(s => {
        const contrayente = s.participantes?.find(
            p => ['contrayente', 'divorciado', 'solicitante'].includes(p.rol.toLowerCase())
        );
        const solicitante = contrayente
            ? contrayente.nombre ?? '—'
            : '—';

        return {
            expediente: s.expediente,
            tipo: s.nombreSolicitud,
            solicitante,
            estado: s.estado as Solicitud['estado'],
            fecha: s.fecha,
        };
    });

    const formatPayment = new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(data?.data.total ?? 0);
    return (
        <>
            <div className="bg-blue-300/40 p-4 sm:p-6 lg:p-6">
                <div className="mb-6 lg:mb-8">
                    <h1 className="text-3xl font-trispace lg:text-4xl font-semibold text-info-content">Panel de Control</h1>
                    <p className="text-gray-800 mt-1.5 lg:mt-2 font-normal text-sm lg:text-base">Resumen general del sistema de Registro Civil</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-10">
                    <StatsCard
                        title="Solicitudes En Proceso"
                        value={aplicatCountPendig?.applications ?? '0'}
                        subtitle="desde ayer"
                        highlightText={String(aplicatCountPendig?.delta ?? '0')}
                        bgColor="bg-blue-950"
                        textColor="text-blue-600"
                    />
                    <StatsCard
                        title="Trámites Completados"
                        value={String(aplicatCountComplet?.delta ?? '0')}
                        subtitle="este mes"
                        highlightText={String(aplicatCountComplet?.delta ?? '0')}
                        bgColor="bg-green-600"
                        textColor="text-green-600"
                    />
                    <StatsCard
                        title={data?.message}
                        value={formatPayment}
                        subtitle={data?.data.total_hoy}
                        highlightText="Hoy:"
                        bgColor="bg-orange-400"
                        textColor='text-orange-600'
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6">
                    {/* Tabla de Solicitudes Recientes */}
                    <RecentReq solicitudes={solicitudesRecientes} loading={loading} />

                    {/* Panel lateral */}
                    <div className="xl:col-span-4 space-y-4 lg:space-y-6">
                        {/* Acciones Rápidas */}
                        <QuickActions />
                    </div>
                </div>
            </div>
        </>
    )
}