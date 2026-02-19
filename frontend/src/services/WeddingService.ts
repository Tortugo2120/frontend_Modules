import apiAxios from '../api/Axios.tsx';
import type { WeddingUpdatePayload, UpdateWeddingResponse } from '../model/weddingModel.ts';

export const updateWeddingByApplicationId = async (
    applicationId: number,
    payload: WeddingUpdatePayload
): Promise<UpdateWeddingResponse> => {
    try {
        const response = await apiAxios.put<UpdateWeddingResponse>(
            `/api/v1/application/${applicationId}/wedding`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error('Error al actualizar detalles del matrimonio.', error);
        throw error;
    }
};
