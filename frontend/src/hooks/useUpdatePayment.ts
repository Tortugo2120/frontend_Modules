import { useState } from 'react';
import { updatePaymentByApplicationId } from '../services/PaymentUpdateService.ts';
import type { PaymentUpdatePayload, UpdatePaymentResponse } from '../model/paymentUpdateModel.ts';

export const useUpdatePayment = () => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const updatePayment = async (
        applicationId: number,
        payload: PaymentUpdatePayload
    ): Promise<UpdatePaymentResponse> => {
        setIsUpdating(true);
        setUpdateError(null);
        setUpdateSuccess(false);

        try {
            const response = await updatePaymentByApplicationId(applicationId, payload);
            if (response.status) {
                setUpdateSuccess(true);
            } else {
                setUpdateError(response.message || 'Error al actualizar el pago');
            }
            return response;
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            const errorMessage = axiosError.response?.data?.message || 'Error al actualizar el pago';
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

    return { updatePayment, isUpdating, updateError, updateSuccess, resetState };
};
