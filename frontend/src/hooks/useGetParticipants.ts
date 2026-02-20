import { useState, useEffect } from 'react';
import { getParticipantsByApplicationId } from '../services/ParticipantsService.ts';
import type { ParticipantsData } from '../model/participantsModel.ts';

export const useGetParticipants = (applicationId: number | null) => {
    const [participants, setParticipants] = useState<ParticipantsData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!applicationId) return;

        const fetchParticipants = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await getParticipantsByApplicationId(applicationId);
                if (res.status) {
                    setParticipants(res.data);
                } else {
                    setError(res.message || 'Error al obtener participantes');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error al obtener participantes');
            } finally {
                setLoading(false);
            }
        };

        fetchParticipants();
    }, [applicationId]);

    return { participants, loading, error };
};
