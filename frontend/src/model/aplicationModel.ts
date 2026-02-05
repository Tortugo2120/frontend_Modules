export interface GetAplicationState {
    applications:number;
    delta:number;
}

export  interface AplicationRequest {
    id_usuario:number;
    id_tipo_solicitud:number;
    numero_expediente:string;
}

export interface AplicationResponse {
    status:boolean;
    code:number;
    data:{
        id: number;
        id_usuario: number;
        id_tipo_solicitud: number;
        numero_expediente: string;
        fecha_inicio: string;
        fecha_fin: string | null;
        estado: string;
        fecha_actualizacion: string
    }
}

