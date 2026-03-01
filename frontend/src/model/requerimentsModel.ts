export interface Requirement {
  id: number | string;
  tipo_requisito: string;
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

export interface RequirementByApplication {
  id: number | string;
  id_requisito: number | string;
  nombre_requisito: string;
  entregado: number;
  fecha_entrega: string;
  observacion: string | null;
  numero_documento: string | null;
}

export interface RequirementByApplicationResponse {
  status: boolean;
  code: number;
  message: string;
  data: RequirementByApplication[];
}

export interface RequieremntUpdate{
  requirementId: number;
  delivered: number;
  observation: string | null;
}