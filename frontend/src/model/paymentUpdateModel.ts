// Payload para actualizar el pago de una solicitud
export interface PaymentUpdatePayload {
    numero_comprobante: string;
    estado: string;
    fecha_pago: string;
    pagado?: '0' | '1'; // Opcional: indica si el pago está confirmado
}

// Respuesta del backend al actualizar el pago
export interface UpdatePaymentResponse {
    status: boolean;
    code: number;
    message: string;
}
