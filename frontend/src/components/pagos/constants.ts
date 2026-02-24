export const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const YEARS = ["2024", "2025", "2026"];

export const RECAUDACION_BASE = MONTHS.map(mes => ({ mes, monto: 0 }));

export const ESTADO_CLASSES: Record<string, string> = {
    Pendiente:    "bg-yellow-100 text-yellow-700 border border-yellow-200",
    "En Proceso": "bg-blue-100   text-blue-700   border border-blue-200",
    Completada:   "bg-green-100  text-green-700  border border-green-200",
    Anulada:      "bg-red-100    text-red-700    border border-red-200",
};

export const ESTADO_ICON: Record<string, string> = {
    Pendiente:    "fa-clock",
    "En Proceso": "fa-spinner",
    Completada:   "fa-check-circle",
    Anulada:      "fa-ban",
};

export const INPUT_CLASS =
    "w-full input input-lg border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300";
