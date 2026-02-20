import apiAxios from "../api/Axios.tsx";
import type {
    CreateApplicationPayload,
    AplicationResponse,
    GetAplicationState,
    ListApplicationsResponse,
    ApplicationItem,
    ApplicationBackendItem,
    Pager,
    CancelApplicationResponse
} from "../model/aplicationModel.ts";
import type { ApiResponse } from "../model/aplicationFilterModel.ts";

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

export const ValidateExpediente = async (expedientNumber: string, controller: any) => {
    try {
        const response = await apiAxios.get('/api/v1/application/validateExpedient', {
            params: { expedientNumber },
            signal: controller.signal
        });
        return response.data;
    } catch (error: any) {
        // Si el error es un 409, es una respuesta válida del negocio (expediente existe)
        if (error.response && error.response.status === 409) {
            return error.response.data;
        }
        // Para cualquier otro error, lo relanzamos
        throw error;
    }
}

export const ExportApplicationById = async (id: number): Promise<void> => {
    try {
        const response = await apiAxios.get(`/api/v1/application/export/${id}`, {
            responseType: 'blob', // Indicar que esperamos un archivo
        });

        // Extraer el nombre del archivo de las cabeceras de respuesta
        const contentDisposition = response.headers['content-disposition'];
        let filename = `Solicitud-${id}.pdf`; // Nombre por defecto
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (filenameMatch && filenameMatch.length > 1) {
                filename = filenameMatch[1];
            }
        }

        // Crear una URL para el blob y simular un clic para descargar
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        // Limpiar
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error al exportar la solicitud:", error);
        throw new Error("No se pudo exportar la solicitud.");
    }
};

export const FilterAplications = async (
    filters: any,
    controller: any
): Promise<ApiResponse> => {
    console.log(filters);
    const response = await apiAxios.get("/api/v1/application/filter", {
        params: filters,
        signal: controller.signal
    });
    return response.data;
}

export interface ExportExcelFilters {
    state?: string;
    beginDate?: string;
    endDate?: string;
    ApplicationType?: number;
}

export const ExportApplicationsExcel = async (filters?: ExportExcelFilters): Promise<void> => {
    try {
        const params: Record<string, string | number> = {};
        if (filters?.state) params.state = filters.state;
        if (filters?.beginDate) params.beginDate = filters.beginDate;
        if (filters?.endDate) params.endDate = filters.endDate;
        if (filters?.ApplicationType) params.ApplicationType = filters.ApplicationType;

        const response = await apiAxios.get('/api/v1/report/build', {
            params,
            responseType: 'blob',
        });

        const contentDisposition = response.headers['content-disposition'];
        let filename = `Reporte_Solicitudes_${new Date().toISOString().slice(0, 10)}.xlsx`;
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
            if (filenameMatch && filenameMatch.length > 1) {
                filename = filenameMatch[1];
            }
        }

        const url = window.URL.createObjectURL(new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error al exportar reporte Excel:', error);
        throw new Error('No se pudo exportar el reporte en Excel.');
    }
};

//Anular solicitud
export const CancelApplication = async (id: string): Promise<CancelApplicationResponse> => {
    const response = await apiAxios.delete(`/api/v1/application/${id}`);
    return response.data;
};

export const SearchApplication = async (dni:string|null,applicationNumber:string|null):Promise<ApiResponse>=>{
    const response = await apiAxios.get('/api/v1/application/search', {
        params: { cui:dni, expedientNumber:applicationNumber }
    });
    return response.data;
}