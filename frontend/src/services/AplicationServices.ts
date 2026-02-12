import apiAxios from "../api/Axios.tsx";
import type { 
    CreateApplicationPayload, 
    AplicationResponse, 
    GetAplicationState,
    ListApplicationsResponse,
    ApplicationItem,
    ApplicationBackendItem,
    Pager
} from "../model/aplicationModel.ts";

const transformApplicationData = (backendData: ApplicationBackendItem): ApplicationItem => {
    return {
        id: parseInt(backendData.id),
        expediente: backendData.numero_expediente,
        nombreSolicitud: backendData.nombre_solicitud,
        descripcionSolicitud: backendData.descripcion_solicitud,
        precio: parseFloat(backendData.precio),
        estado: backendData.estado,
        fecha: backendData.fecha_inicio,
        fechaActualizacion: backendData.fecha_actualizacion,
        fechaFin: backendData.fecha_fin,
        encargado: backendData.encargado,
        participantes: backendData.participantes || [],
    };
};

export const PendingApplications = async (): Promise<GetAplicationState> => {
    const response = await apiAxios.get("/api/v1/application/pending");
    return response.data.data;
}

export const CompleteApplications = async (): Promise<GetAplicationState> => {
    const response = await apiAxios.get("/api/v1/application/complete");
    return response.data.data;
}

interface ListApplicationsResult {
    applications: ApplicationItem[];
    pager: Pager;
}

// Simplificado - solo carga todas las solicitudes
export const ListApplications = async (page: number = 1): Promise<ListApplicationsResult> => {
    const response = await apiAxios.get<ListApplicationsResponse>("/api/v1/application", {
        params: { page }
    });
    
    return {
        applications: response.data.data.map(transformApplicationData),
        pager: response.data.pager
    };
}

export const CreateAplication = async (
    aplication: CreateApplicationPayload
): Promise<AplicationResponse> => {
    const response = await apiAxios.post("/api/v1/application", aplication);
    return response.data;
}