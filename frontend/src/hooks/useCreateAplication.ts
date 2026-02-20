import {useState} from "react";
import type {CreateApplicationPayload} from "../model/aplicationModel.ts";
import {CreateAplication} from "../services/AplicationServices.ts";

export default function useCreateAplication() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const createSolicitud = async (dataForm:CreateApplicationPayload) => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
          console.log("preparando data desde el hook: ",dataForm);
          const response = await CreateAplication(dataForm);
          setSuccess(true);
          return response;
      }catch (error:unknown){
          const errorMessage = error instanceof Error
              ? error.message
              : 'Error al crear la solicitud';
          setError(errorMessage);
          return null;
      }finally {
          setLoading(false);
      }
    }

    return {loading,error,createSolicitud,success};
}