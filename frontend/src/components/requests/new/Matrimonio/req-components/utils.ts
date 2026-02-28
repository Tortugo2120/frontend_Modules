// Genera una clave única para cada requisito por contrayente
export const getRequisitoKey = (
    requisitoId: number | string,
    contrayenteIndex?: number,
    tipoRequisito?: string
): string => {
    if (tipoRequisito === 'general' || contrayenteIndex === 0) {
        return `${requisitoId}-general`;
    }
    return `${requisitoId}-ctry${contrayenteIndex}`;
};

// Formatea el tamaño de un archivo en bytes a una cadena legible

export const formatearTamaño = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Obtiene el icono de FontAwesome según el tipo de archivo

export const getIconoArchivo = (tipo: string): string => {
    if (tipo.includes('pdf')) return 'fa-file-pdf text-red-500';
    if (tipo.includes('image')) return 'fa-file-image text-blue-500';
    if (tipo.includes('word') || tipo.includes('document')) return 'fa-file-word text-blue-600';
    if (tipo.includes('excel') || tipo.includes('spreadsheet')) return 'fa-file-excel text-green-600';
    return 'fa-file text-gray-500';
};

// Obtiene el nombre legible de una condición

export const getNombreCondicion = (condicion: string): string => {
    const nombres: { [key: string]: string } = {
        'GENERAL': 'Requisitos Generales',
        'DIVORCED': 'Requisitos para Divorciados',
        'WIDOWED': 'Requisitos para Viudos',
        'FOREIGNERS': 'Requisitos para Extranjeros'
    };
    return nombres[condicion] || condicion;
};

/**
 * Obtiene el icono de FontAwesome para una condición
 */
export const getIconoCondicion = (condicion: string): string => {
    const iconos: { [key: string]: string } = {
        'GENERAL': 'fa-clipboard-list',
        'DIVORCED': 'fa-user-slash',
        'WIDOWED': 'fa-heart-broken',
        'FOREIGNERS': 'fa-globe-americas'
    };
    return iconos[condicion] || 'fa-file-alt';
};

/**
 * Obtiene el color de Tailwind para una condición
 */
export const getColorCondicion = (condicion: string): string => {
    const colores: { [key: string]: string } = {
        'GENERAL': 'blue',
        'DIVORCED': 'orange',
        'WIDOWED': 'purple',
        'FOREIGNERS': 'green'
    };
    return colores[condicion] || 'gray';
};

/**
 * Tamaño máximo de archivo en bytes (5 MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Tipos de archivo permitidos
 */
export const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png';
