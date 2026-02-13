import { useEffect, useRef, useState, useCallback } from 'react';
import { ValidateExpediente } from '../services/AplicationServices';

// Tipo para las entradas de caché con timestamp
interface CacheEntry {
  exists: boolean;
  timestamp: number;
}

export const useValidateExpediente = (delay: number = 500) => {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [exists, setExists] = useState<boolean | null>(null);

  // Caché con timestamp para expiración
  const cache = useRef(new Map<string, CacheEntry>());
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tiempo de expiración de caché: 5 minutos
  const CACHE_DURATION_MS = 5 * 60 * 1000;

  useEffect(() => {
    // Limpiar valor vacío
    if (!searchValue.trim()) {
      setExists(null);
      setError(null);
      return;
    }

    // Cancelar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      // Verificar si el valor existe en caché y no ha expirado
      const cachedEntry = cache.current.get(searchValue);
      const now = Date.now();

      if (cachedEntry && (now - cachedEntry.timestamp) < CACHE_DURATION_MS) {
        // Usar valor de caché
        setExists(cachedEntry.exists);
        setError(null);
        setIsChecking(false);
        return;
      }

      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear nuevo AbortController para esta petición
      abortControllerRef.current = new AbortController();
      setIsChecking(true);
      setError(null);

      try {
        const response = await ValidateExpediente(searchValue, abortControllerRef.current);

        // Interpretar respuesta del backend
        // status: false, code: 409 = expediente ya existe
        // status: true, code: 200 = expediente disponible
        const expedientExists = response.status === false && response.code === 409;

        // Guardar en caché con timestamp
        cache.current.set(searchValue, {
          exists: expedientExists,
          timestamp: Date.now()
        });

        setExists(expedientExists);
        setError(null);
      } catch (error: unknown) {
        // Ignorar errores de cancelación
        if (error instanceof Error && error.name !== 'CanceledError') {
          setError(error.message || 'Error al validar el expediente');
          setExists(null);
        }
      } finally {
        setIsChecking(false);
      }
    }, delay);

    // Cleanup: cancelar timeout y petición al desmontar o cambiar searchValue
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [delay, searchValue, CACHE_DURATION_MS]);

  // Limpiar toda la caché
  const clearCache = useCallback(() => {
    cache.current.clear();
    setExists(null);
    setError(null);
  }, []);

  // Invalidar una entrada específica de la caché
  const invalidateCache = useCallback((expedientNumber: string) => {
    cache.current.delete(expedientNumber);
  }, []);

  // Limpiar entradas expiradas de la caché (optimización de memoria)
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    const entries = Array.from(cache.current.entries());

    entries.forEach(([key, value]) => {
      if (now - value.timestamp >= CACHE_DURATION_MS) {
        cache.current.delete(key);
      }
    });
  }, [CACHE_DURATION_MS]);

  return {
    searchValue,
    setSearchValue,
    isChecking,
    error,
    exists,
    clearCache,
    invalidateCache,
    cleanExpiredCache
  };
};