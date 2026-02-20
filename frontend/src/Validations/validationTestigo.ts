import { z } from 'zod';

export const testigoSchema = z.object({
    documentTypeId: z.number().min(1).max(3),
    cui: z
        .string().min(1, 'El CUI es obligatorio'),
    names: z
        .string()
        .min(1, 'Los nombres son obligatorios')
        .min(2, 'Los nombres deben tener al menos 2 caracteres')
        .max(100, 'Los nombres no pueden exceder 100 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Los nombres solo pueden contener letras y espacios'),

    paternalSurname: z
        .string()
        .min(1, 'El apellido paterno es obligatorio')
        .min(2, 'El apellido paterno debe tener al menos 2 caracteres')
        .max(50, 'El apellido paterno no puede exceder 50 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido paterno solo puede contener letras y espacios'),

    maternalSurname: z
        .string()
        .min(1, 'El apellido materno es obligatorio')
        .min(2, 'El apellido materno debe tener al menos 2 caracteres')
        .max(50, 'El apellido materno no puede exceder 50 caracteres')
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido materno solo puede contener letras y espacios'),

    birthdate: z
        .string()
        .min(1, 'La fecha de nacimiento es obligatoria'),

    gender: z
        .enum(['M', 'F'], {
            message: 'Debe seleccionar el sexo (Masculino o Femenino)'
        }),

    address: z
        .string()
        .min(1, 'La dirección es obligatoria')
        .min(5, 'La dirección debe tener al menos 5 caracteres')
        .max(200, 'La dirección no puede exceder 200 caracteres'),

    email: z
        .string()
        .min(1, 'El correo electrónico es obligatorio')
        .email('Ingrese un correo electrónico válido')
        .max(100, 'El correo no puede exceder 100 caracteres')
        .toLowerCase(),

    phone: z
        .string()
        .min(1, 'El teléfono es obligatorio')
        .length(9, 'El teléfono debe tener exactamente 9 dígitos')
        .regex(/^9\d{8}$/, 'El teléfono debe empezar con 9 y contener solo números'),

    ubigeoId: z
        .string()
        .min(1, 'El ubigeo es obligatorio')
        .length(6, 'El ubigeo debe tener exactamente 6 dígitos')
        .regex(/^\d{6}$/, 'El ubigeo debe contener solo números'),

    maritalStatus: z
        .enum(['Soltero', 'Casado', 'Divorciado', 'Viudo'], {
            message: 'Debe seleccionar un estado civil válido'
        }),
}).superRefine((values, ctx) => {
    if(values.documentTypeId ===1){
        if (!/^\d{8}$/.test(values.cui)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El DNI debe tener 8 dígitos numéricos",
            });
        }
    }
    else{
        if (values.cui.length < 5 || values.cui.length > 25) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El documento debe tener entre 5 y 25 caracteres",
            });
        }
    }

    const birthDate = new Date(values.birthdate);
    const today = new Date();

    if (birthDate > today) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'La fecha de nacimiento no puede ser futura',
            path: ['birthdate'],
        });
    }

    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const isAdult = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1 >= 18
        : age >= 18;

    if (!isAdult) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'El testigo debe ser mayor de 18 años',
            path: ['birthdate'],
        });
    }
});

export type TestigoFormData = z.infer<typeof testigoSchema>;
