import { useEffect, useState, useCallback, useMemo } from "react";
import StepProgressBar from "../../components/requests/new/Stepprogresebar";
import ApplicantForm from "../../components/requests/new/Applicantform";
import ConfirmationSummary from "../../components/requests/new/Confirmationsummary";
import NavigationButtons from "../../components/requests/new/Navigationbuttons";
import useTipoSolici from "../../hooks/useTipoSolici.ts";
import Contrayente from "../../components/requests/new/Matrimonio/Contrayente.tsx";
import Testigos from "../../components/requests/new/Matrimonio/Testigos.tsx";
import Requisitos from "../../components/requests/new/Matrimonio/Requisitos.tsx";
import { ApplicationHandler } from "../../context/ApplicationContext.tsx";
import { Auth } from "../../context/AuthContext.tsx";
import useCreateAplication from "../../hooks/useCreateAplication.ts";
import { useUploadDocuments } from "../../hooks/useUploadDocuments.ts";
import { useNavigate } from "react-router-dom";
import { useDocument } from "../../hooks/useDocument.ts";
import { db } from "../../model/documentModel.ts";
import Alert from "../../components/Alert.tsx";
import CategoryAccordion from "../../components/requests/new/CategoryAccordion";
import { groupSolicitudesByCategory, getCategoryOrder } from "../../Types/requests/SolicitudUtils.ts";
import Weddingdetails from "../../components/requests/new/Weddingdetails.tsx";

export default function NewRequest() {
    const [tipoSolicitud, setTipoSolicitud] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { updateApplicationData, formDataAplication, resetForm } = ApplicationHandler();
    const { user } = Auth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { error, createSolicitud } = useCreateAplication();
    const { uploadMultipleDocuments, isUploading: isUploadingDocs, uploadProgress } = useUploadDocuments();
    const navigate = useNavigate();
    const { deleteDocuments } = useDocument();
    const [showAlert, setShowAlert] = useState(false);
    const [messAlert, setMessAlert] = useState("");
    const [typeAlert, setTypeAlert] = useState<'info' | 'warning' | 'error' | 'success'>('info');

    useEffect(() => {
        if (user) {
            updateApplicationData({ userId: user.user_id });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        if (tipoSolicitud) {
            updateApplicationData({ applicationTypeId: tipoSolicitud });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tipoSolicitud]);

    const { tiposolicitud } = useTipoSolici();
    const [currentStep, setCurrentStep] = useState(1);

    const mostrarAlert = (message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
        setMessAlert(message);
        setTypeAlert(type);
        setShowAlert(true);
    }

    const handleConfirmSubmit = async () => {
        try {
            setIsSubmitting(true);
            const documents = await db.obtenerDocuments();
            //console.log(`Documentos recuperados de IndexedDB: ${documents.length}`);
            //console.log('Preparando para enviar solicitud a la API:', formDataAplication);
            console.log(JSON.stringify(formDataAplication, null, 2));
            const response = await createSolicitud(formDataAplication);

            if (response?.status) {
                console.log('Solicitud creada exitosamente:', response);
                resetForm();
                const applicationId = response?.data?.applicationId;

                if (!applicationId) {
                    throw new Error('No se obtuvo el ID de la solicitud creada');
                }

                if (documents.length > 0) {
                    console.log('Iniciando subida de documentos...');

                    const documentosParaSubir = documents
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
                        await deleteDocuments();
                        console.log('IndexedDB limpiado');
                        mostrarAlert(`Solicitud creada exitosamente con ${documentosParaSubir.length} documento(s) adjunto(s)`, 'success');
                        setTimeout(() => {
                            setShowAlert(false);
                            navigate('/dashboard/solicitud/history');
                        }, 3000);
                    } else {
                        console.warn('Algunos documentos fallaron:', uploadResult.message);
                        mostrarAlert(`Solicitud creada pero algunos documentos fallaron no se pudieron subir`, 'warning');
                        setTimeout(() => {
                            setShowAlert(false);
                            navigate('/dashboard/solicitud/history');
                        }, 3000);
                        return;
                    }
                } else {
                    console.log('ℹNo hay documentos para subir');
                    mostrarAlert('Solicitud creada exitosamente (sin documentos adjuntos)', 'warning');
                    setTimeout(() => {
                        setShowAlert(false);
                        navigate('/dashboard/solicitud/history');
                    }, 3000);
                }
            } else if (error) {
                console.error('Error al crear solicitud:', error);
                setShowAlert(true);
                setTypeAlert('error');
                setMessAlert(`Error al crear la solicitud: ${error}`);
                setTimeout(() => setShowAlert(false), 3000);
            }
        } catch (error) {
            console.error('Error en el proceso:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            console.log(errorMessage);
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

    const groupedSolicitudes = useMemo(() => {
        return groupSolicitudesByCategory(filteredSolicitudes);
    }, [filteredSolicitudes]);

    const categoryOrder = getCategoryOrder();

    const [stepsValidation, setStepsValidation] = useState<{ [key: number]: boolean }>({
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false
    });

    const updateStepValidation = useCallback((step: number, isValid: boolean) => {
        setStepsValidation(prev => ({
            ...prev,
            [step]: isValid
        }));
    }, []);

    const handleSelectTipoSolicitud = (id: number) => {
        setTipoSolicitud(prev => prev === id ? null : id);
        if (id) {
            updateStepValidation(1, true);
        } else {
            updateStepValidation(1, false);
        }
    };

    return (
        <div className="overflow-hidden">
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
                            {/* Step 1: Selección de tipo de solicitud */}
                            {currentStep === 1 && (
                                <div className="p-6 lg:p-6 animate-fadeIn">
                                    <div className="flex justify-between items-center flex-col sm:flex-row sm:items-end mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccione el tipo de solicitud</h2>
                                            <p className="text-gray-600">Elija el trámite que desea realizar</p>
                                        </div>

                                        {/* Buscador */}
                                        <div className="w-full sm:w-auto sm:min-w-75 mt-4 sm:mt-0">
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

                                    {/* Acordeones agrupados por categoría */}
                                    {filteredSolicitudes.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                            {categoryOrder.map((category) => {
                                                const solicitudesEnCategoria = groupedSolicitudes[category];

                                                // Solo mostrar categorías que tienen solicitudes
                                                if (!solicitudesEnCategoria || solicitudesEnCategoria.length === 0) {
                                                    return null;
                                                }

                                                return (
                                                    <div>
                                                        <CategoryAccordion
                                                            key={category}
                                                            categoryName={category}
                                                            solicitudes={solicitudesEnCategoria}
                                                            selectedId={tipoSolicitud}
                                                            onSelect={handleSelectTipoSolicitud}
                                                            defaultOpen={false}
                                                        />
                                                    </div>
                                                );
                                            })}
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
                                        <ApplicantForm
                                            tipoSolicitudNombre={selectedRequestType?.nombre_solicitud}
                                            descriptionSolicitud={selectedRequestType?.descripcion}
                                            onValidationChange={(isValid) => updateStepValidation(2, isValid)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 3: contrayente */}
                            {currentStep === 3 && (
                                <div className="p-6 lg:p-6">
                                    <Contrayente
                                        tipoSolicitudNombre={selectedRequestType?.nombre_solicitud}
                                        descriptionSolicitud={selectedRequestType?.descripcion}
                                        onValidationChange={(isValid) => updateStepValidation(3, isValid)} />
                                </div>
                            )}

                            {/* Step 4: testigo */}
                            {currentStep === 4 && (
                                <div className="p-6 lg:p-6">
                                    <Testigos
                                        tipoSolicitudNombre={selectedRequestType?.nombre_solicitud}
                                        descriptionSolicitud={selectedRequestType?.descripcion}
                                        onValidationChange={(isValid) => updateStepValidation(4, isValid)} />
                                </div>
                            )}

                            {/* Step 5: requisitos */}
                            {currentStep === 5 && (
                                <div className="p-6 lg:p-6">
                                    <Weddingdetails
                                        tipoSolicitudNombre={selectedRequestType?.nombre_solicitud}
                                        descriptionSolicitud={selectedRequestType?.descripcion}
                                        onValidationChange={(isValid) => updateStepValidation(5, isValid)} />
                                </div>
                            )}

                            {/* Step 6: requisitos */}
                            {currentStep === 6 && (
                                <div className="p-6 lg:p-6">
                                    <Requisitos
                                        tipoSolicitudNombre={selectedRequestType?.nombre_solicitud}
                                        descriptionSolicitud={selectedRequestType?.descripcion}
                                        onValidationChange={(isValid) => updateStepValidation(6, isValid)} />
                                </div>
                            )}

                            {/* Step 7: confirmacion */}
                            {currentStep === 7 && (
                                <div className="p-6 lg:p-6">
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
                                        precio={selectedRequestType?.precio}
                                        applicationData={formDataAplication}
                                        onConfirm={handleConfirmSubmit}
                                        isSubmitting={isSubmitting || isUploadingDocs}
                                    />
                                    {showAlert && (
                                        <Alert message={messAlert} type={typeAlert} onClose={() => setShowAlert(false)} />
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
            <NavigationButtons
                currentStep={currentStep}
                totalSteps={7}
                canProceed={currentStep === 1 ? !!tipoSolicitud : (stepsValidation[currentStep] || false)}
                onPrevious={prevStep}
                onNext={nextStep}
            />
        </div>
    );
}