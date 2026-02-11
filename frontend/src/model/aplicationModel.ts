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
<<<<<<< HEAD
    requirementId: number | string; 
    delivered: boolean;
=======
    requirementId: number | string;
    delivered: number;
>>>>>>> fee5d2f5bc3bbf7c95d725ce4e9417c4779bd9ab
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
