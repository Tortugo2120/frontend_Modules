import {useState} from "react";
import {searchPersonByDni} from "../services/PersonService.ts";

export function usePersonSearch(){
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPersonSearch = async (dni:string) => {
        setLoading(true);
        setError(null);

        try {
            return await searchPersonByDni(dni);
        } catch (error:any) {
            const errorResponse = error.response;
            console.log(errorResponse);
        } finally {
            setLoading(false);
        }
    }

    return {loading, error, fetchPersonSearch}
}