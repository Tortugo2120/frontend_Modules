import {useEffect, useState} from "react";
import StepProgressBar from "../../components/requests/new/Stepprogresebar";
import RequestTypeCard from "../../components/requests/new/Requesttypecard";
import ApplicantForm from "../../components/requests/new/Applicantform";
import ConfirmationSummary from "../../components/requests/new/Confirmationsummary";
import NavigationButtons from "../../components/requests/new/Navigationbuttons";
import useTipoSolici from "../../hooks/useTipoSolici.ts";
import Contrayente from "../../components/requests/new/Matrimonio/Contrayente.tsx";
import Testigos from "../../components/requests/new/Matrimonio/Testigos.tsx";
import Requisitos, {
    limpiarIndexedDB,
    obtenerArchivosDeIndexedDB
} from "../../components/requests/new/Matrimonio/Requisitos.tsx";
import {ApplicationHandler} from "../../context/ApplicationContext.tsx";
import {Auth} from "../../context/AuthContext.tsx";
import useCreateAplication from "../../hooks/useCreateAplication.ts";
import { useUploadDocuments } from "../../hooks/useUploadDocuments.ts";
import {useNavigate} from "react-router-dom";
export default function NewRequest() {
    const [tipoSolicitud, setTipoSolicitud] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const {updateApplicationData, formDataAplication} = ApplicationHandler();
    const {user} = Auth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {error,createSolicitud,success} = useCreateAplication();
    const { uploadMultipleDocuments, isUploading: isUploadingDocs, uploadProgress } = useUploadDocuments();
    const navigate = useNavigate();

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

    const handleConfirmSubmit = async () => {
        try {
            setIsSubmitting(true);

            console.log('📤 Preparando para enviar solicitud a la API:', formDataAplication);

            const response = await createSolicitud(formDataAplication);

            if (response && success) {
                console.log('Solicitud creada exitosamente:', response);

                const applicationId = response?.data?.applicationId;

                if (!applicationId) {
                    throw new Error('No se obtuvo el ID de la solicitud creada');
                }

                console.log('ID de solicitud:', applicationId);

                const documentosGuardados = await obtenerArchivosDeIndexedDB();
                console.log(`Documentos recuperados de IndexedDB: ${documentosGuardados.length}`);

                if (documentosGuardados.length > 0) {
                    console.log('Iniciando subida de documentos...');

                    const documentosParaSubir = documentosGuardados
                        .filter(doc => doc.file !== null)
                        .map(doc => ({
                            applicationId: Number(applicationId),
                            requirementId: Number(doc.requirementId),
                            file: doc.file as File
                        }));

                    console.log(`Total de documentos a subir: ${documentosParaSubir.length}`);

                    const uploadResult = await uploadMultipleDocuments(documentosParaSubir);

                    if (uploadResult.success) {
                        console.log('Todos los documentos subidos exitosamente');

                        await limpiarIndexedDB();
                        console.log('IndexedDB limpiado');

                        alert(`Solicitud creada exitosamente con ${documentosParaSubir.length} documento(s) adjunto(s)`);
                    } else {
                        console.warn('Algunos documentos fallaron:', uploadResult.message);
                        alert(
                            `Solicitud creada pero algunos documentos fallaron:\n\n` +
                            `${uploadResult.message}\n\n` +
                            `Los documentos permanecen guardados localmente para reintentarlo más tarde.`
                        );
                    }
                } else {
                    console.log('ℹNo hay documentos para subir');
                    alert('Solicitud creada exitosamente (sin documentos adjuntos)');
                }
                //navigate('/solicitud/history');
            } else if (error) {
                console.error('Error al crear solicitud:', error);
                alert(`Error al crear solicitud: ${error}`);
            }

        } catch (error) {
            console.error('❌ Error en el proceso:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            alert(`Error: ${errorMessage}`);
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
                                        descriptionSolicitud={selectedRequestType?.descripcion}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: contrayente */}
                        {currentStep === 3 && (
                            <div className="p-6 lg:p-6">
                                <Contrayente 
                                tipoSolicitudNombre={selectedRequestType?.nombre_solicitud}
                                descriptionSolicitud={selectedRequestType?.descripcion} />
                            </div>
                        )}
                        {/* Step 4: testigo */}
                        {currentStep === 4 && (
                            <div className="p-6 lg:p-6">
                                <Testigos 
                                tipoSolicitudNombre={selectedRequestType?.nombre_solicitud} 
                                descriptionSolicitud={selectedRequestType?.descripcion} />
                            </div>
                        )}
                        {/* Step 5: requisitos */}
                        {currentStep === 5 && (
                            <div className="p-6 lg:p-6">
                                <Requisitos 
                                tipoSolicitudNombre={selectedRequestType?.nombre_solicitud}
                                descriptionSolicitud={selectedRequestType?.descripcion}
                                 />
                            </div>
                        )}
                       
                        {/* Step 6: confirmacion */}
                        {currentStep === 6 && ( 
                            <div className="p-6 lg:p-6">
                                {/* Barra de progreso de subida de documentos */}
                                {isUploadingDocs && (
                                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <i className="fas fa-cloud-upload-alt text-blue-600 animate-pulse"></i>
                                            <span className="text-sm font-medium text-gray-900">
                                                Subiendo documentos...
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%`
                                                }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">
                                            {uploadProgress.current} de {uploadProgress.total} archivo(s)
                                        </p>
                                    </div>
                                )}

                                <ConfirmationSummary
                                    tipoSolicitud={tipoSolicitud}
                                    tipoNombre={selectedRequestType?.nombre_solicitud}
                                    descriptionSolicitud={selectedRequestType?.descripcion}
                                    applicationData={formDataAplication}
                                    onConfirm={handleConfirmSubmit}
                                    isSubmitting={isSubmitting || isUploadingDocs}
                                />
                            </div>
                        )}

                        <NavigationButtons
                            currentStep={currentStep}
                            totalSteps={6}
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