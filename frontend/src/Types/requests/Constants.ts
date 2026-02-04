
export interface RequestType {
    id: number;
    nombre: string;
    icon: string;
    descripcion: string;
    color: string;
    colorOpacity: string;
    ringColor: string;
}

export const REQUEST_TYPES: RequestType[] = [
    {
        id: 1,
        nombre: 'Matrimonio Civil',
        icon: 'fa-ring',
        descripcion: 'Solicitud de acta de matrimonio civil',
        color: 'bg-pink-500',
        colorOpacity: 'bg-pink-500/20',
        ringColor: 'ring-pink-600'
    },
    {
        id: 2,
        nombre: 'Divorcio',
        icon: 'fa-heart-broken',
        descripcion: 'Trámite de divorcio civil',
        color: 'bg-red-500',
        colorOpacity: 'bg-red-500/20',
        ringColor: 'ring-red-600'
    },
    {
        id: 3,
        nombre: 'Acta de Nacimiento',
        icon: 'fa-baby',
        descripcion: 'Registro o copia de acta de nacimiento',
        color: 'bg-blue-500',
        colorOpacity: 'bg-blue-500/20',
        ringColor: 'ring-blue-600'
    },
    {
        id: 4,
        nombre: 'Acta de Defunción',
        icon: 'fa-cross',
        descripcion: 'Registro o copia de acta de defunción',
        color: 'bg-gray-600',
        colorOpacity: 'bg-gray-600/20',
        ringColor: 'ring-gray-700'
    },
    {
        id: 5,
        nombre: 'Copia de Expediente',
        icon: 'fa-copy',
        descripcion: 'Solicitud de copia certificada',
        color: 'bg-teal-500',
        colorOpacity: 'bg-teal-500/20',
        ringColor: 'ring-teal-600'
    }
];