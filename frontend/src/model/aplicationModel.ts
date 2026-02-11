export interface GetAplicationState {
    applications:number;
    delta:number;
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
    status:boolean;
    code:number;
    data:{
        applicationId: number;
        id_usuario: number;
        id_tipo_solicitud: number;
        numero_expediente: string;
        fecha_inicio: string;
        fecha_fin: string | null;
        estado: string;
        fecha_actualizacion: string
    }
}
