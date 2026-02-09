import { useState, useCallback, useEffect } from 'react';

interface RequisitoExtranjero {
    id: string;
    titulo: string;
    descripcion: string;
    obligatorio: boolean;
    completado: boolean;
}



interface ExtranjeroProps {
    onRequisitosChange?: (requisitos: RequisitoExtranjero[]) => void;

}

const REQUISITOS_Extranjero: RequisitoExtranjero[] = [
    {
        id: '1',
        titulo: 'Partida de nacimiento original actualizada y apostillada',
        descripcion: 'Original y copia certificada de la partida de Matrimonio.',
        obligatorio: true,
        completado: false
    },
    {
        id: '2',
        titulo: 'Certificado de solteria apostillada',
        descripcion: 'Original y copia de cretifica que acredite dicho estado.',
        obligatorio: true,
        completado: false
    },
    {
        id: '3',
        titulo: 'Copia legalizada de pasaporte',
        descripcion: 'Pasaporte vigente.',
        obligatorio: true,
        completado: false
    },
    {
        id: '4',
        titulo: 'Traducción oficial del docuemento antes descrito y visado por consulado del país de origen',
        descripcion: ', además visada por el ministerio de relaciones exteriores en Lima',
        obligatorio: true,
        completado: false
    }

];

const Extranjero = ({
    onRequisitosChange,

}: ExtranjeroProps) => {
    const [requiExtranjero, setRequisitos] = useState<RequisitoExtranjero[]>(REQUISITOS_Extranjero);
    const [isDragging, setIsDragging] = useState(false);

    // Notificar cambios en requisitos
    useEffect(() => {
        if (onRequisitosChange) {
            onRequisitosChange(requiExtranjero);
        }
    }, [requiExtranjero, onRequisitosChange]);



    // Calcular progreso
    const calcularProgreso = useCallback(() => {
        const requisitosObligatorios = requiExtranjero.filter(r => r.obligatorio);
        const completados = requisitosObligatorios.filter(r => r.completado).length;
        const total = requisitosObligatorios.length;
        return {
            completados,
            total,
            porcentaje: total > 0 ? Math.round((completados / total) * 100) : 0
        };
    }, [requiExtranjero]);

    const progreso = calcularProgreso();

    // Manejar cambio de checkbox
    const handleCheckboxChange = useCallback((id: string) => {
        setRequisitos(prev =>
            prev.map(req =>
                req.id === id
                    ? { ...req, completado: !req.completado }
                    : req
            )
        );
    }, []);

    // Marcar todos los obligatorios
    const marcarTodosObligatorios = useCallback(() => {
        setRequisitos(prev =>
            prev.map(req =>
                req.obligatorio
                    ? { ...req, completado: true }
                    : req
            )
        );
    }, []);

    // Drag and Drop handlers
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    return (
        <div>
            {/* Lista de Requisitos */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <i className="fas fa-list-check text-blue-600"></i>
                    Requisitos adicionales para Extranjeros
                </h4>

                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {requiExtranjero.map((requisito, index) => (
                        <div
                            key={requisito.id}
                            className={`p-4 hover:bg-gray-50 transition-colors ${requisito.completado ? 'bg-green-50' : ''
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Checkbox */}
                                <div className="flex items-center h-5 mt-0.5">
                                    <input
                                        type="checkbox"
                                        id={`requisito-${requisito.id}`}
                                        checked={requisito.completado}
                                        onChange={() => handleCheckboxChange(requisito.id)}
                                        className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                    />
                                </div>

                                {/* Contenido */}
                                <div className="flex-1 min-w-0">
                                    <label
                                        htmlFor={`requisito-${requisito.id}`}
                                        className="cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <span className={`text-sm font-medium ${requisito.completado
                                                ? 'text-gray-500 line-through'
                                                : 'text-gray-900'
                                                }`}>
                                                {index + 1}. {requisito.titulo}
                                            </span>
                                            {requisito.obligatorio && (
                                                <span className="shrink-0 bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded">
                                                    Obligatorio
                                                </span>
                                            )}
                                            {!requisito.obligatorio && (
                                                <span className="shrink-0 bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded">
                                                    Opcional
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs ${requisito.completado ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                            {requisito.descripcion}
                                        </p>
                                    </label>
                                </div>

                                {/* Estado */}
                                {requisito.completado && (
                                    <div className="shrink-0">
                                        <i className="fas fa-check-circle text-green-600 text-xl"></i>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Extranjero;