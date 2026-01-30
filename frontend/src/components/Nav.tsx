import { Link } from "react-router-dom";
import { useState } from "react";

type NavProps = {
    onLinkClick?: () => void;
    setActiveView?: (view: string) => void;
}

export function Nav({ onLinkClick, setActiveView }: NavProps) {
    const [openDropdown, setOpenDropdown] = useState(false);

    const handleDropdownToggle = () => {
        setOpenDropdown(!openDropdown);
    };

    const handleDropdownLink = (view: string) => {
        if (setActiveView) {
            setActiveView(view);
        }
        setOpenDropdown(false);
        if (onLinkClick) {
            onLinkClick();
        }
    };

    return (
        <nav className={"flex-1 px-5 py-6 overflow-y-auto"} aria-label="Primary">
            <ul className={"space-y-2"}>
                <li>
                    <Link to={"/dashboard/Home"} onClick={onLinkClick} className={"flex items-center gap-4 px-4 py-3.5 bg-slate text-white hover:bg-slate hover:text-slate-300 transition-colors"}>
                        <i className="fas fa-th-large w-5 text-center text-s"></i>
                        <span className={"font-medium text-md"}>Inicio</span>
                    </Link>
                </li>
                <li>
                    <button onClick={handleDropdownToggle} className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-white hover:bg-slate hover:text-slate-300 transition-colors rounded">
                        <div className="flex items-center gap-4">
                            <i className="fas fa-folder-open w-5 text-center text-md"></i>
                            <span className="font-normal text-md">Solicitudes</span>
                        </div>
                        <i className={`fas fa-chevron-down transition-transform ${openDropdown ? 'rotate-180' : ''}`}></i>
                    </button>
                    {openDropdown && (
                        <ul className="ml-4 mt-2 space-y-2">
                            <li>
                                <button onClick={() => handleDropdownLink("new-request")} className="w-full text-left flex items-center gap-4 px-4 py-3 text-white hover:bg-slate hover:text-slate-300 transition-colors rounded">
                                    <i className="fas fa-plus w-5 text-center text-md"></i>
                                    <span className="font-normal text-sm">Crear solicitud</span>
                                </button>
                            </li>
                            <li>
                                <button onClick={() => handleDropdownLink("history-request")} className="w-full text-left flex items-center gap-4 px-4 py-3 text-white hover:bg-slate hover:text-slate-300 transition-colors rounded">
                                    <i className="fas fa-history w-5 text-center text-md"></i>
                                    <span className="font-normal text-sm">Ver historial</span>
                                </button>
                            </li>
                        </ul>
                    )}
                </li>
                <li>
                    <Link to={"/dashboard/pagos"} onClick={onLinkClick} className="flex items-center gap-4 px-4 py-3.5 text-white hover:bg-slate hover:text-slate-300 transition-colors">
                        <i className="fas fa-money-bill-wave w-5 text-center text-md"></i>
                        <span className="font-normal text-md">Pagos</span>
                    </Link>
                </li>
                <li>
                    <Link to={"/dashboard/documentos"} onClick={onLinkClick} className="flex items-center gap-4 px-4 py-3.5 text-white hover:bg-slate hover:text-slate-300 transition-colors">
                        <i className="fas fa-file-alt w-5 text-center text-md"></i>
                        <span className="font-normal text-md">Documentos</span>
                    </Link>
                </li>
                <li>
                    <Link to={"/dashboard/reportes"} onClick={onLinkClick} className="flex items-center gap-4 px-4 py-3.5 text-white hover:bg-slate hover:text-slate-300 transition-colors">
                        <i className="fas fa-chart-bar w-5 text-center text-md"></i>
                        <span className="font-normal text-md">Reportes</span>
                    </Link>
                </li>
            </ul>
        </nav>
    )
}