interface SolicitudOptionProps {
    id: number;
    nombre: string;
    precio: number | string;
    descripcion: string;
    isSelected: boolean;
    onSelect: (id: number) => void;
}

export default function SolicitudOption({
    id,
    nombre,
    precio,
    descripcion,
    isSelected,
    onSelect
}: SolicitudOptionProps) {
    return (
        <button
            type="button"
            onClick={() => onSelect(id)}
            className={`w-full text-left p-4 rounded-lg transition-all duration-300 mb-2 ${isSelected
                ? 'bg-blue-200 text-white shadow-lg ring-2 ring-blue-600'
                : 'bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300'
                }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                        <p className={`text-sm mb-2 ${isSelected ? 'text-gray-800' : 'text-gray-800'}`}>
                            {nombre}
                        </p>
                    <div className="flex items-center gap-2 mb-1">
                        <i className={`fa-regular fa-file ${isSelected ? 'text-blue-500' : 'text-blue-500'}`}></i>
                        <h4 className={`font-semibold text-md ${isSelected ? 'text-gray-900' : 'text-gray-900'}`}>
                            {descripcion}
                        </h4>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-md font-bold ${isSelected ? 'text-blue-600' : 'text-blue-600'}`}>
                            Precio: S/. {precio}
                        </span>
                    </div>
                </div>

                {/* Indicador de selección */}
                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected
                    ? 'bg-white text-blue-600'
                    : 'bg-gray-200 text-gray-400'
                    }`}>
                    <i className={`fas fa-check text-xs ${isSelected ? 'opacity-100' : 'opacity-0'}`}></i>
                </div>
            </div>
        </button>
    );
}