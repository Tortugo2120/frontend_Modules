import { z } from 'zod';

// Función auxiliar para calcular edad
const calcularEdad = (fechaNacimiento: string): number => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }

    return edad;
};

// Validación personalizada para solo letras y espacios (permite tildes y ñ)
const soloLetrasRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

export const solicitanteSchema = z.object({
    dni: z
        .string()
        .min(1, 'El DNI es obligatorio')
        .length(8, 'El DNI debe tener exactamente 8 dígitos')
        .regex(/^\d{8}$/, 'El DNI solo debe contener números'),

    nombres: z
        .string()
        .min(1, 'Los nombres son obligatorios')
        .min(2, 'Los nombres deben tener al menos 2 caracteres')
        .max(100, 'Los nombres no pueden exceder 100 caracteres')
        .regex(soloLetrasRegex, 'Los nombres solo pueden contener letras y espacios')
        .refine((val) => val.trim().length > 0, {
            message: 'Los nombres no pueden estar vacíos',
        }),

    apellidoPaterno: z
        .string()
        .min(1, 'El apellido paterno es obligatorio')
        .min(2, 'El apellido paterno debe tener al menos 2 caracteres')
        .max(50, 'El apellido paterno no puede exceder 50 caracteres')
        .regex(soloLetrasRegex, 'El apellido paterno solo puede contener letras y espacios')
        .refine((val) => val.trim().length > 0, {
            message: 'El apellido paterno no puede estar vacío',
        }),

    apellidoMaterno: z
        .string()
        .min(1, 'El apellido materno es obligatorio')
        .min(2, 'El apellido materno debe tener al menos 2 caracteres')
        .max(50, 'El apellido materno no puede exceder 50 caracteres')
        .regex(soloLetrasRegex, 'El apellido materno solo puede contener letras y espacios')
        .refine((val) => val.trim().length > 0, {
            message: 'El apellido materno no puede estar vacío',
        }),

    fecha_nacimiento: z
        .string()
        .min(1, 'La fecha de nacimiento es obligatoria')
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
        .refine((fecha) => {
            const fechaDate = new Date(fecha);
            return !isNaN(fechaDate.getTime());
        }, {
            message: 'Fecha de nacimiento inválida',
        })
        .refine((fecha) => {
            const edad = calcularEdad(fecha);
            return edad >= 18;
        }, {
            message: 'Debe ser mayor de 18 años',
        })
        .refine((fecha) => {
            const fechaDate = new Date(fecha);
            const hoy = new Date();
            return fechaDate <= hoy;
        }, {
            message: 'La fecha de nacimiento no puede ser futura',
        }),

    direccion: z
        .string()
        .min(1, 'La dirección es obligatoria')
        .min(5, 'La dirección debe tener al menos 5 caracteres')
        .max(200, 'La dirección no puede exceder 200 caracteres')
        .refine((val) => val.trim().length > 0, {
            message: 'La dirección no puede estar vacía',
        }),

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
        .regex(/^9\d{8}$/, 'El teléfono debe empezar con 9 y tener 9 dígitos'),

    ubigeo: z
        .string()
        .min(1, 'El ubigeo es obligatorio')
        .length(6, 'El ubigeo debe tener exactamente 6 dígitos')
        .regex(/^\d{6}$/, 'El ubigeo solo debe contener números'),

});




