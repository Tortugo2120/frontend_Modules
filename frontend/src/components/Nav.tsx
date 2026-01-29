import {Link} from "react-router-dom";

export function Nav(){
    return (
        <nav>
            <Link to={"/dashboard/Home"}>Inicio</Link>
            <Link to={"/dashboard/solicitudes"}>Solicitudes</Link>
            <Link to={"/dashboard/pagos"}>Pagos</Link>
            <Link to={"/dashboard/documentos"}>Documentos</Link>
            <Link to={"/dashboard/reportes"}>Reportes</Link>
        </nav>
    )
}