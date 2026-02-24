export interface UbigeoItem {
    id: string;
    departamento: string;
    provincia: string;
    distrito: string;
}

export interface UbigeoResponse {
    status: boolean;
    code: number;
    message: string;
    data: UbigeoItem[];
}
