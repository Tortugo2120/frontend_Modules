import { useState, useCallback } from 'react';

interface Solicitud {
    tipoSolicitudNombre?: string;
}

interface TipoMatrimonio {
    id: string;
    titulo: string;
    descripcion: string;
    precio: number;
    completado: boolean;
}

const TIPO_MATRIMONIO: TipoMatrimonio[] = [
    {
        id: '1',
        titulo: 'Matrimonio civil en horario de oficina.',
        descripcion: '(L-V de 8 am a 2pm.)',
        precio: 237.20,
        completado: false
    },
    {
        id: '2',
        titulo: 'Matrimonio civil fuera del horario de oficina.',
        descripcion: '(L–V de 3 p.m. a 5 p.m.)',
        precio: 262.70,
        completado: false
    },
    {
        id: '3',
        titulo: 'Matrimonio civil en domicilio a los alrededores de la Municipalidad.',
        descripcion: '(L–V de 8 a.m. a 6 p.m.)',
        precio: 288.00,
        completado: false
    },
    {
        id: '4',
        titulo: 'Matrimonio civil en local público dentro del distrito',
        descripcion: '(L–V de 8 a.m. a 6 p.m.)',
        precio: 290.00,
        completado: false
    },
    {
        id: '5',
        titulo: 'Matrimonio civil en local público fuera del distrito',
        descripcion: '(L–V de 2 p.m. a 6 p.m.)',
        precio: 339.30,
        completado: false
    },
    {
        id: '6',
        titulo: 'Matrimonio civil oficiado por el alcalde del distrito',
        descripcion: 'Disponible',
        precio: 388.00,
        completado: false
    },
];

const SeleccionMatrimonio = ({ tipoSolicitudNombre }: Solicitud) => {
    const [tiposMatrimonio, setTiposMatrimonio] =
        useState<TipoMatrimonio[]>(TIPO_MATRIMONIO);

    // Verificar si hay alguna opción seleccionada
    const haySeleccion = tiposMatrimonio.some(tipo => tipo.completado);

    const handleCheckboxChange = useCallback((id: string) => {
        setTiposMatrimonio(prev =>
            prev.map(tipo => {
                if (tipo.id === id) {
                    return { ...tipo, completado: !tipo.completado };
                } else {
                    return { ...tipo, completado: false };
                }
            })
        );
    }, []);

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 pb-3 border-b border-b-blue-300">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-clipboard-check text-blue-600"></i>
                    <span>Tipo y Costo de Matrimonio</span>
                </h3>

                {tipoSolicitudNombre && (
                    <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg inline-flex items-center w-fit">
                        <i className="fas fa-file-alt mr-2"></i>
                        {tipoSolicitudNombre.toUpperCase()}
                    </span>
                )}
            </div>

            {/* Lista */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <i className="fas fa-list-check text-blue-600"></i>
                    Lista de Opciones
                </h4>

                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {tiposMatrimonio.map((tipo, index) => {
                        // Solo se tacha si hay una selección Y esta opción NO está completada
                        const debeTacharse = haySeleccion && !tipo.completado;

                        return (
                            <div
                                key={tipo.id}
                                className={`p-4 hover:bg-gray-50 transition-colors ${tipo.completado ? 'bg-green-50' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={tipo.completado}
                                        onChange={() => handleCheckboxChange(tipo.id)}
                                        className="w-5 h-5 mt-1 text-blue-600 border-gray-300 rounded cursor-pointer"
                                    />

                                    <div className="flex-1">
                                        <span
                                            className={`text-sm font-medium ${debeTacharse
                                                ? 'line-through text-gray-400'
                                                : 'text-gray-900'
                                                }`}
                                        >
                                            {index + 1}. {tipo.titulo}
                                        </span>

                                        <p className={`text-xs ${debeTacharse ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {tipo.descripcion}
                                        </p>
                                    </div>
                                    <div className={`text-base sm:text-md font-semibold ${debeTacharse ? 'text-gray-300' : 'text-gray-500'}`}>
                                        Costo:
                                        <span className={`ml-2 ${debeTacharse ? 'text-gray-400' : 'text-blue-700'}`}>
                                            {tipo.precio.toFixed(2)}
                                        </span>
                                    </div>
                                    {tipo.completado && (
                                        <i className="fas fa-check-circle text-green-600 text-xl"></i>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SeleccionMatrimonio;