type Actividad = {
    tipo: 'pago' | 'documento' | 'espera' | 'nueva';
    titulo: string;
    descripcion: string;
    tiempo: string;
}

type RecentActivityProps = {
    actividades: Actividad[];
}

export default function RecentActivity({ actividades }: RecentActivityProps) {
    const getActividadIcon = (tipo: string) => {
        switch (tipo) {
            case 'pago':
                return {
                    icon: 'fa-check',
                    bgColor: 'bg-green-100',
                    iconColor: 'text-green-600'
                };
            case 'documento':
                return {
                    icon: 'fa-file-alt',
                    bgColor: 'bg-blue-100',
                    iconColor: 'text-blue-600'
                };
            case 'espera':
                return {
                    icon: 'fa-clock',
                    bgColor: 'bg-amber-100',
                    iconColor: 'text-amber-600'
                };
            case 'nueva':
                return {
                    icon: 'fa-user-plus',
                    bgColor: 'bg-indigo-100',
                    iconColor: 'text-indigo-600'
                };
            default:
                return {
                    icon: 'fa-info',
                    bgColor: 'bg-gray-100',
                    iconColor: 'text-gray-600'
                };
        }
    };

    return (
        <div className="bg-white rounded-md shadow-lg">
            <div className="px-5 lg:px-6 py-4 lg:py-5 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Actividad Reciente</h3>
            </div>
            <div className="p-4 lg:p-6">
                <div className="space-y-5">
                    {actividades.map((actividad, index) => {
                        const iconConfig = getActividadIcon(actividad.tipo);
                        return (
                            <div key={index} className="flex gap-4">
                                <div className={`w-9 h-9 ${iconConfig.bgColor} flex items-center justify-center`}>
                                    <i className={`fas ${iconConfig.icon} ${iconConfig.iconColor} text-xs`}></i>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-gray-800 font-normal">{actividad.titulo}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 font-normal truncate">{actividad.descripcion}</p>
                                    <p className="text-xs text-gray-400 mt-0.5 font-normal">{actividad.tiempo}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}