import { useState, useEffect } from "react";
import { getDetalleSolicitudById } from "../services/detailsApplicationService";
import type { ApplicationDetailItem } from "../model/detailRequestModel";


export const useDetailsApplication = (id: string | undefined) => {
    const [application, setApplication] = useState<ApplicationDetailItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        const fetchDetail = async () => {
            if (!id) return;
            try {
                setLoading(true);
                setError(null);
                const data = await getDetalleSolicitudById(id);
                setApplication(data);
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || "No se pudo cargar la información de la solicitud.";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    return { application, loading, error };
};