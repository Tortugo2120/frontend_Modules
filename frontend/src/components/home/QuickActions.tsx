type ActionButton = {
    icon: string;
    label: string;
    variant: 'primary' | 'secondary';
}

const actionButtons: ActionButton[] = [
    { icon: 'fa-plus', label: 'Nueva Solicitud', variant: 'primary' },
    { icon: 'fa-search', label: 'Buscar Expediente', variant: 'secondary' },
    { icon: 'fa-receipt', label: 'Registrar Pago', variant: 'secondary' },
    { icon: 'fa-print', label: 'Imprimir Documento', variant: 'secondary' }
];

export default function QuickActions() {
    return (
        <div className="bg-white rounded-md shadow-lg">
            <div className="px-5 lg:px-6 py-4 lg:py-5 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Acciones Rápidas</h3>
            </div>
            <div className="p-4 lg:p-6 space-y-3">
                {actionButtons.map((action, index) => (
                    <button
                        key={index}
                        className={`w-full flex items-center gap-4 px-5 py-3.5 transition-colors ${
                            action.variant === 'primary'
                                ? 'bg-accent text-white hover:bg-info-content/90'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <i className={`fas ${action.icon} w-5 text-center ${
                            action.variant === 'secondary' ? 'text-gray-400' : ''
                        }`}></i>
                        <span className={`text-sm ${
                            action.variant === 'primary' ? 'font-medium' : 'font-normal'
                        }`}>
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}