import { useState } from "react";
import { CancelApplication } from "../services/AplicationServices.ts";

export default function useCancelApplication() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const cancelApplication = async (id: string, observacion: string) => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            const response = await CancelApplication(id, observacion);
            setSuccess(true);
            return response;
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Error al anular la solicitud";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, success, cancelApplication };
}
