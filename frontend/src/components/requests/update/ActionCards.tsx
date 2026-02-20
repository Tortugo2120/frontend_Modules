import { useNavigate } from "react-router-dom";
import { ACTION_CARDS, COLOR_MAP } from "../../../Types/requests/update/constants.ts";
import type { ApplicationDetailItem } from "../../../model/detailRequestModel.ts";

interface Props {
    id: string | undefined;
    application: ApplicationDetailItem | null;
}

export default function ActionCards({ id, application }: Props) {
    const navigate = useNavigate();

    return (
        <section>
            <p className="text-xl font-semibold text-gray-800 text-shadow-xl/30 text-center uppercase tracking-widest mb-3">
                Seleccione una sección para editar
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ACTION_CARDS.map(card => {
                    const c = COLOR_MAP[card.color];
                    const stateToSend =
                        card.key === "pagos"
                            ? { id, paymentId: application?.pago?.id.toString() }
                            : { id };
                    return (
                        <button
                            key={card.key}
                            onClick={() => id && navigate(card.path, { state: stateToSend })}
                            className={`group text-left bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${c.bg}`}
                        >
                            <div className="flex items-center mb-4">
                                <div className={`w-11 h-11 rounded-xl ${c.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                                    <i className={`fas ${card.icon} ${c.iconText} text-lg`}></i>
                                </div>
                                <h3 className="font-semibold text-gray-800 text-lg ml-4">{card.label}</h3>
                            </div>
                            <p className="text-base text-gray-400 leading-relaxed mb-4">{card.description}</p>
                            <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${c.badge}`}>
                                Editar <i className="fas fa-arrow-right text-xs"></i>
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
