import type {GetAplicationState} from "../model/aplicationModel.ts";
import {useEffect, useState} from "react";
import {CompleteApplications} from "../services/AplicationServices.ts";

export default function useAplicatCountComplet(){
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [aplicatCountComplet, setAplicatCountComplet] = useState<GetAplicationState | null>(null);
    useEffect(() => {
        const aplicatCountPendig = async ()=> {
            setLoading(true);
            setError(null);
            try {
                const response = await CompleteApplications();
                setAplicatCountComplet(response);
            }catch(error:any) {
                const errroResponse = error.response;
                console.log(errroResponse);
            }finally {
                setLoading(false);
            }
        }
        aplicatCountPendig();
    },[])


    return { loading, error,aplicatCountComplet};
}