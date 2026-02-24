import type { Pager } from "../../model/aplicationFilterModel";

interface Props {
    pagination: Pager;
    onPrev: () => void;
    onNext: () => void;
}

export default function PaginacionPagos({ pagination, onPrev, onNext }: Props) {
    return (
        <div className="flex flex-wrap justify-between items-center mt-4 text-sm text-gray-500 gap-2">
            <span>
                Página {pagination.currentPage} de {pagination.lastPage} — {pagination.total} registros
            </span>
            <div className="flex gap-2">
                <button
                    disabled={pagination.currentPage <= 1}
                    onClick={onPrev}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <i className="fas fa-chevron-left text-xs"></i> Anterior
                </button>
                <button
                    disabled={pagination.currentPage >= pagination.lastPage}
                    onClick={onNext}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Siguiente <i className="fas fa-chevron-right text-xs"></i>
                </button>
            </div>
        </div>
    );
}
