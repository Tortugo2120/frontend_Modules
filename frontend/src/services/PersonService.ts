import type {PersonCreateResponse} from "../model/personModel.ts";
import apiAxios from "../api/Axios.tsx";

export const searchPersonByDni = async (documentNumber: string,documentType:number): Promise<PersonCreateResponse> => {
    const response = await apiAxios.get("/api/v1/person/search", { params: { documentNumber,documentType } });
    return response.data;
};