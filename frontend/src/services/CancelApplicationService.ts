import apiAxios from "../api/Axios.tsx";
import type { CancelApplicationResponse } from "../model/cancelApplicationModel.ts";

export const CancelApplication = async (id: string): Promise<CancelApplicationResponse> => {
    const response = await apiAxios.delete(`/api/v1/application/${id}`);
    return response.data;
};
