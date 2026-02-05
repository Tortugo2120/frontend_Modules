import type {PersonCreateResponse} from "../model/personModel.ts";
import apiAxios from "../api/Axios.tsx";

export const searchPersonByDni = async (dni: string): Promise<PersonCreateResponse> => {
    const response = await apiAxios.post("/api/v1/person/search",dni);
    return response.data;
};