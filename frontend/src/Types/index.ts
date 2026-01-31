export type Solicitud = {
    expediente: string;
    tipo: string;
    solicitante: string;
    estado: 'Pendiente' | 'Completado' | 'En Proceso' | 'Observado';
    fecha: string;
}

export type Actividad = {
    tipo: 'pago' | 'documento' | 'espera' | 'nueva';
    titulo: string;
    descripcion: string;
    tiempo: string;
}

export type RecaudacionData = {
    mes: string;
    monto: number;
}