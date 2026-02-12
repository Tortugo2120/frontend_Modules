interface NavigationButtonsProps {
    currentStep: number;
    totalSteps: number;
    canProceed: boolean;
    onPrevious: () => void;
    onNext: () => void;
    disabledMessage?: string; // Mensaje personalizado cuando no se puede avanzar
    isLoading?: boolean; // Para mostrar estado de carga
}

export default function NavigationButtons({
    currentStep,
    totalSteps,
    canProceed,
    onPrevious,
    onNext,
    disabledMessage = "Complete todos los campos requeridos para continuar",
    isLoading = false
}: NavigationButtonsProps) {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    return (
        <div className="bg-gray-50 px-4 sm:px-8 py-4 sm:py-6 border-t border-gray-200">
            {/* Mensaje informativo cuando no se puede avanzar */}
            {!canProceed && !isLastStep && (
                <div className="mb-4 bg-orange-50 border-l-4 border-orange-400 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-start gap-2 sm:gap-3">
                        <i className="fas fa-exclamation-triangle text-orange-600 text-sm sm:text-base mt-0.5"></i>
                        <div className="flex-1">
                            <p className="text-xs sm:text-sm font-medium text-orange-800">
                                No puede avanzar al siguiente paso
                            </p>
                            <p className="text-xs text-orange-700 mt-1">
                                {disabledMessage}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Botones de navegación */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between items-stretch sm:items-center">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={isFirstStep || isLoading}
                    className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all ${
                        isFirstStep || isLoading
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md'
                    }`}
                >
                    <i className="fas fa-arrow-left text-sm"></i>
                    <span className="text-sm sm:text-base">Anterior</span>
                </button>

                {/* Indicador de paso actual */}
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">
                        Paso {currentStep} de {totalSteps}
                    </span>
                    <div className="flex gap-1">
                        {Array.from({ length: totalSteps }).map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 w-8 rounded-full transition-all ${
                                    index + 1 === currentStep
                                        ? 'bg-blue-600'
                                        : index + 1 < currentStep
                                        ? 'bg-green-500'
                                        : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {!isLastStep && (
                    <div className="relative group">
                        <button
                            type="button"
                            onClick={onNext}
                            disabled={!canProceed || isLoading}
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all ${
                                !canProceed || isLoading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:scale-105 cursor-pointer'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin text-sm"></i>
                                    <span className="text-sm sm:text-base">Procesando...</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-sm sm:text-base">Siguiente</span>
                                    <i className="fas fa-arrow-right text-sm"></i>
                                </>
                            )}
                        </button>
                        
                        {/* Tooltip para desktop cuando está deshabilitado */}
                        {!canProceed && !isLoading && (
                            <div className="hidden sm:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                {disabledMessage}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                    <div className="border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Indicador de paso para móvil */}
            <div className="sm:hidden mt-3 flex items-center justify-center gap-2 text-xs text-gray-600">
                <span className="font-medium">
                    Paso {currentStep} de {totalSteps}
                </span>
                <div className="flex gap-1">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 w-6 rounded-full transition-all ${
                                index + 1 === currentStep
                                    ? 'bg-blue-600'
                                    : index + 1 < currentStep
                                    ? 'bg-green-500'
                                    : 'bg-gray-300'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}