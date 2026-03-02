// Genera una clave única por requisito y por contrayente
// Las claves internas distinguen entre contrayentes para el Map de estados
// NOTA: al enviar al backend se usa solo el id numérico, NO esta clave completa
export const getRequisitoKey = (
    requisitoId: number | string,
    contrayenteIndex?: number,
    tipoRequisito?: string
): string => {
    // Requisito general compartido, sin contrayente específico
    if (tipoRequisito === 'general' || contrayenteIndex === 0) {
        return `${requisitoId}-general`;
    }
    // Requisito individual: clave única por contrayente usando su índice (1 o 2)
    return `${requisitoId}-ctry${contrayenteIndex}`;
};

// Formatea bytes a cadena legible 
export const formatearTamaño = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Icono FontAwesome 
export const getIconoArchivo = (tipo: string): string => {
    if (tipo.includes('pdf')) return 'fa-file-pdf text-red-500';
    if (tipo.includes('image')) return 'fa-file-image text-blue-500';
    if (tipo.includes('word') || tipo.includes('document')) return 'fa-file-word text-blue-600';
    if (tipo.includes('excel') || tipo.includes('spreadsheet')) return 'fa-file-excel text-green-600';
    return 'fa-file text-gray-500';
};

// Nombre legible de condición 
export const getNombreCondicion = (condicion: string): string => {
    const nombres: Record<string, string> = {
        'GENERAL':    'Requisitos Generales',
        'DIVORCIADO':   'Requisitos para Divorciados',
        'VIUDO':    'Requisitos para Viudos',
        'EXTRANJEROS': 'Requisitos para Extranjeros',
        'MARRIED':    'Requisitos para Casados',
        'SEPARATED':  'Requisitos para Separados',
    };
    return nombres[condicion] ?? condicion;
};

// Icono FontAwesome por condición 
export const getIconoCondicion = (condicion: string): string => {
    const iconos: Record<string, string> = {
        'GENERAL':    'fa-clipboard-list',
        'DIVORCIADO':   'fa-user-slash',
        'VIUDO':    'fa-heart-broken',
        'EXTRANJEROS': 'fa-globe-americas',
        'MARRIED':    'fa-rings-wedding',
        'SEPARATED':  'fa-user-minus',
    };
    return iconos[condicion] ?? 'fa-file-alt';
};

// Color Tailwind por condición 
export const getColorCondicion = (condicion: string): string => {
    const colores: Record<string, string> = {
        'GENERAL':    'blue',
        'DIVORCIADO':   'orange',
        'VIUDO':    'purple',
        'EXTRANJEROS': 'green',
        'MARRIED':    'pink',
        'SEPARATED':  'yellow',
    };
    return colores[condicion] ?? 'gray';
};

//  Tamaño máximo de archivo (5 MB) 
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Tipos de archivo permitidos
export const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png';