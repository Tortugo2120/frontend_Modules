// Interfaz para participantes
export interface ParticipanteDetalle {
    nombre: string;
    rol: string;
    numero_identificacion: string;  
    tipo_identificacion: string;
}

// Interfaz para la paginación
export interface Pager {
    currentUri: object;
    uri: object;
    hasMore: boolean;
    total: number;
    perPage: number;
    pageCount: number;
    pageSelector: string;
    currentPage: number;
    next: number | null;
    previous: number | null;
    segment: number;
}

// Interfaz para la respuesta del backend
export interface ApplicationBackendItem {
    id: string;
    encargado: string;
    precio: string;
    nombre_solicitud: string;
    descripcion_solicitud: string;
    numero_expediente: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    estado: string;
    fecha_actualizacion: string;
    participantes: ParticipanteDetalle[];
}

// Interfaz para usar en el frontend (ya transformada)
export interface ApplicationItem {
    id: number;
    expediente: string;
    nombreSolicitud: string;
    descripcionSolicitud: string;
    precio: number;
    estado: string;
    fecha: string;
    fechaActualizacion: string;
    fechaFin: string | null;
    encargado: string;
    participantes: ParticipanteDetalle[];
    observaciones?: string;
}

// Respuesta de la API
export interface ListApplicationsResponse {
    status: boolean;
    code: number;
    message: string;
    data: ApplicationBackendItem[];
    pager: Pager;
}

// ... resto de tus interfaces existentes
export interface GetAplicationState {
    applications: number;
    delta: number;
}

export type ParticipantRol = 'solicitante' | 'contrayente' | 'testigo';

export type Gender = 'M' | 'F';

export interface Participant {
    cui: string;
    documentTypeId: number;
    names: string;
    paternalSurname: string;
    maternalSurname: string;
    birthdate: string;
    gender: Gender;
    address: string;
    email: string;
    phone: string;
    ubigeoId: string;
    maritalStatus: string;
    rol: ParticipantRol;
}

export interface ApplicationData {
    userId: number;
    applicationTypeId: number;
    expedientNumber: string;
}

export interface RequisitoEstado {
    requirementId: number | string;
    delivered: number;
}

export interface CreateApplicationPayload {
    application: ApplicationData;
    participants: Participant[];
    requirements?: RequisitoEstado[];
}

export interface AplicationResponse {
    status: boolean;
    code: number;
    data: {
        applicationId: number;
        id_usuario: number;
        id_tipo_solicitud: number;
        numero_expediente: string;
        fecha_inicio: string;
        fecha_fin: string | null;
        estado: string;
        fecha_actualizacion: string;
    }
}