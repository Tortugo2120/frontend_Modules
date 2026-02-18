import apiAxios from "../api/Axios.tsx";

export const getOficiantes = async (rol:string)=>{
    const response = await apiAxios.get(`/api/v1/user/${rol}`);
    return response.data;
}