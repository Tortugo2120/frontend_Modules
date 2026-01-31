import { useState } from "react";

type TipoSolicitud = 'matrimonio' | 'divorcio' | 'nacimiento' | 'defuncion' | 'copia';

export default function NewRequest() {
    const [tipoSolicitud, setTipoSolicitud] = useState<TipoSolicitud | ''>('');
    const [formData, setFormData] = useState({
        // Datos del solicitante
        nombreSolicitante: '',
        dniSolicitante: '',
        telefonoSolicitante: '',
        emailSolicitante: '',
        direccionSolicitante: '',
        
        // Datos específicos según tipo
        nombreCompleto1: '',
        dniPersona1: '',
        nombreCompleto2: '',
        dniPersona2: '',
        fechaEvento: '',
        lugarEvento: '',
        
        // Documentos y observaciones
        documentosAdjuntos: '',
        observaciones: ''
    });

    const [currentStep, setCurrentStep] = useState(1);

    const tiposSolicitud = [
        { 
            id: 'matrimonio' as TipoSolicitud, 
            nombre: 'Matrimonio Civil', 
            icon: 'fa-rings-wedding',
            descripcion: 'Solicitud de acta de matrimonio civil',
            color: 'from-pink-500 to-rose-600'
        },
        { 
            id: 'divorcio' as TipoSolicitud, 
            nombre: 'Divorcio', 
            icon: 'fa-heart-broken',
            descripcion: 'Trámite de divorcio civil',
            color: 'from-red-500 to-orange-600'
        },
        { 
            id: 'nacimiento' as TipoSolicitud, 
            nombre: 'Acta de Nacimiento', 
            icon: 'fa-baby',
            descripcion: 'Registro o copia de acta de nacimiento',
            color: 'from-blue-500 to-cyan-600'
        },
        { 
            id: 'defuncion' as TipoSolicitud, 
            nombre: 'Acta de Defunción', 
            icon: 'fa-cross',
            descripcion: 'Registro o copia de acta de defunción',
            color: 'from-gray-600 to-slate-700'
        },
        { 
            id: 'copia' as TipoSolicitud, 
            nombre: 'Copia de Expediente', 
            icon: 'fa-copy',
            descripcion: 'Solicitud de copia certificada',
            color: 'from-teal-500 to-emerald-600'
        }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Solicitud enviada:', { tipoSolicitud, ...formData });
        // Aquí iría la lógica para enviar al backend
    };

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    return (
        <div className="min-h-screen bg-blue-300/40 from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-10">
   
            <div className="mb-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-info-content rounded-xl flex items-center justify-center shadow-lg">
                        <i className="fas fa-file-invoice text-white text-xl"></i>
                    </div>
                    <div>   
                        <h1 className="text-3xl font-bold text-gray-900">Nueva Solicitud</h1>
                        <p className="text-gray-600 text-sm mt-1">Complete los datos para registrar una nueva solicitud</p>
                    </div>
                </div>

                {/* Nueva barra de pasos */}
                <ol className="flex justify-between items-center w-full p-3 space-x-2 text-sm font-medium text-center text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-4 sm:space-x-4">
                    <li className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
                        <span className={`flex items-center justify-center w-5 h-5 me-2 text-xs border rounded-full shrink-0 ${
                            currentStep >= 1 ? 'border-blue-600' : 'border-gray-500'
                        }`}>
                            1
                        </span>
                        Tipo <span className="hidden sm:inline-flex ms-2">de Solicitud</span>
                        <svg className="w-5 h-5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 16 4-4-4-4m6 8 4-4-4-4"/>
                        </svg>
                    </li>
                    <li className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
                        <span className={`flex items-center justify-center w-5 h-5 me-2 text-xs border rounded-full shrink-0 ${
                            currentStep >= 2 ? 'border-blue-600' : 'border-gray-500'
                        }`}>
                            2
                        </span>
                        Datos <span className="hidden sm:inline-flex ms-2">del Trámite</span>
                        <svg className="w-5 h-5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 16 4-4-4-4m6 8 4-4-4-4"/>
                        </svg>
                    </li>
                    <li className={`flex items-center ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>
                        <span className={`flex items-center justify-center w-5 h-5 me-2 text-xs border rounded-full shrink-0 ${
                            currentStep >= 3 ? 'border-blue-600' : 'border-gray-500'
                        }`}>
                            3
                        </span>
                        Confirmación
                    </li>
                </ol>
            </div>

            {/* Form Container */}
            <div className="mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Tipo de Solicitud */}
                        {currentStep === 1 && (
                            <div className="p-6 lg:p-6 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccione el tipo de solicitud</h2>
                                <p className="text-gray-600 mb-8">Elija el trámite que desea realizar</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tiposSolicitud.map((tipo) => (
                                        <button
                                            key={tipo.id}
                                            type="button"
                                            onClick={() => setTipoSolicitud(tipo.id)}
                                            className={`group relative overflow-hidden rounded-xl p-6 text-left transition-all duration-300 ${
                                                tipoSolicitud === tipo.id
                                                    ? 'ring-2 ring-blue-600 shadow-xl scale-105'
                                                    : 'bg-linear-to-br from-gray-50 to-gray-100 hover:shadow-lg hover:scale-102'
                                            }`}
                                        >
                                            <div className={`absolute inset-0 bg-linear-to-br ${tipo.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                                                tipoSolicitud === tipo.id ? 'opacity-100' : ''
                                            }`}></div>
                                            
                                            <div className="relative">
                                                <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${tipo.color} flex items-center justify-center mb-4 shadow-md`}>
                                                    <i className={`fas ${tipo.icon} text-white text-xl`}></i>
                                                </div>
                                                <h3 className="font-bold text-gray-900 text-lg mb-2">{tipo.nombre}</h3>
                                                <p className="text-gray-600 text-sm">{tipo.descripcion}</p>
                                                
                                                {tipoSolicitud === tipo.id && (
                                                    <div className="absolute top-4 right-4">
                                                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                            <i className="fas fa-check text-white text-xs"></i>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Formulario de Datos */}
                        {currentStep === 2 && (
                            <div className="p-6 lg:p-6 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Datos de la solicitud</h2>
                                <p className="text-gray-600 mb-8">Complete la información requerida</p>

                                <div className="space-y-8">
                                    {/* Datos del Solicitante */}
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
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="Ej: 987654321"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    name="emailSolicitante"
                                                    value={formData.emailSolicitante}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="correo@ejemplo.com"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Dirección
                                                </label>
                                                <input
                                                    type="text"
                                                    name="direccionSolicitante"
                                                    value={formData.direccionSolicitante}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="Ingrese su dirección completa"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Datos del Evento */}
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
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="Nombre de la primera persona"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    DNI (Persona 1)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="dniPersona1"
                                                    value={formData.dniPersona1}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="DNI"
                                                    maxLength={8}
                                                />
                                            </div>
                                            {(tipoSolicitud === 'matrimonio' || tipoSolicitud === 'divorcio') && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Nombre Completo (Persona 2)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="nombreCompleto2"
                                                            value={formData.nombreCompleto2}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                            placeholder="Nombre de la segunda persona"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            DNI (Persona 2)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="dniPersona2"
                                                            value={formData.dniPersona2}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                            placeholder="DNI"
                                                            maxLength={8}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Fecha del Evento
                                                </label>
                                                <input
                                                    type="date"
                                                    name="fechaEvento"
                                                    value={formData.fechaEvento}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Lugar del Evento
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lugarEvento"
                                                    value={formData.lugarEvento}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="Ciudad, distrito, etc."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Observaciones */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Observaciones Adicionales
                                        </label>
                                        <textarea
                                            name="observaciones"
                                            value={formData.observaciones}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                            placeholder="Agregue cualquier información adicional relevante..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirmación */}
                        {currentStep === 3 && (
                            <div className="p-6 lg:p-6 animate-fadeIn">
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 bg-linear-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <i className="fas fa-check text-white text-3xl"></i>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirme su solicitud</h2>
                                    <p className="text-gray-600">Revise los datos antes de enviar</p>
                                </div>

                                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-6 space-y-4">
                                    <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                                        <span className="text-gray-600 font-medium">Tipo de Solicitud:</span>
                                        <span className="font-bold text-gray-900">
                                            {tiposSolicitud.find(t => t.id === tipoSolicitud)?.nombre}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                                        <span className="text-gray-600 font-medium">Solicitante:</span>
                                        <span className="font-semibold text-gray-900">{formData.nombreSolicitante}</span>
                                    </div>
                                    <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                                        <span className="text-gray-600 font-medium">DNI:</span>
                                        <span className="font-semibold text-gray-900">{formData.dniSolicitante}</span>
                                    </div>
                                    <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                                        <span className="text-gray-600 font-medium">Teléfono:</span>
                                        <span className="font-semibold text-gray-900">{formData.telefonoSolicitante}</span>
                                    </div>
                                    {formData.emailSolicitante && (
                                        <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                                            <span className="text-gray-600 font-medium">Email:</span>
                                            <span className="font-semibold text-gray-900">{formData.emailSolicitante}</span>
                                        </div>
                                    )}
                                    {formData.nombreCompleto1 && (
                                        <div className="flex justify-between items-start border-b border-blue-200 pb-3">
                                            <span className="text-gray-600 font-medium">Persona 1:</span>
                                            <span className="font-semibold text-gray-900">{formData.nombreCompleto1}</span>
                                        </div>
                                    )}
                                    {formData.fechaEvento && (
                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-600 font-medium">Fecha del Evento:</span>
                                            <span className="font-semibold text-gray-900">
                                                {new Date(formData.fechaEvento).toLocaleDateString('es-PE')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                    <i className="fas fa-info-circle text-amber-600 mt-0.5"></i>
                                    <div className="text-sm text-amber-800">
                                        <p className="font-semibold mb-1">Importante:</p>
                                        <p>Al confirmar esta solicitud, se generará un número de expediente. Puede hacer seguimiento del trámite desde el panel principal.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="bg-gray-50 px-8 py-6 flex justify-between items-center border-t border-gray-200">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                    currentStep === 1
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md'
                                }`}
                            >
                                <i className="fas fa-arrow-left"></i>
                                Anterior
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={currentStep === 1 && !tipoSolicitud}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                        currentStep === 1 && !tipoSolicitud
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105'
                                    }`}
                                >
                                    Siguiente
                                    <i className="fas fa-arrow-right"></i>
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-8 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                                >
                                    <i className="fas fa-check-circle"></i>
                                    Confirmar Solicitud
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            
        </div>
    );
}