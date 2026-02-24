import { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { RECAUDACION_BASE, INPUT_CLASS } from "./constants";
import { useRecaudacionMensual } from "../../hooks/useRecaudacionMensual";

export default function GraficoRecaudacion() {
    const [anio, setAnio] = useState("");
    const { data, aniosDisponibles, loading, error } = useRecaudacionMensual(anio);

    // Seleccionar el año más reciente cuando se carguen los años disponibles
    useEffect(() => {
        if (aniosDisponibles.length > 0 && anio === "") {
            setAnio(aniosDisponibles[0]);
        }
    }, [aniosDisponibles, anio]);

    // Fallback a array base (montos en 0) si aún no hay datos
    const chartData = data.length > 0 ? data : RECAUDACION_BASE;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Recaudación Mensual</h2>
                    <p className="text-sm text-gray-400 mt-0.5">Gráfico estadístico de ingresos mensuales</p>
                </div>
                <select
                    value={anio}
                    onChange={e => setAnio(e.target.value)}
                    className={`${INPUT_CLASS} font-semibold`}
                    disabled={aniosDisponibles.length === 0}
                >
                    {aniosDisponibles.map(y => <option key={y}>{y}</option>)}
                </select>
            </div>

            {error && (
                <div className="text-center py-4 text-red-400 text-sm mb-2">
                    <i className="fas fa-exclamation-circle mr-1"></i>{error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-75">
                    <span className="loading loading-spinner loading-lg text-sky-500"></span>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 16, right: 16, left: 8, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis
                            dataKey="mes"
                            tick={{ fontSize: 11, fill: "#94A3B8" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tickFormatter={v => `S/ ${v}`}
                            tick={{ fontSize: 11, fill: "#94A3B8" }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            formatter={value => [`S/ ${value}`, "Recaudado"]}
                            contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "13px" }}
                        />
                        <Bar dataKey="monto" fill="#0EA5E9" radius={[4, 4, 0, 0]} maxBarSize={52} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
