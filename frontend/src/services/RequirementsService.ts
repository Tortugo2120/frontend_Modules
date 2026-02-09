import apiAxios from "../api/Axios.tsx";
import type {RequirementsResponse} from "../model/requerimentsModel.ts";

export const RequirementsService = async (applicationTypeId:number,condition:string):Promise<RequirementsResponse>=>{
    const response = await apiAxios.get("/api/v1/requirement/search",{params:{applicationTypeId,condition}});
    return response.data;
}