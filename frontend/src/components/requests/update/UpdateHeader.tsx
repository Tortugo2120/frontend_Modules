interface Props {
    onBack: () => void;
    onAnular: () => void;
    showAnular: boolean;
}

export default function UpdateHeader({ onBack, onAnular, showAnular }: Props) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-700">
                <button
                    onClick={onBack}
                    className="hover:text-indigo-600 cursor-pointer transition-colors"
                >
                    <i className="fas fa-angle-left mr-1"></i>Volver
                </button>
                <span>/</span>
                <span>Actualizar Solicitud</span>
            </div>

            {showAnular && (
                <button
                    onClick={onAnular}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                    <i className="fas fa-ban"></i>
                    Anular Solicitud
                </button>
            )}
        </div>
    );
}
