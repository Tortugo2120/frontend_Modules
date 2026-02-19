import apiAxios from "../api/Axios.tsx";
import type {
    ApplicationDetailItem,
    ApplicationBackendDetail,
    ApplicationDetailResponse
} from "../model/detailRequestModel.ts";


const transformDetalleSolicitud = (backendData: ApplicationBackendDetail): ApplicationDetailItem => {
    return {
        id: parseInt(backendData.id),
        expediente: backendData.numero_expediente,
        fechaInicio: backendData.fecha_inicio,
        fechaFin: backendData.fecha_fin,
        estado: backendData.estado,
        fechaActualizacion: backendData.fecha_actualizacion,
        nombreSolicitud: backendData.nombre_solicitud,
        descripcionSolicitud: backendData.descripcion_solicitud,
        precio: parseFloat(backendData.precio),
        encargado: backendData.encargado,
        participantes: backendData.participantes || [],
        requisitos: backendData.requisitos || [],
        pago: backendData.pago,
        matrimonio: backendData.matrimonio ?? null
    };
};

export const getDetalleSolicitudById = async (id: string | number): Promise<ApplicationDetailItem> => {
    try {

        const response = await apiAxios.get<ApplicationDetailResponse>(`/api/v1/application/${id}`);


        return transformDetalleSolicitud(response.data.data);
    } catch (error) {
        console.error("Error al obtener el detalle de la solicitud.", error);
        throw error;
    }
};