export interface Requisito {
    id: string;
    titulo: string;
    descripcion: string;
    obligatorio: boolean;
    completado: boolean;
}

export interface ArchivoSubido {
    id: string;
    nombre: string;
    tamaño: number;
    tipo: string;
    archivo: File;
}

export interface ContrayenteInfo {
    cui: string;
    nombre: string;
    condiciones: Set<string>;
}

export interface ProgresoInfo {
    completados: number;
    total: number;
    porcentaje: number;
}

export interface RequisitosMatrimonioProps {
    tipoSolicitudNombre?: string;
    descriptionSolicitud?: string;
    onRequisitosChange?: (requisitos: Requisito[]) => void;
    onArchivosChange?: (archivos: ArchivoSubido[]) => void;
    onValidationChange?: (isValid: boolean) => void;
}

export interface RequisitoItemProps {
    requisito: {
        id: number | string;
        nombre_requisito: string;
        descripcion: string;
        condicion?: string;
    };
    index: number;
    contrayenteIndex: number;
    isCompleted: boolean;
    archivos: ArchivoSubido[];
    observacion: string;
    error?: string;
    onCheckboxChange: (requisitoId: string | number, contrayenteIndex: number) => void;
    onFileChange: (requisitoKey: string, e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileDelete: (requisitoKey: string) => void;
    onObservacionChange: (requisitoKey: string, value: string) => void;
    onErrorClear: (requisitoKey: string) => void;
    getRequisitoKey: (requisitoId: number | string, contrayenteIndex: number) => string;
    formatearTamaño: (bytes: number) => string;
    getIconoArchivo: (tipo: string) => string;
}

export interface RequisitosContrayenteProps {
    contrayenteIndex: number;
    contrayente: ContrayenteInfo | undefined;
    grupos: { [key: string]: Array<{
        id: number | string;
        nombre_requisito: string;
        descripcion: string;
        condicion?: string;
    }> };
    progreso: ProgresoInfo;
    requisitosEstados: Map<string, number>;
    archivosRequisitos: Map<string, ArchivoSubido[]>;
    observacionesMap: Map<string, string>;
    erroresArchivo: Map<string, string>;
    onMarcarTodos: (contrayenteIndex: number) => void;
    onDesmarcarTodos: (contrayenteIndex: number) => void;
    onCheckboxChange: (requisitoId: string | number, contrayenteIndex: number) => void;
    onFileChange: (requisitoKey: string, e: React.ChangeEvent<HTMLInputElement>) => void;
    onFileDelete: (requisitoKey: string) => void;
    onObservacionChange: (requisitoKey: string, value: string) => void;
    onErrorClear: (requisitoKey: string) => void;
    getRequisitoKey: (requisitoId: number | string, contrayenteIndex: number) => string;
    formatearTamaño: (bytes: number) => string;
    getIconoArchivo: (tipo: string) => string;
    getNombreCondicion: (condicion: string) => string;
    getIconoCondicion: (condicion: string) => string;
    getColorCondicion: (condicion: string) => string;
}
