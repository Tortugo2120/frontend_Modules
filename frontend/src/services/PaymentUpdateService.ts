import apiAxios from '../api/Axios.tsx';
import type { PaymentUpdatePayload, UpdatePaymentResponse } from '../model/paymentUpdateModel.ts';

export const uploadPaymentEvidence = async (
    applicationId: number,
    file: File
): Promise<UpdatePaymentResponse> => {
    try {
        const formData = new FormData();
        formData.append('evidence', file);
        const response = await apiAxios.post<UpdatePaymentResponse>(
            `/api/v1/application/${applicationId}/payment/evidence`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    } catch (error) {
        console.error('Error al subir evidencia de pago.', error);
        throw error;
    }
};

export const updatePaymentByApplicationId = async (
    applicationId: number,
    payload: PaymentUpdatePayload
): Promise<UpdatePaymentResponse> => {
    try {
        const response = await apiAxios.put<UpdatePaymentResponse>(
            `/api/v1/application/payment/${applicationId}`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el pago.', error);
        throw error;
    }
};
