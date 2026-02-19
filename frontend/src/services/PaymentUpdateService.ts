import apiAxios from '../api/Axios.tsx';
import type { PaymentUpdatePayload, UpdatePaymentResponse } from '../model/paymentUpdateModel.ts';

export const updatePaymentByApplicationId = async (
    applicationId: number,
    payload: PaymentUpdatePayload
): Promise<UpdatePaymentResponse> => {
    try {
        const response = await apiAxios.put<UpdatePaymentResponse>(
            `/api/v1/application/${applicationId}/payment`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el pago.', error);
        throw error;
    }
};
