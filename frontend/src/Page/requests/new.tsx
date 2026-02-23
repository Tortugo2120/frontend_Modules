import { useEffect, useState, useCallback, useMemo } from "react";
import StepProgressBar from "../../components/requests/new/Stepprogresebar";
import NavigationButtons from "../../components/requests/new/Navigationbuttons";
import useTipoSolici from "../../hooks/useTipoSolici.ts";
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
import { detectFlowType, getStepsForFlow } from "../../config/stepsConfig.ts";
import type { StepConfig } from "../../config/stepsConfig.ts";
import ConfirmationSummary from "../../components/requests/new/Confirmationsummary.tsx";

// Paso fijo siempre presente: selección del tipo de solicitud
const STEP_TIPO: import("../../components/requests/new/Stepprogresebar").StepItem = {
    label: 'Tipo ',
    fullLabel: 'de Solicitud',
    shortLabel: 'Tipo',
};

export default function NewRequest() {
    const [tipoSolicitud, setTipoSolicitud] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const { updateApplicationData, formDataAplication, resetForm, clearMarriageDetails } = ApplicationHandler();
    const { user } = Auth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { error, createSolicitud } = useCreateAplication();
    const { uploadMultipleDocuments, isUploading: isUploadingDocs, uploadProgress } = useUploadDocuments();
    const navigate = useNavigate();
    const { deleteDocuments } = useDocument();
    const [showAlert, setShowAlert] = useState(false);
    const [messAlert, setMessAlert] = useState("");
    const [typeAlert, setTypeAlert] = useState<'info' | 'warning' | 'error' | 'success'>('info');

    // Pasos dinámicos del flujo seleccionado (sin el paso 1 de tipo)
    const [flowSteps, setFlowSteps] = useState<StepConfig[]>([]);
    const [flowLoading, setFlowLoading] = useState(false);

    // currentStep: 1 = selección tipo, 2..N = pasos del flujo
    const [currentStep, setCurrentStep] = useState(1);

    // Validación por paso (clave = índice global del paso)
    const [stepsValidation, setStepsValidation] = useState<Record<number, boolean>>({});

    const { tiposolicitud } = useTipoSolici();

    // ── Sincronizar usuario ────────────────────────────────────────────────────
    useEffect(() => {
        if (user) updateApplicationData({ userId: user.user_id });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // ── Cargar pasos cuando se selecciona el tipo de solicitud ────────────────
    useEffect(() => {
        if (!tipoSolicitud) {
            setFlowSteps([]);
            return;
        }
        const selectedType = tiposolicitud.find(t => t.id === tipoSolicitud);
        if (!selectedType) return;

        setFlowLoading(true);
        const flow = detectFlowType(selectedType.nombre_solicitud);

        // Limpiar detalles de matrimonio si el flujo no lo requiere
        if (flow !== 'matrimonio') clearMarriageDetails();

        getStepsForFlow(flow)
            .then(steps => {
                setFlowSteps(steps);
                // Resetear validaciones al cambiar tipo
                setStepsValidation({ 1: true });
                setCurrentStep(1);
            })
            .finally(() => setFlowLoading(false));

        updateApplicationData({ applicationTypeId: tipoSolicitud });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tipoSolicitud, tiposolicitud]);

    // ── Helpers de alerta ─────────────────────────────────────────────────────
    const mostrarAlert = (message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
        setMessAlert(message);
        setTypeAlert(type);
        setShowAlert(true);
    };

    // ── Envío de la solicitud ─────────────────────────────────────────────────
    const handleConfirmSubmit = async () => {
        try {
            setIsSubmitting(true);
            const documents = await db.obtenerDocuments();
            const response = await createSolicitud(formDataAplication);

            if (response?.status) {
                resetForm();
                const applicationId = response?.data?.applicationId;
                if (!applicationId) throw new Error('No se obtuvo el ID de la solicitud creada');

                if (documents.length > 0) {
                    const documentosParaSubir = documents
                        .filter(doc => doc.file !== null)
                        .map(doc => ({
                            applicationId: Number(applicationId),
                            requirementId: Number(doc.requirementId),
                            file: doc.file as File,
                        }));

                    const uploadResult = await uploadMultipleDocuments(documentosParaSubir);
                    if (uploadResult.success) {
                        await deleteDocuments();
                        mostrarAlert(`Solicitud creada exitosamente con ${documentosParaSubir.length} documento(s) adjunto(s)`, 'success');
                    } else {
                        mostrarAlert('Solicitud creada pero algunos documentos no se pudieron subir', 'warning');
                    }
                } else {
                    mostrarAlert('Solicitud creada exitosamente (sin documentos adjuntos)', 'warning');
                }

                setTimeout(() => {
                    setShowAlert(false);
                    navigate('/dashboard/solicitud/history');
                }, 2000);
            } else if (error) {
                mostrarAlert(`Error al crear la solicitud: ${error}`, 'error');
                setTimeout(() => setShowAlert(false), 3000);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            mostrarAlert(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Navegación ────────────────────────────────────────────────────────────
    const totalSteps = 1 + flowSteps.length; // paso tipo + pasos del flujo

    const nextStep = () => {
        if (currentStep < totalSteps) setCurrentStep(s => s + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(s => s - 1);
    };

    const updateStepValidation = useCallback((step: number, isValid: boolean) => {
        setStepsValidation(prev => {
            if (prev[step] === isValid) return prev;
            return { ...prev, [step]: isValid };
        });
    }, []);

    // ── Selección de tipo de solicitud ────────────────────────────────────────
    const selectedRequestType = tiposolicitud.find(t => t.id === tipoSolicitud);

    const filteredSolicitudes = tiposolicitud.filter(tipo =>
        tipo.nombre_solicitud.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedSolicitudes = useMemo(() => groupSolicitudesByCategory(filteredSolicitudes), [filteredSolicitudes]);
    const categoryOrder = getCategoryOrder();

    const handleSelectTipoSolicitud = (id: number) => {
        const newId = tipoSolicitud === id ? null : id;
        setTipoSolicitud(newId);
        updateStepValidation(1, !!newId);
    };

    // ── Barra de progreso: paso tipo + pasos del flujo ────────────────────────
    const progressSteps = useMemo(() => [
        STEP_TIPO,
        ...flowSteps.map(s => ({ label: s.label, fullLabel: s.fullLabel, shortLabel: s.shortLabel })),
    ], [flowSteps]);

    // ── Determinar si el paso actual puede avanzar ────────────────────────────
    const canProceed = stepsValidation[currentStep] ?? false;

    // ── Componente del paso actual (pasos del flujo empiezan en currentStep 2) ─
    const flowStepIndex = currentStep - 2; // índice dentro de flowSteps
    const currentFlowStep = flowSteps[flowStepIndex];
    const isLastFlowStep = currentFlowStep?.component === ConfirmationSummary;

    return (
        <div className="overflow-hidden">
            <div className="min-h-screen bg-blue-300/40 p-4 sm:p-6 lg:p-6">
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
                    <StepProgressBar
                        currentStep={currentStep}
                        steps={progressSteps}
                    />
                </div>

                <div className="mx-auto">
                    <div className="bg-white rounded-lg shadow-xl overflow-hidden">

                        {/* ── Paso 1: Selección de tipo ── */}
                        {currentStep === 1 && (
                            <div className="p-6 lg:p-6 animate-fadeIn">
                                <div className="flex justify-between items-center flex-col sm:flex-row sm:items-end mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccione el tipo de solicitud</h2>
                                        <p className="text-gray-600">Elija el trámite que desea realizar</p>
                                    </div>

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

                                {filteredSolicitudes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        {categoryOrder.map((category) => {
                                            const solicitudesEnCategoria = groupedSolicitudes[category];
                                            if (!solicitudesEnCategoria || solicitudesEnCategoria.length === 0) return null;
                                            return (
                                                <div key={category}>
                                                    <CategoryAccordion
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

                        {/* ── Cargando flujo ── */}
                        {flowLoading && currentStep === 1 && (
                            <div className="flex justify-center py-6">
                                <span className="loading loading-spinner loading-md text-blue-600"></span>
                            </div>
                        )}

                        {/* ── Pasos dinámicos del flujo ── */}
                        {currentStep >= 2 && currentFlowStep && !isLastFlowStep && (
                            <div className="p-6 lg:p-6 animate-fadeIn">
                                <currentFlowStep.component
                                    tipoSolicitudNombre={selectedRequestType?.nombre_solicitud}
                                    descriptionSolicitud={selectedRequestType?.descripcion}
                                    onValidationChange={(isValid: boolean) => updateStepValidation(currentStep, isValid)}
                                />
                            </div>
                        )}

                        {/* ── Paso de confirmación (último) ── */}
                        {currentStep >= 2 && isLastFlowStep && (
                            <div className="p-6 lg:p-6 animate-fadeIn">
                                {isUploadingDocs && (
                                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <i className="fas fa-cloud-upload-alt text-blue-600 animate-pulse"></i>
                                            <span className="text-sm font-medium text-gray-900">Subiendo documentos...</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%` }}
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

            <NavigationButtons
                currentStep={currentStep}
                totalSteps={totalSteps > 1 ? totalSteps : 2}
                canProceed={canProceed}
                onPrevious={prevStep}
                onNext={nextStep}
            />
        </div>
    );
}