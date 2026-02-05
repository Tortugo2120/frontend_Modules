import {useState} from "react";
import type {AplicationRequest} from "../model/aplicationModel.ts";
import {CreateAplication} from "../services/AplicationServices.ts";

export default function useCreateAplication() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const createSolicitud = async (dataForm:AplicationRequest) => {
      setLoading(true);
      setError(null);

      try {
          return await CreateAplication(dataForm);
      }catch (error:any){
            const errorResponse = error.response;
            console.log(errorResponse);
      }finally {
          setLoading(false);
      }
    }

    return {loading,error,createSolicitud};
}