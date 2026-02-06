export interface PaymentResumen {
    status: boolean;
    code: number;
    message: string;
    data: {
        total: number;
        total_hoy: number;
    };
}