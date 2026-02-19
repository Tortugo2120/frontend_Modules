import { useState } from 'react';
import { updateWeddingByApplicationId } from '../services/WeddingService.ts';
import type { WeddingUpdatePayload, UpdateWeddingResponse } from '../model/weddingModel.ts';

export const useUpdateWedding = () => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const updateWedding = async (
        applicationId: number,
        payload: WeddingUpdatePayload
    ): Promise<UpdateWeddingResponse> => {
        setIsUpdating(true);
        setUpdateError(null);
        setUpdateSuccess(false);

        try {
            const response = await updateWeddingByApplicationId(applicationId, payload);
            if (response.status) {
                setUpdateSuccess(true);
            } else {
                setUpdateError(response.message || 'Error al actualizar detalles del matrimonio');
            }
            return response;
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            const errorMessage = axiosError.response?.data?.message || 'Error al actualizar detalles del matrimonio';
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

    return { updateWedding, isUpdating, updateError, updateSuccess, resetState };
};
