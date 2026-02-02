export type TipoSolicitud = 'matrimonio' | 'divorcio' | 'nacimiento' | 'defuncion' | 'copia';

export interface FormData {
    // Datos del solicitante
    nombreSolicitante: string;
    dniSolicitante: string;
    telefonoSolicitante: string;
    emailSolicitante: string;
    direccionSolicitante: string;

    // Datos específicos según tipo
    nombreCompleto1: string;
    dniPersona1: string;
    nombreCompleto2: string;
    dniPersona2: string;
    fechaEvento: string;
    lugarEvento: string;

    // Documentos y observaciones
    documentosAdjuntos: string;
    observaciones: string;
}

export interface RequestType {
    id: TipoSolicitud;
    nombre: string;
    icon: string;
    descripcion: string;
    color: string;
    colorOpacity: string;
    ringColor: string;
}

export interface ApplicantData {
    nombreSolicitante: string;
    dniSolicitante: string;
    telefonoSolicitante: string;
    emailSolicitante: string;
    direccionSolicitante: string;
}

export interface EventData {
    nombreCompleto1: string;
    dniPersona1: string;
    nombreCompleto2: string;
    dniPersona2: string;
    fechaEvento: string;
    lugarEvento: string;
}