import apiAxios from '../api/Axios.tsx';
import type { WitnessUpdatePayload, UpdateWitnessesResponse } from '../model/witnessModel.ts';

export const updateWitnessesByApplicationId = async (
    applicationId: number,
    witnesses: WitnessUpdatePayload[]
): Promise<UpdateWitnessesResponse> => {
    try {
        console.log('[WitnessService] PUT payload:', JSON.stringify({ witnesses }, null, 2));
        const response = await apiAxios.put<UpdateWitnessesResponse>(
            `/api/v1/application/${applicationId}/witnesses`,
            { witnesses }
        );
        return response.data;
    } catch (error: any) {
        console.error('[WitnessService] Error al actualizar testigos:', error?.response?.data ?? error);
        throw error;
    }
};
