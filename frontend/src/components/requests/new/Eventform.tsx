type TipoSolicitud = 'matrimonio' | 'divorcio' | 'nacimiento' | 'defuncion' | 'copia';

interface EventFormProps {
    tipoSolicitud: TipoSolicitud | '';
    formData: {
        nombreCompleto1: string;
        dniPersona1: string;
        nombreCompleto2: string;
        dniPersona2: string;
        fechaEvento: string;
        lugarEvento: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EventForm({ tipoSolicitud, formData, onChange }: EventFormProps) {
    const showSecondPerson = tipoSolicitud === 'matrimonio' || tipoSolicitud === 'divorcio';

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fas fa-clipboard-list text-blue-600"></i>
                Datos del Trámite
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo (Persona 1)
                    </label>
                    <input
                        type="text"
                        name="nombreCompleto1"
                        value={formData.nombreCompleto1}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all"
                        placeholder="Nombre de la primera persona"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">DNI (Persona 1)</label>
                    <input
                        type="text"
                        name="dniPersona1"
                        value={formData.dniPersona1}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all"
                        placeholder="DNI"
                        maxLength={8}
                    />
                </div>

                {showSecondPerson && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre Completo (Persona 2)
                            </label>
                            <input
                                type="text"
                                name="nombreCompleto2"
                                value={formData.nombreCompleto2}
                                onChange={onChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all"
                                placeholder="Nombre de la segunda persona"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">DNI (Persona 2)</label>
                            <input
                                type="text"
                                name="dniPersona2"
                                value={formData.dniPersona2}
                                onChange={onChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all"
                                placeholder="DNI"
                                maxLength={8}
                            />
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha del Evento</label>
                    <input
                        type="date"
                        name="fechaEvento"
                        value={formData.fechaEvento}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lugar del Evento</label>
                    <input
                        type="text"
                        name="lugarEvento"
                        value={formData.lugarEvento}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all"
                        placeholder="Ciudad, distrito, etc."
                    />
                </div>
            </div>
        </div>
    );
}