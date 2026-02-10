export interface Requirement {
  id: number | string;
  nombre_requisito: string;
  nombre_solicitud: string;
  descripcion: string;
  condicion: string;
}

export interface RequirementsResponse {
  status: boolean;
  code: number;
  message: string;
  data: Requirement[];
}