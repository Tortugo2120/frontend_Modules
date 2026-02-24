interface Props {
    totalRecaudado: number;
    totalPorRecaudar: number;
}

export default function TotalesPagos({ totalRecaudado, totalPorRecaudar }: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="rounded-xl p-4 text-center bg-green-50 border border-green-100">
                <p className="text-sm font-semibold text-gray-600 mb-1">Total Recaudado (completadas)</p>
                <p className="text-2xl font-bold text-green-600">S/ {totalRecaudado.toFixed(2)}</p>
            </div>
            <div className="rounded-xl p-4 text-center bg-yellow-50 border border-yellow-100">
                <p className="text-sm font-semibold text-gray-600 mb-1">Total Por Recaudar</p>
                <p className="text-2xl font-bold text-yellow-600">S/ {totalPorRecaudar.toFixed(2)}</p>
            </div>
        </div>
    );
}
