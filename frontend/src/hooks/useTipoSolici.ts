import {useEffect, useState} from "react";
import {getTypeRequestAll} from "../services/TiposolicitudService.ts";
import type {Tiposolicitud} from "../model/typeRequestModel.ts";


export default function useTipoSolici() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tiposolicitud, setTipoSolicitud] = useState<Tiposolicitud[]>([]);

    useEffect(() => {
        const fetchTipoSolicitud = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getTypeRequestAll();
                setTipoSolicitud(response);
            } catch (e: any) {
                console.log("Error fetching TipoSolicitud:", e);
                setError("Error fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchTipoSolicitud();
    },[])

    return {loading, error, tiposolicitud};
}