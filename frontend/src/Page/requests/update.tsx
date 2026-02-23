import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDetailsApplication } from "../../hooks/useApplicationDetails";
import useCancelApplication from "../../hooks/useCancelApplication";
import UpdateHeader from "../../components/requests/update/UpdateHeader";
import CancelModal from "../../components/requests/update/CancelModal";
import ApplicationSummary from "../../components/requests/update/ApplicationSummary";
import ActionCards from "../../components/requests/update/ActionCards";

const Update_Page = () => {
    const location = useLocation();
    const id = (location.state as { id?: string })?.id;
    const navigate = useNavigate();
    const { application, loading } = useDetailsApplication(id);

    const [showConfirm, setShowConfirm] = useState(false);
    const { loading: cancelling, error: cancelError, cancelApplication } = useCancelApplication();

    const handleCancel = async (motivo: string) => {
        if (!id) return;
        const result = await cancelApplication(id, motivo);
        if (result) {
            setShowConfirm(false);
            navigate(-1);
        }
    };

    return (
        <div className="min-h-screen bg-blue-100 p-3 sm:p-6">
            <UpdateHeader
                onBack={() => navigate(-1)}
                onAnular={() => setShowConfirm(true)}
                showAnular={!!application}
            />

            {showConfirm && (
                <CancelModal
                    expediente={application?.expediente}
                    nombreSolicitud={application?.nombreSolicitud}
                    cancelling={cancelling}
                    cancelError={cancelError}
                    onClose={() => setShowConfirm(false)}
                    onConfirm={handleCancel}
                />
            )}

            {/* Resumen de la solicitud */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4">
                {loading ? (
                    <div className="flex items-center justify-center h-28 gap-3 text-gray-400">
                        <span className="loading loading-spinner loading-md text-indigo-500"></span>
                        <span className="text-sm">Cargando informacion...</span>
                    </div>
                ) : application ? (
                    <ApplicationSummary application={application} />
                ) : (
                    <p className="text-sm text-gray-400 text-center py-8">
                        No se pudo cargar la informacion de la solicitud.
                    </p>
                )}
            </div>

            <ActionCards id={id} application={application ?? null} />
        </div>
    );
};

export default Update_Page;
