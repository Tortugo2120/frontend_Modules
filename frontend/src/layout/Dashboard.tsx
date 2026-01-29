import {Nav} from "../components/Nav.tsx";
import {Outlet} from "react-router-dom";

export default function Dashboard(){
    return(
        <>
            <Nav/>
            <main>
                <Outlet/>
            </main>
        </>
    )
}