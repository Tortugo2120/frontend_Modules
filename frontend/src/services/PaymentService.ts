import apiAxios from "../api/Axios.tsx";
import type {PaymentResumen} from "../model/paymentModel.ts";

export const resumenPagos = async (): Promise<PaymentResumen> =>{
    const response = await  apiAxios.get('/api/v1/payment/summary');
    return response.data;
}