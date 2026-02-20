import apiAxios from '../api/Axios.tsx';
import type { WeddingUpdatePayload, UpdateWeddingResponse, MarriageDetailsResponse } from '../model/weddingModel.ts';

export const getMarriageDetailsByApplicationId = async (
    applicationId: number
): Promise<MarriageDetailsResponse> => {
    try {
        const response = await apiAxios.get<MarriageDetailsResponse>(
            `/api/v1/application/${applicationId}/marriage-details`
        );
        return response.data;
    } catch (error) {
        console.error('Error al obtener detalles del matrimonio.', error);
        throw error;
    }
};

export const updateWeddingByApplicationId = async (
    applicationId: number,
    payload: WeddingUpdatePayload
): Promise<UpdateWeddingResponse> => {
    try {
        const response = await apiAxios.put<UpdateWeddingResponse>(
            `/api/v1/application/${applicationId}/marriage-details`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error('Error al actualizar detalles del matrimonio.', error);
        throw error;
    }
};
