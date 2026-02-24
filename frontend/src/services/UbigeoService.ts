import apiAxios from "../api/Axios.tsx";
import type { UbigeoResponse } from "../model/ubigeoModel.ts";

export const searchUbigeo = async (): Promise<UbigeoResponse> => {
    const response = await apiAxios.get("/api/v1/ubigeo/search");
    return response.data;
};
