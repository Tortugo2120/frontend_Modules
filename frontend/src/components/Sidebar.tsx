import { Link } from "react-router-dom";
import { useState } from "react";

type NavProps = {
    onLinkClick?: () => void;
    setActiveView?: (view: string) => void;
}

export function Nav({ onLinkClick }: NavProps) {
    const [openSolicitudes, setOpenSolicitudes] = useState(false);
    const [openDocumentos, setOpenDocumentos] = useState(false);

    const handleSolicitudesToggle = () => {
        setOpenSolicitudes(!openSolicitudes);
    };

    const handleDocumentosToggle = () => {
        setOpenDocumentos(!openDocumentos);
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
                    <button onClick={handleSolicitudesToggle} className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-white hover:bg-slate hover:text-slate-300 transition-colors rounded">
                        <div className="flex items-center gap-4">
                            <i className="fas fa-folder-open w-5 text-center text-md"></i>
                            <span className="font-normal text-md">Solicitudes</span>
                        </div>
                        <i className={`fas fa-chevron-down transition-transform ${openSolicitudes ? 'rotate-180' : ''}`}></i>
                    </button>
                    {openSolicitudes && (
                        <ul className="ml-4 mt-2 space-y-2">
                            <li>
                                <Link to={"/dashboard/solicitud/new"} className="w-full text-left flex items-center gap-4 px-4 py-3 text-white hover:bg-slate hover:text-slate-300 transition-colors rounded">
                                    <i className="fas fa-plus w-5 text-center text-md"></i>
                                    <span className="font-normal text-sm">Crear solicitud</span>
                                </Link>
                            </li>
                            <li>
                                <Link to={"/dashboard/solicitud/history"} className="w-full text-left flex items-center gap-4 px-4 py-3 text-white hover:bg-slate hover:text-slate-300 transition-colors rounded">
                                    <i className="fas fa-history w-5 text-center text-md"></i>
                                    <span className="font-normal text-sm">Ver historial</span>
                                </Link>
                            </li>
                        </ul>
                    )}
                </li>
                <li>
                    <button onClick={handleDocumentosToggle} className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-white hover:bg-slate hover:text-slate-300 transition-colors rounded">
                        <div className="flex items-center gap-4">
                            <i className="fas fa-file-alt w-5 text-center text-md"></i>
                            <span className="font-normal text-md">Documentos</span>
                        </div>
                        <i className={`fas fa-chevron-down transition-transform ${openDocumentos ? 'rotate-180' : ''}`}></i>
                    </button>
                    {openDocumentos && (
                        <ul className="ml-4 mt-2 space-y-2">
                            <li>
                                <Link to={"/dashboard/documentos/emitir"} className="w-full text-left flex items-center gap-4 px-4 py-3 text-white hover:bg-slate hover:text-slate-300 transition-colors rounded">
                                    <i className="fa-solid fa-file-import w-5 text-center text-md"></i>
                                    <span className="font-normal text-sm">Emitir Doc.</span>
                                </Link>
                            </li>
                            <li>
                                <Link to={"/dashboard/documentos/ver"} className="w-full text-left flex items-center gap-4 px-4 py-3 text-white hover:bg-slate hover:text-slate-300 transition-colors rounded">
                                    <i className="fa-regular fa-file w-5 text-center text-md"></i>
                                    <span className="font-normal text-sm">Ver Doc.</span>
                                </Link>
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
                    <Link to={"/dashboard/reportes"} onClick={onLinkClick} className="flex items-center gap-4 px-4 py-3.5 text-white hover:bg-slate hover:text-slate-300 transition-colors">
                        <i className="fas fa-chart-bar w-5 text-center text-md"></i>
                        <span className="font-normal text-md">Reportes</span>
                    </Link>
                </li>
            </ul>
        </nav>
    )
}