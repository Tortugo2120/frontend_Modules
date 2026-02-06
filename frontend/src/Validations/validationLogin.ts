import { z } from 'zod';

export const loginSchema = z.object({
    username: z.string()
        .min(8, { message: "El usuario debe tener 8 dígitos" })
        .max(8, { message: "El usuario debe tener 8 dígitos" })
        .regex(/^\d+$/, { message: "El usuario debe contener solo números" }),
    password: z.string()
        .min(4, { message: "La contraseña es muy corta" }),
    rememberMe: z.boolean().optional()
});