import apiAxios from "../api/Axios.tsx";
import type { RecaudacionMensualResponse } from "../model/recaudacionModel.ts";

export const getRecaudacionMensual = async (): Promise<RecaudacionMensualResponse> => {
    const response = await apiAxios.get("/api/v1/payment/mensualRecaudation");
    return response.data;
};
