import {Link} from "react-router-dom";

type NavProps = {
    onLinkClick?: () => void;
}

export function Nav({onLinkClick}: NavProps){
    return (
        <nav className={"flex-1 px-5 py-6 overflow-y-auto"} aria-label="Primary">
            <ul className={"space-y-2"}>
                <li>
                    <Link to={"/dashboard/Home"} onClick={onLinkClick} className={"flex items-center gap-4 px-4 py-3.5 bg-slate text-white transition-colors"}>
                        <i className="fas fa-th-large w-5 text-center text-sm"></i>
                        <span className={"font-medium text-sm"}>Inicio</span>
                    </Link>
                </li>
                <li>
                    <Link to={"/dashboard/solicitudes"} onClick={onLinkClick} className="flex items-center gap-4 px-4 py-3.5 text-blue-100 hover:bg-slate hover:text-white transition-colors">
                        <i className="fas fa-folder-open w-5 text-center text-sm"></i>
                        <span className="font-normal text-sm">Solicitudes</span>
                    </Link>
                </li>
                <li>
                    <Link to={"/dashboard/pagos"} onClick={onLinkClick} className="flex items-center gap-4 px-4 py-3.5 text-blue-100 hover:bg-slate hover:text-white transition-colors">
                        <i className="fas fa-money-bill-wave w-5 text-center text-sm"></i>
                        <span className="font-normal text-sm">Pagos</span>
                    </Link>
                </li>
                <li>
                    <Link to={"/dashboard/documentos"} onClick={onLinkClick} className="flex items-center gap-4 px-4 py-3.5 text-blue-100 hover:bg-slate hover:text-white transition-colors">
                        <i className="fas fa-file-alt w-5 text-center text-sm"></i>
                        <span className="font-normal text-sm">Documentos</span>
                    </Link>
                </li>
                <li>
                    <Link to={"/dashboard/reportes"} onClick={onLinkClick} className="flex items-center gap-4 px-4 py-3.5 text-blue-100 hover:bg-slate hover:text-white transition-colors">
                        <i className="fas fa-chart-bar w-5 text-center text-sm"></i>
                        <span className="font-normal text-sm">Reportes</span>
                    </Link>
                </li>
            </ul>
        </nav>
    )
}