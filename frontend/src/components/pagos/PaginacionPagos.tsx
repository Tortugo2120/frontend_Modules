import type { PaymentHistoryPager } from "../../model/paymentHistoryModel";

interface Props {
    pagination: PaymentHistoryPager;
    onPrev: () => void;
    onNext: () => void;
}

export default function PaginacionPagos({ pagination, onPrev, onNext }: Props) {
    return (
        <div className="flex flex-wrap justify-between items-center mt-4 text-base text-gray-800 gap-2">
            <span>
                Página {pagination.currentPage} de {pagination.lastPage} — {pagination.total} registros
            </span>
            <div className="flex gap-2">
                <button
                    disabled={pagination.currentPage <= 1}
                    onClick={onPrev}
                    className="inline-flex items-center gap-1 px-5 py-3 rounded-lg border-2 border-blue-300 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold cursor-pointer"
                >
                    <i className="fas fa-chevron-left text-xs"></i> Anterior
                </button>
                <button
                    disabled={pagination.currentPage >= pagination.lastPage}
                    onClick={onNext}
                    className="inline-flex items-center gap-1 px-5 py-3 rounded-lg border-2 border-blue-300 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold cursor-pointer"
                >
                    Siguiente <i className="fas fa-chevron-right text-xs"></i>
                </button>
            </div>
        </div>
    );
}

