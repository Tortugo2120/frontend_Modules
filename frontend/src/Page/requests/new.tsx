import {useEffect, useState} from "react";
import StepProgressBar from "../../components/requests/new/Stepprogresebar";
import RequestTypeCard from "../../components/requests/new/Requesttypecard";
import ApplicantForm from "../../components/requests/new/Applicantform";
import ConfirmationSummary from "../../components/requests/new/Confirmationsummary";
import NavigationButtons from "../../components/requests/new/Navigationbuttons";
import useTipoSolici from "../../hooks/useTipoSolici.ts";
import Contrayente from "../../components/requests/new/Matrimonio/Contrayente.tsx";
import Testigos from "../../components/requests/new/Matrimonio/Testigos.tsx";
import Requisitos from "../../components/requests/new/Matrimonio/Requisitos.tsx";
import {ApplicationHandler} from "../../context/ApplicationContext.tsx";
import {Auth} from "../../context/AuthContext.tsx";
import useCreateAplication from "../../hooks/useCreateAplication.ts";

export default function NewRequest() {
    const [tipoSolicitud, setTipoSolicitud] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const {updateApplicationData, formDataAplication} = ApplicationHandler();
    const {user} = Auth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {error,createSolicitud,success} = useCreateAplication();

    const handleSelectTipoSolicitud = (id: number) => {
        setTipoSolicitud(prev =>
            prev === id ? null : id
        );
    };

    useEffect(() => {
        if (user) {
            updateApplicationData({ userId: user.user_id });
        }
    }, [user, updateApplicationData]);

    useEffect(() => {
        if (tipoSolicitud) {
            updateApplicationData({ applicationTypeId: tipoSolicitud });
        }
    }, [tipoSolicitud, updateApplicationData]);


    const { tiposolicitud } = useTipoSolici();
    const [currentStep, setCurrentStep] = useState(1);

    // Función para enviar la solicitud a la API
    const handleConfirmSubmit = async () => {
        try {
            setIsSubmitting(true);

            console.log('Preparando para enviar solicitud a la API:', formDataAplication);
            console.log('✅ Data lista para enviar:', JSON.stringify(formDataAplication, null, 2));
            const response = await createSolicitud(formDataAplication);

            if (response && success) {
                console.log('Solicitud creada exitosamente:', response);
                alert('Solicitud creada exitosamente');
                // navigate('/solicitudes');
            } else if (error) {
                console.error('Error al crear solicitud:', error);
                alert(`Error: ${error}`);
            }

        } catch (error) {
            console.error('Error al enviar la solicitud:', error);
            console.log(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (currentStep < 7) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const selectedRequestType = tiposolicitud.find(tipo => tipo.id === tipoSolicitud);

    // Filtrar solicitudes según el término de búsqueda
    const filteredSolicitudes = tiposolicitud.filter(tipo =>
        tipo.nombre_solicitud.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <div className="min-h-screen bg-blue-300/40 from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-6">
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
                <StepProgressBar currentStep={currentStep} />
            </div>

            {/* Form Container */}
            <div className="mx-auto">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <div>
                        {/* Step 1: Tipo de Solicitud */}
                        {currentStep === 1 && (
                            <div className="p-6 lg:p-6 animate-fadeIn">
                                <div className="flex justify-between items-center flex-col sm:flex-row sm:items-end">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccione el tipo de solicitud</h2>
                                        <p className="text-gray-600 mb-6">Elija el trámite que desea realizar</p>
                                    </div>

                                    {/* Buscador */}
                                    <div className="mb-6">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <i className="fas fa-search text-gray-400"></i>
                                            </div>
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Buscar tipo de solicitud..."
                                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all"
                                            />
                                            {searchTerm && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSearchTerm("")}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            )}
                                        </div>
                                        {searchTerm && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                {filteredSolicitudes.length} resultado{filteredSolicitudes.length !== 1 ? 's' : ''} encontrado{filteredSolicitudes.length !== 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {/* Grid de solicitudes */}
                                {filteredSolicitudes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {filteredSolicitudes.map((tipo) => (
                                            <RequestTypeCard
                                                key={tipo.id}
                                                id={tipo.id}
                                                nombre={tipo.nombre_solicitud.toUpperCase()}
                                                descripcion={tipo.descripcion}
                                                precio={tipo.precio}
                                                isSelected={tipoSolicitud === tipo.id}
                                                onSelect={handleSelectTipoSolicitud}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <i className="fas fa-search text-gray-300 text-5xl mb-4"></i>
                                        <p className="text-gray-500 text-lg">No se encontraron solicitudes</p>
                                        <p className="text-gray-400 text-sm mt-2">Intenta con otros términos de búsqueda</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Formulario de Datos */}
                        {currentStep === 2 && (
                            <div className="p-6 lg:p-6 animate-fadeIn">
                                <div className="space-y-8">
                                    {/* Datos del Solicitante */}
                                    <ApplicantForm
                                        tipoSolicitudNombre={selectedRequestType?.nombre_solicitud}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: contrayente */}
                        {currentStep === 3 && (
                            <div className="p-6 lg:p-6">
                                <Contrayente tipoSolicitudNombre={selectedRequestType?.nombre_solicitud} />
                            </div>
                        )}
                        {/* Step 4: testigo */}
                        {currentStep === 4 && (
                            <div className="p-6 lg:p-6">
                                <Testigos tipoSolicitudNombre={selectedRequestType?.nombre_solicitud} />
                            </div>
                        )}
                        {/* Step 5: requisitos */}
                        {currentStep === 5 && (
                            <div className="p-6 lg:p-6">
                                <Requisitos tipoSolicitudNombre={selectedRequestType?.nombre_solicitud} />
                            </div>
                        )}
                        {/* Step 6: resumen */}
                        {/*currentStep === 6 && (
                            <div className="p-6 lg:p-6">
                                <ResumenSolicitud
                                    tipoSolicitudNombre={selectedRequestType?.nombre_solicitud}
                                />
                            </div>
                        )*\}
                        {/* Step 7: confirmacion */}
                        {currentStep === 6 && (
                            <div className="p-6 lg:p-6">
                                <ConfirmationSummary
                                    tipoSolicitud={tipoSolicitud}
                                    tipoNombre={selectedRequestType?.nombre_solicitud}
                                    applicationData={formDataAplication}
                                    onConfirm={handleConfirmSubmit}
                                    isSubmitting={isSubmitting}
                                />
                            </div>
                        )}

                        <NavigationButtons
                            currentStep={currentStep}
                            totalSteps={7}
                            canProceed={currentStep === 1 ? !!tipoSolicitud : true}
                            onPrevious={prevStep}
                            onNext={nextStep}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}