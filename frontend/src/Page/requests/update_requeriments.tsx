import { useParams, useNavigate } from "react-router-dom";
import { useGetRequirementsByApplication } from "../../hooks/useGetRequirementsByApplication.ts";
import { RequirementsDisplay } from "../../components/requests/RequirementsDisplay.tsx";

const Update = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const applicationId = id ? parseInt(id, 10) : null;
    const { requirements, loading, error } = useGetRequirementsByApplication(applicationId);

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
            {/* Header */}
            <div className="">

                <div className="bg-white rounded-t-lg shadow-lg p-6">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <i className="fas fa-list-check text-indigo-600 text-xl"></i>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Requerimientos de la Solicitud</h1>
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
                    />
                </div>

                {/* Botones de Acción */}
                <div className="mt-6 flex gap-3 justify-end">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-soft btn-secondary border-secondary gap-2"
                    >
                        <i className="fas fa-times mr-2"></i>
                        Cerrar
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary gap-2"
                    >
                        <i className="fas fa-sync"></i>
                        Actualizar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Update;