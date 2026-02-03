import { useState } from "react";
import StepProgressBar from "../../components/requests/Stepprogresebar.tsx";
import RequestTypeCard from "../../components/requests/Requesttypecard";
import ApplicantForm from "../../components/requests/Applicantform";
import EventForm from "../../components/requests/Eventform";
import ConfirmationSummary from "../../components/requests/Confirmationsummary";
import NavigationButtons from "../../components/requests/Navigationbuttons";
import { type TipoSolicitud, REQUEST_TYPES } from "../../Types/requests/Constants";
import useTipoSolici from "../../hooks/useTipoSolici.ts";

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
    const  {tiposolicitud} = useTipoSolici();
    const [currentStep, setCurrentStep] = useState(1);

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

    const selectedRequestType = REQUEST_TYPES.find(t => t.id === tipoSolicitud);
    return (
        <div className="min-h-screen bg-blue-300/40 from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-6">
            {/* Header */}
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

                {/* Progress Bar */}
                <StepProgressBar currentStep={currentStep} />
            </div>

            {/* Form Container */}
            <div className="mx-auto">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Tipo de Solicitud */}
                        {currentStep === 1 && (
                            <div className="p-6 lg:p-6 animate-fadeIn">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccione el tipo de solicitud</h2>
                                <p className="text-gray-600 mb-8">Elija el trámite que desea realizar</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    {REQUEST_TYPES.map((tipo) => (
                                        <RequestTypeCard
                                            key={tipo.id}
                                            tipo={tipo}
                                            isSelected={tipoSolicitud === tipo.id}
                                            onSelect={setTipoSolicitud}
                                        />
                                    ))}

                                    {tiposolicitud.map((tipo) => (
                                        <span key={tipo.id}>
                                            <p>{tipo.nombre_solicitud}</p>
                                            <p>{tipo.precio}</p>
                                        </span>
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
                                    <ApplicantForm formData={formData} onChange={handleInputChange} />

                                    {/* Datos del Evento */}
                                    <EventForm
                                        tipoSolicitud={tipoSolicitud}
                                        formData={formData}
                                        onChange={handleInputChange}
                                    />

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
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all resize-none"
                                            placeholder="Agregue cualquier información adicional relevante..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirmación */}
                        {currentStep === 3 && (
                            <div className="p-6 lg:p-6">
                                <ConfirmationSummary
                                    tipoSolicitud={tipoSolicitud}
                                    tipoNombre={selectedRequestType?.nombre}
                                    formData={formData}
                                />
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <NavigationButtons
                            currentStep={currentStep}
                            totalSteps={3}
                            canProceed={currentStep === 1 ? !!tipoSolicitud : true}
                            onPrevious={prevStep}
                            onNext={nextStep}
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}