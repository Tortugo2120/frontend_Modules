import SolicitudOption from "./SolicitudOption";

interface Solicitud {
    id: number;
    nombre_solicitud: string;
    descripcion: string;
    precio: number | string;
}

interface CategoryAccordionProps {
    categoryName: string;
    solicitudes: Solicitud[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    defaultOpen?: boolean;
}

export default function CategoryAccordion({
    categoryName,
    solicitudes,
    selectedId,
    onSelect,
    defaultOpen = false
}: CategoryAccordionProps) {

    // Verificar si alguna solicitud de esta categoría está seleccionada
    const hasSelection = solicitudes.some(sol => sol.id === selectedId);

    // Determinar si necesita scroll (más de 3 opciones)
    const needsScroll = solicitudes.length > 3;

    return (
        <div className="collapse collapse-arrow bg-info-content border border-info-content rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <input type="checkbox" defaultChecked={defaultOpen} />
            <div className="collapse-title font-bold text-lg flex items-center gap-3 text-white">
                <i className="fas fa-folder text-white"></i>
                {categoryName}
                <span className="text-xs text-white font-normal">
                    ({solicitudes.length})
                </span>
                {hasSelection && (
                    <span className="badge badge-sm bg-blue-500 text-white border-0">
                        Seleccionado
                    </span>
                )}
            </div>
            <div className="collapse-content bg-gray-50">
                <div
                    className={`pt-2 ${needsScroll ? 'max-h-100 overflow-y-auto pr-2 pl-0.5' : ''}`}
                    style={needsScroll ? {
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#CBD5E0 #F7FAFC'
                    } as React.CSSProperties : {}}
                >
                    {solicitudes.length > 0 ? (
                        solicitudes.map((solicitud) => (
                            <SolicitudOption
                                key={solicitud.id}
                                id={solicitud.id}
                                nombre={solicitud.nombre_solicitud}
                                descripcion={solicitud.descripcion}
                                precio={solicitud.precio}
                                isSelected={selectedId === solicitud.id}
                                onSelect={onSelect}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm py-4 text-center">
                            No hay solicitudes en esta categoría
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}