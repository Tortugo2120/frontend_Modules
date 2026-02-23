import { usePagosResumen } from "../../hooks/usePagosResumen";

interface CardDef {
    label: string;
    value: string;
    icon: string;
    bgColor: string;
}

export default function ResumenCards() {
    const { data, loading } = usePagosResumen();

    const cards: CardDef[] = [
        {
            label:    "Total Recaudado",
            value:    loading ? "..." : `S/ ${(data?.data?.total ?? 0).toFixed(2)}`,
            icon:     "fa-coins",
            bgColor: "bg-green-600 ",
        },
        {
            label:    "Recaudado Hoy",
            value:    loading ? "..." : `S/ ${(data?.data?.total_hoy ?? 0).toFixed(2)}`,
            icon:     "fa-calendar-day",
            bgColor: "bg-blue-600 ",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {cards.map(card => (
                <div
                    key={card.label}
                    className={`${card.bgColor} rounded-md p-6 flex justify-between items-center shadow-md text-white`}
                >
                    <div>
                        <p className=" opacity-80 mb-1">{card.label}</p>
                        <p className="text-5xl font-bold tracking-tight">{card.value}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                        <i className={`fas ${card.icon} text-2xl`}></i>
                    </div>
                </div>
            ))}
        </div>
    );
}
