import {z} from "zod";

export const searchTypeDocument = z.object({
    documentType:z.enum(["dni","pas","ced"]),
    documentNumber:z.string().min(1,'El número de documento es obligatorio'),
}).superRefine((values, ctx)=>{
    if (values.documentType === 'dni') {
        if (!/^\d+$/.test(values.documentNumber)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El DNI solo debe contener números",
                path: ['documentNumber'],
            });
        } else if (values.documentNumber.length !== 8) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "El DNI debe tener exactamente 8 dígitos",
                path: ['documentNumber'],
            });
        }
    }

    if (values.documentType === 'pas') {
        if (values.documentNumber.length < 6) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Pasaporte inválido (mínimo 6 caracteres)",
                path: ['documentNumber'],
            });
        }
    }

    // Validación para CÉDULA (Ejemplo: 10 dígitos)
    if (values.documentType === 'ced') {
        if (!/^\d+$/.test(values.documentNumber)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La cédula solo debe contener números",
                path: ['documentNumber'],
            });
        } else if (values.documentNumber.length !== 10) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La cédula debe tener exactamente 10 dígitos",
                path: ['documentNumber'],
            });
        }
    }
});