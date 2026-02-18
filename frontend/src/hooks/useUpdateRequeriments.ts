import { useState } from 'react';
import { UpdateRequirementsByApplicationId } from '../services/RequirementsService';
import type { RequieremntUpdate } from '../model/requerimentsModel';

interface UpdateRequirementsResponse {
    status: boolean;
    code: number;
    message: string;
}

export const useUpdateRequeriments = () => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const updateRequirements = async (
        applicationId: number,
        requirements: RequieremntUpdate[]
    ): Promise<UpdateRequirementsResponse> => {
        setIsUpdating(true);
        setUpdateError(null);
        setUpdateSuccess(false);

        try {
            const response = await UpdateRequirementsByApplicationId(requirements, applicationId);

            if (response.status) {
                setUpdateSuccess(true);
            } else {
                setUpdateError(response.message || 'Error al actualizar requisitos');
            }

            return response;
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            const errorMessage = axiosError.response?.data?.message || 'Error al actualizar requisitos';
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

    return {
        updateRequirements,
        isUpdating,
        updateError,
        updateSuccess,
        resetState
    };
};
