import type { ComponentType } from "react";

export interface StepComponentProps {
    tipoSolicitudNombre?: string;
    descriptionSolicitud?: string;
    onValidationChange?: (isValid: boolean) => void;
}

/** Definición de un paso dentro de un flujo */
export interface StepConfig {
    /** Etiqueta corta para la barra de progreso */
    label: string;
    /** Etiqueta larga (opcional) para pantallas grandes */
    fullLabel?: string;
    /** Etiqueta extra corta para móvil */
    shortLabel: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: ComponentType<any>;
}

// ─── Identificadores de flujo ─────────────────────────────────────────────────

/**
 * Detecta el "tipo de flujo" a partir del nombre del tipo de solicitud.
 * Devuelve una clave estable ('matrimonio' | 'divorcio' | 'generico').
 */
export type FlowType = 'matrimonio' | 'divorcio' | 'generico';

export function detectFlowType(nombreSolicitud: string): FlowType {
    const lower = nombreSolicitud.toLowerCase();
    if (lower.includes('matrimonio') || lower.includes('matrimonial') || lower.includes('casamiento')) {
        return 'matrimonio';
    }
    if (lower.includes('divorcio') || lower.includes('separación') || lower.includes('disolucion')) {
        return 'divorcio';
    }
    return 'generico';
}

// ─── Registro de pasos por flujo ──────────────────────────────────────────────
// Se usa una función lazy para evitar importaciones circulares en el bundle.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StepsMap = Record<FlowType, StepConfig[]>;

let _cache: StepsMap | null = null;

export async function getStepsForFlow(flow: FlowType): Promise<StepConfig[]> {
    if (!_cache) {
        // Importaciones dinámicas — solo se cargan cuando se necesitan
        const [
            ApplicantForm,
            Contrayente,
            Testigos,
            Weddingdetails,
            Requisitos,
            ConfirmationSummary,
        ] = await Promise.all([
            import("../components/requests/new/Applicantform").then(m => m.default),
            import("../components/requests/new/Matrimonio/Contrayente").then(m => m.default),
            import("../components/requests/new/Matrimonio/Testigos").then(m => m.default),
            import("../components/requests/new/Weddingdetails").then(m => m.default),
            import("../components/requests/new/Matrimonio/Requisitos").then(m => m.default),
            import("../components/requests/new/Confirmationsummary").then(m => m.default),
        ]);

        _cache = {
            matrimonio: [
                { label: 'N° Exp.', fullLabel: 'ediente', shortLabel: 'EXP', component: ApplicantForm },
                { label: 'Prometidos', fullLabel: '', shortLabel: 'Prometidos', component: Contrayente },
                { label: 'Testigos', fullLabel: '', shortLabel: 'Testigos', component: Testigos },
                { label: 'Detalles', fullLabel: ' del matrimonio', shortLabel: 'Detalles', component: Weddingdetails },
                { label: 'Requisitos', fullLabel: '', shortLabel: 'Req.', component: Requisitos },
                { label: 'Confirmación', fullLabel: '', shortLabel: 'Confirm.', component: ConfirmationSummary },
            ],
            divorcio: [
                { label: 'N° Exp.', fullLabel: 'ediente', shortLabel: 'EXP', component: ApplicantForm },
                { label: 'Involucrados', fullLabel: '', shortLabel: 'Involuc.', component: Contrayente },
                { label: 'Requisitos', fullLabel: '', shortLabel: 'Req.', component: Requisitos },
                { label: 'Confirmación', fullLabel: '', shortLabel: 'Confirm.', component: ConfirmationSummary },
            ],
            generico: [
                { label: 'N° Exp.', fullLabel: 'ediente', shortLabel: 'EXP', component: ApplicantForm },
                { label: 'Requisitos', fullLabel: '', shortLabel: 'Req.', component: Requisitos },
                { label: 'Confirmación', fullLabel: '', shortLabel: 'Confirm.', component: ConfirmationSummary },
            ],
        };
    }

    return _cache[flow];
}
