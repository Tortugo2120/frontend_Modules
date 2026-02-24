import { useState, useCallback } from "react";
import { getPaymentHistory, type PaymentHistoryParams } from "../services/PaymentHistoryService";
import type { PaymentHistoryItem, PaymentHistoryPager } from "../model/paymentHistoryModel";

export default function usePaymentHistory() {
    const [data, setData] = useState<PaymentHistoryItem[]>([]);
    const [pagination, setPagination] = useState<PaymentHistoryPager | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<PaymentHistoryParams>({
        page: 1,
        state: "",
        applicationType: "",
        expedientNumber: "",
        beginDate: "",
        endDate: "",
    });

    const fetchHistory = useCallback(async (params?: PaymentHistoryParams) => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = params ?? filters;
            const response = await getPaymentHistory(queryParams);
            if (response.status) {
                setData(response.data);
                setPagination(response.pagination);
            } else {
                setError(response.message || "Error al obtener historial de pagos");
            }
        } catch (e: any) {
            setError(e?.response?.data?.message || e?.message || "Error de conexión");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const updateFilter = useCallback(<K extends keyof PaymentHistoryParams>(
        key: K,
        value: PaymentHistoryParams[K]
    ) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const applyFilters = useCallback(() => {
        const params = { ...filters, page: 1 };
        setFilters(params);
        fetchHistory(params);
    }, [filters, fetchHistory]);

    const changePage = useCallback((page: number) => {
        const params = { ...filters, page };
        setFilters(params);
        fetchHistory(params);
    }, [filters, fetchHistory]);

    const resetFilters = useCallback(() => {
        const initial: PaymentHistoryParams = {
            page: 1,
            state: "",
            applicationType: "",
            expedientNumber: "",
            beginDate: "",
            endDate: "",
        };
        setFilters(initial);
        fetchHistory(initial);
    }, [fetchHistory]);

    return {
        data,
        pagination,
        loading,
        error,
        filters,
        updateFilter,
        applyFilters,
        changePage,
        resetFilters,
        refetch: fetchHistory,
    };
}
