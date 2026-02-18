import apiAxios from "../api/Axios.tsx";
import type {
    RequirementsResponse,
    RequirementByApplicationResponse,
    RequieremntUpdate
} from "../model/requerimentsModel.ts";

export const RequirementsService = async (applicationTypeId: number, condition: string): Promise<RequirementsResponse> => {
    try {
        const response = await apiAxios.get<RequirementsResponse>("/api/v1/requirement/search", { 
            params: { applicationTypeId, condition } 
        });
        return response.data;
    } catch (error) {
        console.error("Error en RequirementsService:", error);
        throw error;
    }
}

export const RequirementsByApplicationId = async (applicationId: number): Promise<RequirementByApplicationResponse> => {
    try {
        const response = await apiAxios.get<RequirementByApplicationResponse>(
            `/api/v1/application/${applicationId}/requirements`
        );
        console.log("Respuesta de requirements:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error en RequirementsByApplicationId:", error);
        throw error;
    }
}

export const UpdateRequirementsByApplicationId = async (requirementUpdate:RequieremntUpdate[],id_solicitud:number)=> {
    const response = await apiAxios.post(`/api/v1/application/${id_solicitud}/requirements`, {
        requirements: requirementUpdate
    });

    return response.data;
}