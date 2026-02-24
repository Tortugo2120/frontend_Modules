import {useNavigate} from "react-router-dom";

type ActionButton = {
    icon: string;
    label: string;
    variant: string;
    path?: string; // Opcional, solo para botones que navegan a otra página
}

const actionButtons: ActionButton[] = [
    { icon: 'fa-plus',             label: 'Nueva Solicitud',              variant: 'primary',   path: '/dashboard/solicitud/new' },
    { icon: 'fa-money-bill-1',     label: 'Ver Pagos',                    variant: 'success',   path: '/dashboard/pagos' },
    { icon: 'fa-clock-rotate-left',label: 'Ver Historial de Solicitudes', variant: 'neutral',   path: '/dashboard/solicitud/history' },
];

export default function QuickActions() {
    const navigate = useNavigate();
    return (
        <div className="bg-white rounded-md shadow-lg">
            <div className="px-5 lg:px-6 py-4 lg:py-5 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Acciones Rápidas</h3>
            </div>
            <div className="p-4 lg:p-6 space-y-3">
                {actionButtons.map((action, index) => (
                    <button
                        key={index}
                        className={`btn btn-${action.variant} btn-soft w-full flex items-center gap-4 px-5 py-3.5 transition-colors cursor-pointer`}
                        onClick={() => { navigate(action.path ?? '#', { replace: true }) }}
                    >
                        <i className={`fas ${action.icon} w-5 text-center`}></i>
                        <span className="text-lg font-medium">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}