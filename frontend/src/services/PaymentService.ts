import apiAxios from "../api/Axios.tsx";

export const resumenPagos = async ()=>{
    const response = await  apiAxios.get('/api/v1/payment/summary');
    return response.data;
}