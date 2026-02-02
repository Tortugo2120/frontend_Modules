import type { TipoSolicitud } from "../../Types/requests/Constants";

interface RequestType {
    id: string;
    nombre: string;
    icon: string;
    descripcion: string;
    color: string;
    colorOpacity: string;
    ringColor: string;
}

interface RequestTypeCardProps {
    tipo: RequestType;
    isSelected: boolean;
    onSelect: (id: TipoSolicitud) => void;
}

export default function RequestTypeCard({ tipo, isSelected, onSelect }: RequestTypeCardProps) {
    return (
        <button
            type="button"
            onClick={() => onSelect(tipo.id as TipoSolicitud)}
            className={`group relative overflow-hidden ${tipo.colorOpacity} rounded-xl p-6 text-left transition-all duration-300 cursor-pointer shadow-md hover:scale-105 hover:shadow-lg ${isSelected ? `ring-2 ${tipo.ringColor}` : 'ring-1 ring-blue-200'
                }`}
        >
            <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${isSelected ? 'opacity-100' : ''
                    }`}
            ></div>

            <div className="relative">
                <div className={`w-14 h-14 rounded-xl ${tipo.color} flex items-center justify-center mb-4 shadow-md`}>
                    <i className={`fas ${tipo.icon} text-white text-xl`}></i>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{tipo.nombre}</h3>
                <p className="text-gray-600 text-sm">{tipo.descripcion}</p>

                {isSelected && (
                    <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <i className="fas fa-check text-white text-xs"></i>
                        </div>
                    </div>
                )}
            </div>
        </button>
    );
}