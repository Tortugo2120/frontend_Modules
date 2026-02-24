export interface ApplicationRequirement {
    id: string;
    nombre_requisito: string;
    entregado: "0" | "1" | number;
    fecha_entrega: string;
    observation: string;
}

export interface UpdateRequirementsResponse {
    status: boolean;
    code: number;
    message: string;
    data: ApplicationRequirement[];
}
