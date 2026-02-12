import { useState } from 'react';
import { ValidateExpediente } from '../services/AplicationServices';

export const useValidateExpediente = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = async (expediente: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const isValid = await ValidateExpediente(expediente);
      console.log("Validando desde el useHook: ",isValid);
      if (!isValid) {
        setError('El expediente ya existe');
      }

      return isValid;
    } catch (error:any) {
      console.error('Error al validar expediente:', error.response);
      setError('Error al validar el expediente');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { validate, loading, error };
};