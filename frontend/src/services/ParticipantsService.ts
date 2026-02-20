import apiAxios from '../api/Axios.tsx';
import type { ParticipantsResponse } from '../model/participantsModel.ts';

export const getParticipantsByApplicationId = async (
    applicationId: number
): Promise<ParticipantsResponse> => {
    const response = await apiAxios.get<ParticipantsResponse>(
        `/api/v1/application/${applicationId}/participants`
    );
    return response.data;
};
