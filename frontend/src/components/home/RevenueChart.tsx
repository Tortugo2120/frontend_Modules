import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type RecaudacionData = {
    mes: string;
    monto: number;
}

type RevenueChartProps = {
    data: RecaudacionData[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    return (
        <div className="mt-4 lg:mt-6 bg-white rounded-md shadow-lg">
            <div className="px-5 lg:px-6 py-4 lg:py-5 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Recaudación Mensual</h3>
                <p className="text-gray-500 text-sm mt-1">Últimos 7 meses</p>
            </div>
            <div className="p-4 lg:p-6">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
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
    );
}