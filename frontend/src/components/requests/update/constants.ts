export const ACTION_CARDS = [
    {
        key: "testigos",
        label: "Testigos",
        description: "Agregar o modificar los testigos de la solicitud",
        icon: "fa-users",
        color: "indigo",
        path: "/dashboard/actualizar/testigos",
    },
    {
        key: "requerimientos",
        label: "Requerimientos",
        description: "Revisar y actualizar el estado de los requisitos",
        icon: "fa-clipboard-list",
        color: "blue",
        path: "/dashboard/actualizar/requerimientos",
    },
    {
        key: "matrimonio",
        label: "Detalles del Matrimonio",
        description: "Editar la información del acto matrimonial",
        icon: "fa-ring",
        color: "pink",
        path: "/dashboard/actualizar/matrimonio",
    },
    {
        key: "pagos",
        label: "Pagos",
        description: "Confirmar y registrar los pagos asociados",
        icon: "fa-credit-card",
        color: "green",
        path: "/dashboard/actualizar/pagos",
    },
];

export const COLOR_MAP: Record<
    string,
    { bg: string; iconBg: string; iconText: string; btn: string; badge: string }
> = {
    indigo: { bg: "hover:border-indigo-300 hover:shadow-indigo-100", iconBg: "bg-indigo-100", iconText: "text-indigo-600", btn: "bg-indigo-600 hover:bg-indigo-700", badge: "bg-indigo-100 text-indigo-700" },
    blue:   { bg: "hover:border-blue-300   hover:shadow-blue-100",   iconBg: "bg-blue-100",   iconText: "text-blue-600",   btn: "bg-blue-600   hover:bg-blue-700",   badge: "bg-blue-100   text-blue-700"  },
    pink:   { bg: "hover:border-pink-300   hover:shadow-pink-100",   iconBg: "bg-pink-100",   iconText: "text-pink-600",   btn: "bg-pink-600   hover:bg-pink-700",   badge: "bg-pink-100   text-pink-700"  },
    green:  { bg: "hover:border-green-300  hover:shadow-green-100",  iconBg: "bg-green-100",  iconText: "text-green-600",  btn: "bg-green-600  hover:bg-green-700",  badge: "bg-green-100  text-green-700" },
};

export const ESTADO_CLASSES: Record<string, string> = {
    PENDIENTE:  "bg-yellow-100 text-yellow-700",
    EN_PROCESO: "bg-blue-100   text-blue-700",
    COMPLETADO: "bg-green-100  text-green-700",
    CANCELADO:  "bg-red-100    text-red-700",
};

export const formatFecha = (fecha: string | null): string =>
    fecha
        ? new Date(fecha).toLocaleDateString("es-PE", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : "—";
