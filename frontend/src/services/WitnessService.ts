import apiAxios from '../api/Axios.tsx';
import type { WitnessUpdatePayload, UpdateWitnessesResponse } from '../model/witnessModel.ts';

export const updateWitnessesByApplicationId = async (
    applicationId: number,
    witnesses: WitnessUpdatePayload[]
): Promise<UpdateWitnessesResponse> => {
    try {
        const response = await apiAxios.put<UpdateWitnessesResponse>(
            `/api/v1/application/${applicationId}/witness`,
            { witnesses }
        );
        return response.data;
    } catch (error) {
        console.error('Error al actualizar testigos.', error);
        throw error;
    }
};
