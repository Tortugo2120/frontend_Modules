export interface Requirement {
  id: number | string; // Aceptar ambos tipos porque el backend puede enviar strings
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