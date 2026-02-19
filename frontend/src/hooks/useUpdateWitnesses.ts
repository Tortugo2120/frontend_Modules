import { useState } from 'react';
import { updateWitnessesByApplicationId } from '../services/WitnessService.ts';
import type { WitnessUpdatePayload, UpdateWitnessesResponse } from '../model/witnessModel.ts';

export const useUpdateWitnesses = () => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const updateWitnesses = async (
        applicationId: number,
        witnesses: WitnessUpdatePayload[]
    ): Promise<UpdateWitnessesResponse> => {
        setIsUpdating(true);
        setUpdateError(null);
        setUpdateSuccess(false);

        try {
            const response = await updateWitnessesByApplicationId(applicationId, witnesses);
            if (response.status) {
                setUpdateSuccess(true);
            } else {
                setUpdateError(response.message || 'Error al actualizar testigos');
            }
            return response;
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            const errorMessage = axiosError.response?.data?.message || 'Error al actualizar testigos';
            setUpdateError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    const resetState = () => {
        setUpdateError(null);
        setUpdateSuccess(false);
    };

    return { updateWitnesses, isUpdating, updateError, updateSuccess, resetState };
};
