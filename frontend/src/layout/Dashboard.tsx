import { Nav } from "../components/Sidebar.tsx";
import { Outlet } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import logo from '../assets/logo-muni.jpg';
import NavBar from "../components/NavBar.tsx";
import { Auth } from "../context/AuthContext.tsx";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("home");
  const [collapsed, setCollapsed] = useState(true);
  const { user, logout } = Auth();
  const handleLogout = async () => { await logout(); };
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetAutoCloseTimer = useCallback(() => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    if (!collapsed) {
      autoCloseTimerRef.current = setTimeout(() => {
        setCollapsed(true);
      }, 5000);
    }
  }, [collapsed]);

  // Iniciar timer cuando se abre el sidebar
  useEffect(() => {
    resetAutoCloseTimer();
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, [collapsed, resetAutoCloseTimer]);

  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <div className="drawer lg:drawer-open">
      <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main Content */}
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <NavBar collapsed={collapsed} toggleCollapse={toggleCollapse} />
        {/* Page Content */}
        <main className="flex-1">
          <Outlet context={{ activeView, setActiveView }} />
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side z-40">
        <label htmlFor="sidebar-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <div
          className={`flex min-h-full flex-col bg-info-content text-slate-50 transition-all duration-300 ease-in-out overflow-hidden
            ${collapsed ? 'w-15 cursor-pointer' : 'w-65'}`}
          onMouseMove={!collapsed ? resetAutoCloseTimer : undefined}
          onClick={() => {
            if (collapsed) setCollapsed(false);
            else resetAutoCloseTimer();
          }}
        >

          {/* Logo Header */}
          <div className={`py-4 border-b border-slate-700/50 transition-all duration-300 ${collapsed ? 'px-2' : 'px-4'}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'flex-col gap-2'}`}>
              <img
                src={logo}
                alt="Logo"
                className={`object-contain rounded-full transition-all duration-300 
                  ${collapsed ? 'w-9 h-9' : 'w-14 h-14'}`}
              />
              {!collapsed && (
                <div className="text-center mt-1 animate-fade-in">
                  <div className="flex flex-col items-center leading-tight">
                    <h1 className="text-base font-semibold tracking-wide">MÓDULO</h1>
                    <p className="text-sm text-slate-400">de</p>
                    <h1 className="font-semibold tracking-wide">REGISTRO CIVIL</h1>
                  </div>
                  <p className="text-slate-400 text-sm font-normal mt-0.5">- José Leonardo Ortiz -</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <Nav setActiveView={setActiveView} collapsed={collapsed} onExpand={() => setCollapsed(false)} />

          {/* User Footer */}
          <div className={`border-t border-slate-700/50 mt-auto transition-all duration-300 ${collapsed ? 'px-2 py-3' : 'px-3 py-4'}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-2 py-1'}`}>
              <div className={`group relative bg-slate border border-slate-50/10 flex items-center justify-center shrink-0 rounded-full transition-all duration-300
                ${collapsed ? 'w-9 h-9 cursor-pointer hover:bg-indigo-600/50' : 'w-9 h-9'}`}
                onClick={collapsed ? toggleCollapse : undefined}
              >
                <i className="fas fa-user text-slate-200 text-xs"></i>
                {/* Tooltip en colapsado */}
                {collapsed && (
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-md bg-slate-700 text-white text-xs font-medium
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 pointer-events-none z-50 shadow-lg whitespace-nowrap">
                    {user?.sub.toUpperCase()}
                  </span>
                )}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user?.sub.toUpperCase()}</p>
                    <p className="text-slate-400 text-xs font-normal">Administrador</p>
                  </div>
                  <button
                    className="text-slate-400 hover:text-white transition-colors p-1.5 cursor-pointer rounded-lg hover:bg-white/10"
                    onClick={handleLogout}
                    title="Cerrar sesión"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
