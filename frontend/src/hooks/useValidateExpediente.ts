import {useEffect, useRef, useState} from 'react';
import { ValidateExpediente } from '../services/AplicationServices';

export const useValidateExpediente = (delay: number = 500) => {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [exists, setExists] = useState<boolean | null>(null);

  const cache = useRef(new Map<string, boolean>());

  useEffect(() => {
    if (!searchValue.trim()) {
      setExists(null);
      return;
    }

    // Verificamos si el valor ya existe en cache
    if (cache.current.has(searchValue)) {
      setExists(cache.current.get(searchValue) || false);
      setIsChecking(false);
      return;
    }

    const controller = new AbortController();
    setIsChecking(true);
    setError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await ValidateExpediente(searchValue, controller);

        // status: false, code: 409 = expediente ya existe
        // status: true, code: 200 = expediente disponible
        const expedientExists = response.status === false && response.code === 409;

        cache.current.set(searchValue, expedientExists);
        setExists(expedientExists);
        setError(null);
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'CanceledError') {
          setError(error.message || 'Error al validar el expediente');
        }
      } finally {
        setIsChecking(false);
      }
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [delay, searchValue]);

  const clearCache = () => {
    cache.current.clear();
  };

  return { searchValue, setSearchValue, isChecking, error, exists, clearCache };
};