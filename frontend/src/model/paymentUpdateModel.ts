// Payload para actualizar el pago de una solicitud
export interface PaymentUpdatePayload {
    numero_comprobante: string;
    pagado: '0' | '1';
    estado: string;
    fecha_pago: string;
}

// Respuesta del backend al actualizar el pago
export interface UpdatePaymentResponse {
    status: boolean;
    code: number;
    message: string;
}
