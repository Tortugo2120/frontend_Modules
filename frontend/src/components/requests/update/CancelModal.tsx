import { useState } from 'react';

interface Props {
    expediente: string | undefined;
    nombreSolicitud: string | undefined;
    cancelling: boolean;
    cancelError: string | null;
    onClose: () => void;
    onConfirm: (motivo: string) => void;
}

export default function CancelModal({
    expediente,
    nombreSolicitud,
    cancelling,
    cancelError,
    onClose,
    onConfirm,
}: Props) {
    const [motivo, setMotivo] = useState('');
    const [motivoError, setMotivoError] = useState('');

    const handleConfirm = () => {
        if (!motivo.trim()) {
            setMotivoError('El motivo de anulación es obligatorio');
            return;
        }
        setMotivoError('');
        onConfirm(motivo.trim());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4">
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                        <i className="fas fa-ban text-red-600 text-2xl fa-beat-fade"/>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">¿Anular solicitud?</h2>
                    <p className="text-lg text-gray-500">
                        Esta acción anulará la solicitud{' '}
                        N°<span className="font-semibold text-2xl text-gray-800"> {expediente} </span>
                        de{' '}
                        <span className="font-semibold text-gray-700">{nombreSolicitud}</span>.{' '}
                        <span className="block mt-1 text-sm">Esta operación no se puede deshacer.</span>
                    </p>
                </div>

                {/* Motivo de anulación */}
                <div className="mt-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo de anulación <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        rows={3}
                        value={motivo}
                        onChange={(e) => {
                            setMotivo(e.target.value);
                            if (e.target.value.trim()) setMotivoError('');
                        }}
                        disabled={cancelling}
                        placeholder="Describa el motivo por el cual se anula esta solicitud..."
                        className={`w-full px-3 py-2 text-sm border rounded-xl outline-0 resize-none focus:ring-2 focus:ring-red-400 transition-all ${
                            motivoError ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`}
                    />
                    {motivoError && (
                        <p className="text-xs text-red-500 mt-1">{motivoError}</p>
                    )}
                </div>

                {cancelError && (
                    <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 w-full mt-3">
                        {cancelError}
                    </p>
                )}

                <div className="flex gap-3 mt-5">
                    <button
                        onClick={onClose}
                        disabled={cancelling}
                        className="flex-1 border border-gray-500 text-gray-600 hover:bg-gray-50 font-medium py-2 rounded-xl transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={cancelling}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                        {cancelling ? (
                            <>
                                <span className="loading loading-spinner loading-sm" />
                                Anulando...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-ban" />
                                Confirmar anulación
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
