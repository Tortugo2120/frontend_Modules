export interface UbigeoParticipant {
    id: number;
    departamento: string;
    provincia: string;
    distrito: string;
}

export interface ParticipantItem {
    id: number;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: string;
    sexo: 'M' | 'F' | string;
    direccion: string;
    correo: string;
    telefono: string;
    estadoCivil: string;
    numeroDocumento: string;
    tipoDocumentoId: number;
    tipoDocumento: string;
    ubigeo: UbigeoParticipant;
    rol: 'CONTRAYENTE' | string;
    testigo: ParticipantItem | null;
}

export interface ParticipantsData {
    contrayente1: ParticipantItem;
    contrayente2: ParticipantItem;
}

export interface ParticipantsResponse {
    status: boolean;
    code: number;
    message: string;
    data: ParticipantsData;
}
