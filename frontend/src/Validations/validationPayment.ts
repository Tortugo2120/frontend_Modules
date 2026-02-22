import { z } from 'zod';

export const paymentSchema = z.object({
    pagado: z.enum(['0', '1'], { message: 'Seleccione el estado de pago' }),
    estado: z.string().min(1, 'El estado es obligatorio'),
    numero_comprobante: z.string().optional(),
    fecha_pago: z.string().optional(),
}).superRefine((val, ctx) => {
    if (val.pagado === '1') {
        // Validar que el número de comprobante sea obligatorio si está pagado
        if (!val.numero_comprobante || val.numero_comprobante.trim().length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'El número de comprobante es obligatorio si el pago está confirmado',
                path: ['numero_comprobante']
            });
        }

        // Validar que la fecha de pago sea obligatoria si está pagado
        if (!val.fecha_pago || val.fecha_pago.trim().length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'La fecha de pago es obligatoria si el pago está confirmado',
                path: ['fecha_pago']
            });
        } else {
            // Validar que la fecha de pago no sea futura
            const fechaPago = new Date(`${val.fecha_pago}T00:00:00`);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (fechaPago > hoy) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'La fecha de pago no puede ser futura',
                    path: ['fecha_pago']
                });
            }
        }
    }
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
