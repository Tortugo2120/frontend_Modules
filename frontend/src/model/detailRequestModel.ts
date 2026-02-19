
export interface ParticipanteDetalle {
    nombre: string;
    rol: 'CONTRAYENTE' | 'TESTIGO' | string;
    numero_identificacion: string;
    tipo_identificacion: string;
    sexo: 'M' | 'F' | string;
    estado_civil: string;
    fecha_nacimiento: string;
    direccion: string;
    telefono: string;
    correo: string;
    ubigeo_completo: string;
    ubigeo:number
}


export interface RequisitoDetalle {
    nombre_requisito: string;
    estado_entrega: string;
    fecha_entrega: string | null;
    observacion: string | null;
}

export interface PagoDetalle {
    numero_comprobante: string | null;
    pagado: string; // Recibido como "0" o "1"
    estado: string;
    fecha_pago: string | null;
}

export interface MatrimonioDetalle {
    fecha: string;
    hora: string;
    direccion: string;
    oficiante: string;
}


export interface ApplicationBackendDetail {
    id: string;
    numero_expediente: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    estado: string;
    fecha_actualizacion: string;
    nombre_solicitud: string;
    descripcion_solicitud: string;
    precio: string;
    encargado: string;
    participantes: ParticipanteDetalle[];
    requisitos: RequisitoDetalle[];
    pago: PagoDetalle;
    matrimonio: MatrimonioDetalle | null;
}


export interface ApplicationDetailResponse {
    status: boolean;
    code: number;
    message: string;
    data: ApplicationBackendDetail;
}

export interface ApplicationDetailItem {
    id: number;
    expediente: string;
    fechaInicio: string;
    fechaFin: string | null;
    estado: string;
    fechaActualizacion: string;
    nombreSolicitud: string;
    descripcionSolicitud: string;
    precio: number;
    encargado: string;
    participantes: ParticipanteDetalle[];
    requisitos: RequisitoDetalle[];
    pago: PagoDetalle;
    matrimonio: MatrimonioDetalle | null;
}