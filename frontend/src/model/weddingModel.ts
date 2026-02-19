// Payload para actualizar los detalles del matrimonio
export interface WeddingUpdatePayload {
    fecha: string;
    hora: string;
    direccion: string;
    oficianteId: string;
}

// Respuesta del backend al actualizar el matrimonio
export interface UpdateWeddingResponse {
    status: boolean;
    code: number;
    message: string;
}
