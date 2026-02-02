import type {Tiposolicitud} from "../model/typeRequestModel.ts";
import apiAxios from "../api/Axios.tsx";

export const getTypeRequestAll = async ():Promise<Tiposolicitud[]> => {
  const response = await apiAxios.get("/api/auth/getTypeRequestAll");
  return response.data;
}