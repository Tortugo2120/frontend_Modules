import { useState, useEffect } from 'react';
import { getOficiantes } from '../services/UserServices';

interface Oficiante {
    id: string;
    full_name: string;
}

interface UseGetOficiantesReturn {
    oficiantes: Oficiante[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useGetOficiantes = (rol: string = 'oficiante'): UseGetOficiantesReturn => {
    const [oficiantes, setOficiantes] = useState<Oficiante[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOficiantes = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await getOficiantes(rol);

            if (response.status && response.data) {
                setOficiantes(response.data);
            } else {
                setError('No se pudieron cargar los oficiantes');
                setOficiantes([]);
            }
        } catch (err: unknown) {
            console.error('Error al obtener oficiantes:', err);
            const errorMessage = err instanceof Error
                ? err.message
                : 'Error al cargar los oficiantes';
            setError(errorMessage);
            setOficiantes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOficiantes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rol]);

    return {
        oficiantes,
        loading,
        error,
        refetch: fetchOficiantes
    };
};
