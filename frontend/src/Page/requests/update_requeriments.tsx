import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useGetRequirementsByApplication } from "../../hooks/useGetRequirementsByApplication.ts";
import { useUpdateRequeriments } from "../../hooks/useUpdateRequeriments.ts";
import { useUploadDocuments } from "../../hooks/useUploadDocuments.ts";
import { RequirementsDisplay } from "../../components/requests/RequirementsDisplay.tsx";
import type { RequirementUpdate } from "../../components/requests/RequirementsDisplay.tsx";
import type { RequieremntUpdate } from "../../model/requerimentsModel.ts";

const Update = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const applicationId = id ? parseInt(id, 10) : null;
    const { requirements, loading, error } = useGetRequirementsByApplication(applicationId);
    const { updateRequirements, isUpdating } = useUpdateRequeriments();
    const { uploadMultipleDocuments, isUploading, uploadProgress } = useUploadDocuments();

    const [requirementUpdates, setRequirementUpdates] = useState<RequirementUpdate[]>([]);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const handleRequirementsChange = (updates: RequirementUpdate[]) => {
        setRequirementUpdates(updates);
    };

    const handleSaveChanges = async () => {
        if (!applicationId || requirementUpdates.length === 0) {
            setAlertMessage("No hay cambios para guardar");
            setShowErrorAlert(true);
            setTimeout(() => setShowErrorAlert(false), 3000);
            return;
        }

        try {
            const requirementsData: RequieremntUpdate[] = requirementUpdates.map(update => ({
                requirementId: update.requirementId,
                delivered: update.delivered,
                observation: update.observation
            }));

            const updateResponse = await updateRequirements(applicationId, requirementsData);

            if (!updateResponse.status) {
                throw new Error(updateResponse.message || 'Error al actualizar requisitos');
            }

            const documentsToUpload = requirementUpdates
                .filter(update => update.file)
                .map(update => ({
                    applicationId,
                    requirementId: update.requirementId,
                    file: update.file!
                }));

            if (documentsToUpload.length > 0) {
                const uploadResponse = await uploadMultipleDocuments(documentsToUpload);

                if (!uploadResponse.success) {
                    setAlertMessage(`Requisitos actualizados, pero algunos archivos fallaron: ${uploadResponse.message}`);
                    setShowErrorAlert(true);
                    setTimeout(() => {
                        setShowErrorAlert(false);
                        window.location.reload();
                    }, 3000);
                    return;
                }
            }

            setAlertMessage("Requisitos actualizados exitosamente");
            setShowSuccessAlert(true);
            setTimeout(() => {
                setShowSuccessAlert(false);
                window.location.reload();
            }, 3000);

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Error al guardar cambios';
            setAlertMessage(errorMsg);
            setShowErrorAlert(true);
            setTimeout(() => setShowErrorAlert(false), 3000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-blue-300/40 p-4 sm:p-6">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="inline-block">
                            <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                        </div>
                        <p className="mt-4 text-gray-600 font-medium">Cargando requerimientos...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-300/40 p-4 sm:p-6">
            {/* Alertas de éxito y error */}
            {showSuccessAlert && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in">
                    <div className="alert alert-success shadow-lg">
                        <i className="fas fa-check-circle text-xl"></i>
                        <span>{alertMessage}</span>
                    </div>
                </div>
            )}

            {showErrorAlert && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in">
                    <div className="alert alert-error shadow-lg">
                        <i className="fas fa-exclamation-circle text-xl"></i>
                        <span>{alertMessage}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="">

                <div className="bg-white rounded-t-lg shadow-lg p-6 pb-2 border-b border-gray-200">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <i className="fas fa-list-check text-indigo-600 text-xl"></i>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Actualizar requerimientos de la Solicitud</h1>
                                <p className="text-gray-600 mt-1">Revisa el estado de los requerimientos para esta solicitud</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="btn btn-soft btn-secondary border-secondary gap-2"
                        >
                            <i className="fas fa-times mr-2"></i>
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="">
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 p-4 flex items-start gap-3">
                        <i className="fas fa-exclamation-circle text-red-600 text-lg mt-1"></i>
                        <div>
                            <h4 className="font-semibold text-red-900">Error al cargar</h4>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <i className="fas fa-redo mr-2"></i>
                                Reintentar
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-b-lg shadow-lg p-6">
                    <RequirementsDisplay
                        requirements={requirements}
                        onRequirementsChange={handleRequirementsChange}
                    />
                </div>

                {/* Indicador de progreso de subida */}
                {isUploading && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <span className="loading loading-spinner loading-sm text-blue-600"></span>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900">
                                    Subiendo documentos... {uploadProgress.current} de {uploadProgress.total}
                                </p>
                                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botones de Acción */}
                <div className="mt-6 flex gap-3 justify-end">
                    <button
                        onClick={() => navigate(-1)}
                        disabled={isUpdating || isUploading}
                        className="btn btn-soft btn-secondary border-secondary gap-2"
                    >
                        <i className="fas fa-times mr-2"></i>
                        Cerrar
                    </button>
                    <button
                        onClick={handleSaveChanges}
                        className="btn btn-primary gap-2"
                        disabled={isUpdating || isUploading || requirementUpdates.length === 0}
                    >
                        {isUpdating ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save"></i>
                                Guardar Cambios
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Update;