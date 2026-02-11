import apiAxios from "../api/Axios.tsx";
import type { CreateApplicationPayload, AplicationResponse, GetAplicationState } from "../model/aplicationModel.ts";

export const PendingApplications = async (): Promise<GetAplicationState> => {
    const response = await apiAxios.get("/api/v1/application/pending");
    return response.data.data;
}

export const CompleteApplications = async (): Promise<GetAplicationState> => {
    const response = await apiAxios.get("/api/v1/application/complete");
    return response.data.data;
}
export const ListApplications = async (): Promise<GetAplicationState> => {
    const response = await apiAxios.get("/api/v1/application");
    return response.data.data;
}

export const CreateAplication = async (aplication: CreateApplicationPayload): Promise<AplicationResponse> => {
    const response = await apiAxios.post("/api/v1/application", aplication);
    return response.data;
}