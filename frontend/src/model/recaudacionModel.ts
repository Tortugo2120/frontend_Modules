export interface RecaudacionMes {
    mes: string;
    monto: number;
}

export interface RecaudacionMensualResponse {
    status: boolean;
    code: number;
    message: string;
    data: Record<string, RecaudacionMes[]>;
}
