interface ApplicantFormProps {
    formData: {
        nombreSolicitante: string;
        dniSolicitante: string;
        telefonoSolicitante: string;
        emailSolicitante: string;
        direccionSolicitante: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ApplicantForm({ formData, onChange }: ApplicantFormProps) {
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fas fa-user text-blue-600"></i>
                Datos del Solicitante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="nombreSolicitante"
                        value={formData.nombreSolicitante}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all"
                        placeholder="Ingrese su nombre completo"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        DNI <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="dniSolicitante"
                        value={formData.dniSolicitante}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all"
                        placeholder="Ej: 12345678"
                        maxLength={8}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        name="telefonoSolicitante"
                        value={formData.telefonoSolicitante}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all"
                        placeholder="Ej: 987654321"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                        type="email"
                        name="emailSolicitante"
                        value={formData.emailSolicitante}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all"
                        placeholder="correo@ejemplo.com"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                    <input
                        type="text"
                        name="direccionSolicitante"
                        value={formData.direccionSolicitante}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all"
                        placeholder="Ingrese su dirección completa"
                    />
                </div>
            </div>
        </div>
    );
}