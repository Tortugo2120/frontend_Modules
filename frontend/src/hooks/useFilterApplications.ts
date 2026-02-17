import { useEffect, useRef, useState } from "react";
import type { Pager } from "../model/aplicationFilterModel";
import { FilterAplications } from "../services/AplicationServices";
import type {ApplicationBackendItem, ApplicationItem} from "../model/aplicationModel.ts";

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
    const [enabled,setEnabled] = useState(false);

    const [data, setData] = useState<ApplicationItem[]>([]);
    const [pagination, setPagination] = useState<Pager | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    const transformFilterData = (dataFilter:ApplicationBackendItem): ApplicationItem=> {
        return {
            id: parseInt(dataFilter.id),
            expediente: dataFilter.numero_expediente,
            nombreSolicitud: dataFilter.nombre_solicitud,
            descripcionSolicitud: dataFilter.descripcion_solicitud,
            precio: parseFloat(dataFilter.precio),
            estado: dataFilter.estado,
            fecha: dataFilter.fecha_inicio,
            fechaActualizacion: dataFilter.fecha_actualizacion,
            fechaFin: dataFilter.fecha_fin,
            encargado: dataFilter.encargado ? dataFilter.encargado : "Sin encargado",
            participantes: dataFilter.participantes || [],
        }
    }
    useEffect(() => {
        if (!enabled) return;
        const getDataFilter = async () => {

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const controller = new AbortController();
            abortControllerRef.current = controller;

            setLoading(true);
            setError(null);

            try {
                console.log('Enviando filtros al backend:', appliedFilters);
                const response = await FilterAplications(
                    appliedFilters,
                    controller
                );
                console.log('Respuesta del backend:', response);
                if (response.status) {
                    const dataTransformed = response.data.map(transformFilterData);
                    setData(dataTransformed);
                    setPagination(response.pager);
                } else {
                    setError('No se encontraron resultados');
                }

            } catch (err: unknown) {

                if ((err as { name?: string })?.name === "CanceledError" || (err as { name?: string })?.name === "AbortError") {
                    return;
                }

                console.error('Error en FilterAplications:', err);
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

    }, [appliedFilters,enabled]);

    const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
        console.log('updateFilter llamado con:', key, '=', value);
        setDraftFilters(prev => {
            const updated = {
                ...prev,
                [key]: value
            };
            console.log('draftFilters actualizado a:', updated);
            return updated;
        });
    };

    const updateFilters = (newFilters: Partial<Filters>) => {
        setDraftFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    };

    const applyFilters = () => {
        const filtersToApply = {
            ...draftFilters,
            page: 1
        };
        console.log('applyFilters() llamado');
        console.log('draftFilters estado actual:', draftFilters);
        console.log('Filtros a aplicar:', filtersToApply);
        setEnabled(true);
        setLoading(true);
        setAppliedFilters(filtersToApply);
    };

    const applyQuickState = (state: string) => {
        setEnabled(true);
        const newFilters = {
            ...appliedFilters,
            state,
            page: 1
        };

        setAppliedFilters(newFilters);
        setDraftFilters(newFilters);
    };

    const changePage = (newPage: number) => {
        setEnabled(true);
        setAppliedFilters(prev => ({
            ...prev,
            page: newPage
        }));
    };

    const resetFilters = () => {
        setDraftFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setEnabled(false);
        setData([]);
        setPagination(null);
        setError(null);
        setLoading(false);
    };

    return {
        enabled,
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