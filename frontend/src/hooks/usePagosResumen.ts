import { useState, useEffect } from 'react';
import { resumenPagos } from '../services/PaymentService';

export const usePagosResumen = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResumenPagos = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await resumenPagos();
                setData(response);
            } catch (err: any) {
                setError(err.message || 'Error al obtener el resumen de pagos');
                console.error('Error en usePagosResumen:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchResumenPagos();
    }, []);

    return { data, loading, error };
};
