import { useState, useCallback } from 'react';
import { getMarriageDetailsByApplicationId } from '../services/WeddingService.ts';
import type { MarriageDetails } from '../model/weddingModel.ts';

export const useGetMarriageDetails = () => {
    const [marriageDetails, setMarriageDetails] = useState<MarriageDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMarriageDetails = useCallback(async (applicationId: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getMarriageDetailsByApplicationId(applicationId);
            if (response.status) {
                setMarriageDetails(response.data);
            } else {
                setError(response.message || 'Error al obtener detalles del matrimonio');
            }
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            const errorMessage = axiosError.response?.data?.message || 'Error al obtener detalles del matrimonio';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = () => {
        setMarriageDetails(null);
        setError(null);
    };

    return { marriageDetails, isLoading, error, fetchMarriageDetails, reset };
};
