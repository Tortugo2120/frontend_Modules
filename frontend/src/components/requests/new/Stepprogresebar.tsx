interface StepProgressBarProps {
    currentStep: number;
}

export default function StepProgressBar({ currentStep }: StepProgressBarProps) {
    const steps = [
        { number: 1, label: 'Tipo', fullLabel: 'de Solicitud' },
        { number: 2, label: 'Solicitantes', fullLabel: '' },
        { number: 3, label: 'Detalles', fullLabel: 'del trámite' },
        { number: 4, label: 'Resumen', fullLabel: 'del trámite' },
        { number: 5, label: 'Confirmación', fullLabel: 'de Solicitud' }
    ];

    return (
        <ol className="flex justify-between items-center w-full p-3 space-x-2 text-sm font-medium text-center text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-4 sm:space-x-4">
            {steps.map((step, index) => (
                <li
                    key={step.number}
                    className={`flex items-center ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'}`}
                >
                    <span
                        className={`flex items-center justify-center w-5 h-5 me-2 text-xs border rounded-full shrink-0 ${
                            currentStep >= step.number ? 'border-blue-600' : 'border-gray-500'
                        }`}
                    >
                        {step.number}
                    </span>
                    {step.label}{' '}
                    {step.fullLabel && <span className="hidden sm:inline-flex ms-2">{step.fullLabel}</span>}
                    {index < steps.length - 1 && (
                        <svg
                            className="w-5 h-5 ms-2 rtl:rotate-180"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="m7 16 4-4-4-4m6 8 4-4-4-4"
                            />
                        </svg>
                    )}
                </li>
            ))}
        </ol>
    );
}