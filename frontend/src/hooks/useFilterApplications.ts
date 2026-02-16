import { useEffect, useRef, useState } from "react";
import type { Application, Pager } from "../model/aplicationFilterModel";
import { FilterAplications } from "../services/AplicationServices";

interface Filters {
    state?: string;
    beginDate?: string;
    endDate?: string;
    ApplicationType?: number;
    page?: number;
}

const initialFilters: Filters = {
    state: "",
    beginDate: "",
    endDate: "",
    ApplicationType: 0,
    page: 1
};

const useFilterApplications = () => {

    const [draftFilters, setDraftFilters] = useState<Filters>(initialFilters);

    const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters);

    const [data, setData] = useState<Application[]>([]);
    const [pagination, setPagination] = useState<Pager | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {

        const getDataFilter = async () => {

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const controller = new AbortController();
            abortControllerRef.current = controller;

            setLoading(true);
            setError(null);

            try {
                const response = await FilterAplications(
                    appliedFilters,
                    controller
                );
                console.log(response);
                if (response.status) {
                    setData(response.data);
                    setPagination(response.pager);
                }

            } catch (err: any) {

                if (err?.name === "CanceledError" || err?.name === "AbortError") {
                    return;
                }

                setError("Error al cargar las aplicaciones");

            } finally {
                setLoading(false);
            }
        };

        getDataFilter();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };

    }, [appliedFilters]);

    const updateFilter = (key: keyof Filters, value: any) => {
        setDraftFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const updateFilters = (newFilters: Partial<Filters>) => {
        setDraftFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    };

    const applyFilters = () => {
        setAppliedFilters({
            ...draftFilters,
            page: 1
        });
    };

    const applyQuickState = (state: string) => {
        const newFilters = {
            ...appliedFilters,
            state,
            page: 1
        };

        setAppliedFilters(newFilters);
        setDraftFilters(newFilters);
    };

    const changePage = (newPage: number) => {
        setAppliedFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const resetFilters = () => {
        setDraftFilters(initialFilters);
        setAppliedFilters(initialFilters);
    };

    return {
        draftFilters,
        appliedFilters,
        data,
        pagination,
        loading,
        error,
        updateFilter,
        updateFilters,
        applyFilters,
        applyQuickState,
        changePage,
        resetFilters
    };
};

export default useFilterApplications;