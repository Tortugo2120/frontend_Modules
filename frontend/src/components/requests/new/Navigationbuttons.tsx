interface NavigationButtonsProps {
    currentStep: number;
    totalSteps: number;
    canProceed: boolean;
    onPrevious: () => void;
    onNext: () => void;
}

export default function NavigationButtons({
    currentStep,
    totalSteps,
    canProceed,
    onPrevious,
    onNext
}: NavigationButtonsProps) {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    return (
        <div className="bg-gray-50 px-8 py-6 flex justify-between items-center border-t border-gray-200">
            <button
                type="button"
                onClick={onPrevious}
                disabled={isFirstStep}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${isFirstStep
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md'
                    }`}
            >
                <i className="fas fa-arrow-left"></i>
                Anterior
            </button>

            {!isLastStep ? (
                <button
                    type="button"
                    onClick={onNext}
                    disabled={!canProceed}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all cursor-pointer ${!canProceed
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-105'
                        }`}
                >
                    Siguiente
                    <i className="fas fa-arrow-right"></i>
                </button>
            ) : (
                <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                >
                    <i className="fas fa-check-circle"></i>
                    Confirmar Solicitud
                </button>
            )}
        </div>
    );
}