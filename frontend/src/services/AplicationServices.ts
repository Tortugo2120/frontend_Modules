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

// Función helper para transformar los datos del backend al formato del frontend
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
        participantes: backendData.participantes,
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

export const ListApplications = async (
    page: number = 1,
    searchTerm?: string,
    tipo?: string,
    estado?: string
): Promise<ListApplicationsResult> => {
    // Construir parámetros de búsqueda
    const params: any = { page };
    
    if (searchTerm) params.search = searchTerm;
    if (tipo) params.tipo = tipo;
    if (estado) params.estado = estado;
    
    const response = await apiAxios.get<ListApplicationsResponse>("/api/v1/application", { params });
    
    return {
        applications: response.data.data.map(transformApplicationData),
        pager: response.data.pager
    };
}

export const CreateAplication = async (aplication: CreateApplicationPayload): Promise<AplicationResponse> => {
    const response = await apiAxios.post("/api/v1/application", aplication);
    return response.data;
}