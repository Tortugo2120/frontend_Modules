export interface PaymentHistoryItem {
    id: number;
    id_solicitud: number;
    expediente: string;
    estado_solicitud: string;
    tipo_solicitud: string;
    monto: number;
    estado: string;
    fecha_pago: string | null;
}

export interface PaymentHistoryPager {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface PaymentHistoryResponse {
    status: boolean;
    code: number;
    message: string;
    data: PaymentHistoryItem[];
    pagination: PaymentHistoryPager;
}
