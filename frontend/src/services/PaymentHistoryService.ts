import apiAxios from "../api/Axios";
import type { PaymentHistoryResponse } from "../model/paymentHistoryModel";

export interface PaymentHistoryParams {
    page?: number;
    state?: string;
    applicationType?: string;
    expedientNumber?: string;
    beginDate?: string;
    endDate?: string;
}

export const getPaymentHistory = async (
    params: PaymentHistoryParams = {}
): Promise<PaymentHistoryResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", String(params.page));
    if (params.state) queryParams.append("state", params.state);
    if (params.applicationType) queryParams.append("applicationType", params.applicationType);
    if (params.expedientNumber) queryParams.append("expedientNumber", params.expedientNumber);
    if (params.beginDate) queryParams.append("beginDate", params.beginDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const query = queryParams.toString();
    const url = `/api/v1/payment/history/filter${query ? `?${query}` : ""}`;

    const response = await apiAxios.get<PaymentHistoryResponse>(url);
    return response.data;
};
