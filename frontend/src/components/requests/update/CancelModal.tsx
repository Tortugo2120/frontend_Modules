interface Props {
    expediente: string | undefined;
    nombreSolicitud: string | undefined;
    cancelling: boolean;
    cancelError: string | null;
    onClose: () => void;
    onConfirm: () => void;
}

export default function CancelModal({
    expediente,
    nombreSolicitud,
    cancelling,
    cancelError,
    onClose,
    onConfirm,
}: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4">
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                        <i className="fas fa-ban text-red-600 text-2xl"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">¿Anular solicitud?</h2>
                    <p className="text-lg text-gray-500">
                        Esta acción anulará la solicitud{" "}
                        N°<span className="font-semibold text-2xl text-gray-800"> {expediente} </span>
                        de{" "}
                        <span className="font-semibold text-gray-700">{nombreSolicitud}</span>.{" "}
                        <div>Esta operación no se puede deshacer.</div>
                    </p>
                    {cancelError && (
                        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 w-full">
                            {cancelError}
                        </p>
                    )}
                </div>
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={cancelling}
                        className="flex-1 border border-gray-500 text-gray-600 hover:bg-gray-50 font-medium py-2 rounded-xl transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={cancelling}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                        {cancelling ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Anulando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-ban"></i>
                                Confirmar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
