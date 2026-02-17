// Utilidad para agrupar solicitudes por categoría

interface Solicitud {
    id: number;
    nombre_solicitud: string;
    descripcion: string;
    precio: number | string;
    categoria?: string;
}

interface GroupedSolicitudes {
    [categoria: string]: Solicitud[];
}

export function groupSolicitudesByCategory(solicitudes: Solicitud[]): GroupedSolicitudes {
    const grouped: GroupedSolicitudes = {};

    solicitudes.forEach(solicitud => {
        let categoria: string;

        // Si ya tiene categoría definida, usarla
        if (solicitud.categoria) {
            categoria = solicitud.categoria;
        } else {
            // Extraer categoría del nombre
            categoria = extractCategoryFromName(solicitud.nombre_solicitud);
        }

        if (!grouped[categoria]) {
            grouped[categoria] = [];
        }

        grouped[categoria].push(solicitud);
    });

    return grouped;
}

function extractCategoryFromName(nombre: string): string {
    const nombreLower = nombre.toLowerCase();

    // Definir categorías y sus palabras clave
    const categorias: { [key: string]: string[] } = {
        'Matrimonios': ['matrimonio', 'matrimonial', 'casamiento'],
        'Divorcios': ['divorcio', 'separación', 'disolución matrimonial'],
        'Nacimientos': ['nacimiento', 'natalicio', 'partida de nacimiento'],
        'Defunciones': ['defunción', 'fallecimiento', 'muerte'],
        'Certificados': ['certificado', 'copia certificada', 'constancia'],
        'Actas': ['acta', 'registro'],
        'Otros': []
    };

    // Buscar coincidencia con palabras clave
    for (const [categoria, keywords] of Object.entries(categorias)) {
        if (keywords.some(keyword => nombreLower.includes(keyword))) {
            return categoria;
        }
    }

    // Si no coincide con ninguna categoría, clasificar como "Otros"
    return 'Otros Trámites';
}

export function getCategoryOrder(): string[] {
    return [
        'Matrimonios',
        'Divorcios',
        'Nacimientos',
        'Defunciones',
        'Certificados',
        'Actas',
        'Otros Trámites'
    ];
}

export function shouldShowPaymentDetails(
    requestType: string,
    estado: string
): boolean {
    // No mostrar pago para solicitudes anuladas
    if (estado?.toLowerCase() === 'anulada' || estado?.toLowerCase() === 'anulado') {
        return false;
    }

    // Tipos que NO requieren mostrar información de pago
    const requestTypesWithoutPayment = [
        'Certificado de Trámite en Línea',
        'Consulta',
        'Verificación'
    ];

    if (requestTypesWithoutPayment.some(type => 
        requestType?.toLowerCase().includes(type.toLowerCase())
    )) {
        return false;
    }

    return true;
}

export function isPaymentRequired(requestType: string): boolean {
    // Tipos de solicitudes que SÍ requieren pago
    const paymentRequiredTypes = [
        'Matrimonio',
        'Divorcio',
        'Acta de Defunción',
        'Copia de Expediente',
        'Certificado'
    ];

    return paymentRequiredTypes.some(type => 
        requestType?.toLowerCase().includes(type.toLowerCase())
    );
}