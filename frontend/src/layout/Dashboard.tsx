import { Nav } from "../components/Sidebar.tsx";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import logo from '../assets/logo-muni.jpg';
import NavBar from "../components/NavBar.tsx";
import { Auth } from "../context/AuthContext.tsx";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("home");
  const toggleSidebar = () => setSidebarOpen((v) => !v);
  const closeSidebar = () => setSidebarOpen(false);
  const { user, logout } = Auth();
  return (
    <div className={"flex min-h-screen"}>

      <div
        className={`${sidebarOpen ? "block" : "hidden"} lg:hidden fixed inset-0 bg-black/40 z-40`}
        onClick={closeSidebar}
      />

      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} w-72 bg-info-content text-slate-50 flex flex-col min-h-svh fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 lg:translate-x-0`}
      >
        <div className="px-8 py-4 border-b border-slate-700">
          <div className="flex items-center flex-col gap-2 ">
            <img src={logo} alt="Logo" className="w-16 h-16 object-contain realtive rounded-full" />

            <div className="text-center">
              <div className="flex flex-col items-center">
                <h1 className="text-base font-semibold tracking-wide">
                  MÓDULO
                </h1>
                <p className="text-xs">de</p>
                <h1 className="text-base font-semibold tracking-wide">
                  REGISTRO CIVIL
                </h1>
              </div>
              <p className="text-white-200 text-md font-normal">
                -José Leonardo Ortiz-
              </p>
            </div>
          </div>
        </div>
        <Nav onLinkClick={closeSidebar} setActiveView={setActiveView} />
        <div className="px-5 py-5 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 bg-slate flex items-center justify-center shrink-0">
              <i className="fas fa-user text-slate-50 text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.sub.toUpperCase()}</p>
              <p className="text-slate-50 text-xs font-normal">Administrador</p>
            </div>
            <button className="text-slate-50 hover:text-slate-400 transition-colors p-2 cursor-pointer" onClick={logout}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>
      <main className={"flex-1 min-h-screen lg:ml-72"}>
        <NavBar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <Outlet context={{ toggleSidebar, sidebarOpen, activeView, setActiveView }} />
      </main>
    </div>
  );
}
