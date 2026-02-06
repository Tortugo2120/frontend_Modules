import { z } from 'zod';

/**
 * Schema de validación para datos del solicitante
 * Incluye todas las validaciones necesarias con mensajes en español
 */

// Validaciones personalizadas
const validateDNI = (dni: string) => {
    // Solo números y exactamente 8 dígitos
    return /^\d{8}$/.test(dni);
};

const validatePhone = (phone: string) => {
    // Debe empezar con 9 y tener exactamente 9 dígitos
    return /^9\d{8}$/.test(phone);
};

const validateUbigeo = (ubigeo: string) => {
    // Exactamente 6 dígitos
    return /^\d{6}$/.test(ubigeo);
};

const validateAdult = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return age - 1 >= 18;
    }
    
    return age >= 18;
};

const validateNotFutureDate = (date: string) => {
    const today = new Date();
    const inputDate = new Date(date);
    return inputDate <= today;
};

// Schema principal
export const solicitanteSchema = z.object({
    dni: z
        .string()
        .min(1, 'El DNI es obligatorio')
        .length(8, 'El DNI debe tener exactamente 8 dígitos')
        .refine(validateDNI, {
            message: 'El DNI debe contener solo números'
        }),
    
    nombres: z
        .string()
        .min(1, 'Los nombres son obligatorios')
        .min(2, 'Los nombres deben tener al menos 2 caracteres')
        .max(100, 'Los nombres no pueden exceder 100 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
            message: 'Los nombres solo pueden contener letras y espacios'
        }),
    
    apellidoPaterno: z
        .string()
        .min(1, 'El apellido paterno es obligatorio')
        .min(2, 'El apellido paterno debe tener al menos 2 caracteres')
        .max(50, 'El apellido paterno no puede exceder 50 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
            message: 'El apellido paterno solo puede contener letras y espacios'
        }),
    
    apellidoMaterno: z
        .string()
        .min(1, 'El apellido materno es obligatorio')
        .min(2, 'El apellido materno debe tener al menos 2 caracteres')
        .max(50, 'El apellido materno no puede exceder 50 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
            message: 'El apellido materno solo puede contener letras y espacios'
        }),
    
    fecha_nacimiento: z
        .string()
        .min(1, 'La fecha de nacimiento es obligatoria')
        .refine(validateNotFutureDate, {
            message: 'La fecha de nacimiento no puede ser futura'
        })
        .refine(validateAdult, {
            message: 'El solicitante debe ser mayor de 18 años'
        }),
    
    direccion: z
        .string()
        .min(1, 'La dirección es obligatoria')
        .min(5, 'La dirección debe tener al menos 5 caracteres')
        .max(200, 'La dirección no puede exceder 200 caracteres'),
    
    correo: z
        .string()
        .min(1, 'El correo electrónico es obligatorio')
        .email('Ingrese un correo electrónico válido')
        .max(100, 'El correo no puede exceder 100 caracteres')
        .toLowerCase(),
    
    telefono: z
        .string()
        .min(1, 'El teléfono es obligatorio')
        .length(9, 'El teléfono debe tener exactamente 9 dígitos')
        .refine(validatePhone, {
            message: 'El teléfono debe empezar con 9 y contener solo números'
        }),
    
    ubigeo: z
        .string()
        .min(1, 'El ubigeo es obligatorio')
        .length(6, 'El ubigeo debe tener exactamente 6 dígitos')
        .refine(validateUbigeo, {
            message: 'El ubigeo debe contener solo números'
        }),
});



// Tipos TypeScript derivados
export type SolicitanteFormData = z.infer<typeof solicitanteSchema>;


// Validaciones individuales exportables
export const validators = {
    isDNIValid: validateDNI,
    isPhoneValid: validatePhone,
    isUbigeoValid: validateUbigeo,
    isAdult: validateAdult,
    isNotFutureDate: validateNotFutureDate,
};

// Mensajes de validación reutilizables
export const validationMessages = {
    required: (field: string) => `${field} es obligatorio`,
    minLength: (field: string, min: number) => `${field} debe tener al menos ${min} caracteres`,
    maxLength: (field: string, max: number) => `${field} no puede exceder ${max} caracteres`,
    onlyLetters: (field: string) => `${field} solo puede contener letras y espacios`,
    onlyNumbers: (field: string) => `${field} solo puede contener números`,
    invalidFormat: (field: string) => `Formato de ${field} inválido`,
    mustBeAdult: 'Debe ser mayor de 18 años',
    cannotBeFuture: 'La fecha no puede ser futura',
};

export default solicitanteSchema;