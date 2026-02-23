export interface StepItem {
    label: string;
    fullLabel?: string;
    shortLabel: string;
}

interface StepProgressBarProps {
    currentStep: number;
    steps: StepItem[];
}

export default function StepProgressBar({ currentStep, steps }: StepProgressBarProps) {
    return (
        <>
            {/* Vista Desktop y Tablet */}
            <ol className="hidden sm:flex justify-between items-center w-full p-3 space-x-2 text-sm font-medium text-center text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-4 sm:space-x-4">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center flex-1 justify-center">
                        <li
                            className={`flex items-center font-bold ${currentStep >= index + 1
                                ? 'text-blue-600'
                                : 'text-gray-500'
                                }`}
                        >
                            <span
                                className={`flex items-center justify-center w-5 h-5 text-md shrink-0 ${currentStep >= index + 1
                                    ? 'border-blue-600'
                                    : 'border-gray-500'
                                    }`}
                            >
                                {index + 1}.
                            </span>

                            <div className="flex flex-row gap-0 text-center">
                                <span className="hidden md:inline">{step.label}</span>
                                <span className="md:hidden">{step.shortLabel}</span>
                                {step.fullLabel && (
                                    <span className="hidden lg:inline-flex">{step.fullLabel}</span>
                                )}
                            </div>
                        </li>

                        {index < steps.length - 1 && (
                            <svg
                                className={`w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180 ${currentStep >= index + 1
                                    ? 'text-blue-600'
                                    : 'text-gray-500'}`}
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
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
                    </div>
                ))}
            </ol>

            {/* Vista Mobile - Compacta */}
            <div className="sm:hidden bg-white border border-gray-200 rounded-lg shadow-sm p-3">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-gray-600">
                        Paso {currentStep} de {steps.length}
                    </span>
                    <span className="text-xs font-semibold text-blue-600">
                        {Math.round((currentStep / steps.length) * 100)}%
                    </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / steps.length) * 100}%` }}
                    ></div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-8 h-8 text-sm font-semibold border-2 border-blue-600 text-blue-600 rounded-full">
                        {currentStep}
                    </span>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">
                            {steps[currentStep - 1]?.label}
                        </p>
                        {steps[currentStep - 1]?.fullLabel && (
                            <p className="text-xs text-gray-500">
                                {steps[currentStep - 1]?.fullLabel}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-center gap-1.5">
                    {steps.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 flex-1 rounded-full transition-all ${currentStep >= idx + 1
                                ? 'bg-blue-600'
                                : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
