import type {ApplicationBackendItem} from "./aplicationModel.ts";

export interface Application {
    id: string;
    id_usuario: string;
    id_tipo_solicitud: string;
    numero_expediente: string;
    fecha_inicio: string; // Formato "YYYY-MM-DD HH:mm:ss"
    fecha_fin: string | null;
    estado: 'Pendiente' | 'En Proceso' | 'Completada' | 'Anulada';
    fecha_actualizacion: string;
    nombre_solicitud: string;
}

export interface Pager {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
}

export interface ApiResponse {
    status: boolean;
    code: number;
    message: string;
    data: ApplicationBackendItem[];
    pager: Pager;
}

export interface ApiRequestFilters{
    beginDate?:string;
    endDate?:string;
    ApplicationType:number;
    page:0;
    state:string;
}