interface RequestTypeCardProps {
    id: number;
    nombre: string;
    precio: number | string;
    isSelected: boolean;
    onSelect: (id: number) => void;
}

export default function RequestTypeCard({ id, nombre, precio, isSelected, onSelect }: RequestTypeCardProps) {
    return (
        <button
            type="button"
            onClick={() => onSelect(id)}
            className={`group relative overflow-hidden bg-blue-50 rounded-xl p-6 text-left transition-all duration-300 cursor-pointer shadow-md hover:scale-105 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500' : 'ring-1 ring-blue-200'
            }`}
        >
            <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                    isSelected ? 'opacity-100' : ''
                }`}
            ></div>

            <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-blue-500 flex items-center justify-center mb-4 shadow-md">
                    <i className="fa-regular fa-file text-white text-xl"></i>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{nombre}</h3>
                <p className="text-gray-600 text-sm">Precio: S/. {precio}</p>

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