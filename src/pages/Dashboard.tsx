import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar.tsx';

interface UserModule {
  moduleId: string;
  moduleName: string;
  icon: string;
  color: string;
}

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  route: string;
}

interface ModuleMenu {
  moduleId: string;
  moduleName: string;
  menuItems: MenuItem[];
}


const mockUserModules: UserModule[] = [
  { moduleId: '1', moduleName: 'Recursos Humanos', icon: '👥', color: 'from-blue-500 to-blue-600' },
  { moduleId: '2', moduleName: 'Finanzas', icon: '💰', color: 'from-green-500 to-green-600' },
  { moduleId: '3', moduleName: 'Defensa Civil', icon: '🚨', color: 'from-red-500 to-red-600' },
  { moduleId: '4', moduleName: 'Seguridad', icon: '🔒', color: 'from-purple-500 to-purple-600' },
  { moduleId: '5', moduleName: 'OTIC', icon: '📚', color: 'from-orange-500 to-orange-600' },
];

const moduleMenus: ModuleMenu[] = [
  {
    moduleId: '1',
    moduleName: 'Recursos Humanos',
    menuItems: [
      { id: '1-1', name: 'Gestión de Personal', icon: '👤', route: '/rrhh/personal' },
      { id: '1-2', name: 'Nóminas', icon: '💵', route: '/rrhh/nominas' },
      { id: '1-3', name: 'Asistencias', icon: '📅', route: '/rrhh/asistencias' },
      { id: '1-4', name: 'Vacaciones', icon: '🏖️', route: '/rrhh/vacaciones' },
      { id: '1-5', name: 'Evaluaciones', icon: '📊', route: '/rrhh/evaluaciones' },
      { id: '1-6', name: 'Capacitaciones', icon: '🎓', route: '/rrhh/capacitaciones' },
    ]
  },
  {
    moduleId: '2',
    moduleName: 'Finanzas',
    menuItems: [
      { id: '2-1', name: 'Cuentas por Pagar', icon: '📤', route: '/finanzas/cuentas-pagar' },
      { id: '2-2', name: 'Cuentas por Cobrar', icon: '📥', route: '/finanzas/cuentas-cobrar' },
      { id: '2-3', name: 'Presupuesto', icon: '💼', route: '/finanzas/presupuesto' },
      { id: '2-4', name: 'Reportes Financieros', icon: '📈', route: '/finanzas/reportes' },
      { id: '2-5', name: 'Tesorería', icon: '🏦', route: '/finanzas/tesoreria' },
    ]
  },
  {
    moduleId: '3',
    moduleName: 'Defensa Civil',
    menuItems: [
      { id: '3-1', name: 'Planes de Emergencia', icon: '📋', route: '/defensa/planes' },
      { id: '3-2', name: 'Alertas y Avisos', icon: '⚠️', route: '/defensa/alertas' },
      { id: '3-3', name: 'Evacuaciones', icon: '🚪', route: '/defensa/evacuaciones' },
      { id: '3-4', name: 'Recursos de Emergencia', icon: '🧰', route: '/defensa/recursos' },
      { id: '3-5', name: 'Capacitación Civil', icon: '👨‍🏫', route: '/defensa/capacitacion' },
    ]
  },
  {
    moduleId: '4',
    moduleName: 'Seguridad',
    menuItems: [
      { id: '4-1', name: 'Control de Accesos', icon: '🚪', route: '/seguridad/accesos' },
      { id: '4-2', name: 'Videovigilancia', icon: '📹', route: '/seguridad/camaras' },
      { id: '4-3', name: 'Incidentes', icon: '⚡', route: '/seguridad/incidentes' },
      { id: '4-4', name: 'Rondas', icon: '🚶', route: '/seguridad/rondas' },
      { id: '4-5', name: 'Visitantes', icon: '🆔', route: '/seguridad/visitantes' },
    ]
  },
  {
    moduleId: '5',
    moduleName: 'OTIC',
    menuItems: [
      { id: '5-1', name: 'Cursos Disponibles', icon: '📖', route: '/otic/cursos' },
      { id: '5-2', name: 'Inscripciones', icon: '✍️', route: '/otic/inscripciones' },
      { id: '5-3', name: 'Certificaciones', icon: '🏆', route: '/otic/certificaciones' },
      { id: '5-4', name: 'Instructores', icon: '👨‍🏫', route: '/otic/instructores' },
      { id: '5-5', name: 'Calendario', icon: '📆', route: '/otic/calendario' },
    ]
  },
];

const Dashboard = () => {
  const [userModules, setUserModules] = useState<UserModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<ModuleMenu | null>(null);
  const [userName] = useState('Juan Pérez');
  const [userRole] = useState('Administrador');
  const navigate = useNavigate();

  useEffect(() => {
    // Simular carga de módulos del usuario
    setUserModules(mockUserModules);
  }, []);

  const handleModuleClick = (moduleId: string) => {
    const menu = moduleMenus.find(m => m.moduleId === moduleId);
    setSelectedModule(menu || null);
  };

  const handleBackToDashboard = () => {
    setSelectedModule(null);
  };

  const handleMenuItemClick = (item: MenuItem) => {
    console.log('Navegando a:', item.route);
    alert(`Navegando a: ${item.name}\nRuta: ${item.route}`);
  };

  const getInitials = (fullName: string) => {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const getModuleInitials = (moduleName: string) => {
    if (!moduleName) return '';
    const parts = moduleName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return moduleName.substring(0, 2).toUpperCase();
  };

  const getItemInitials = (name: string) => getModuleInitials(name);

  const currentModule = selectedModule ? userModules.find(m => m.moduleId === selectedModule.moduleId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {getInitials(userName)}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{userName}</h1>
                <p className="text-sm text-gray-600">{userRole}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
              >
                Volver a Home
              </button>
              <NavBar />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {!selectedModule ? (

          <div>
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Panel de Control</h2>
              <p className="text-sm sm:text-base text-gray-600">Selecciona un módulo para acceder a sus funcionalidades</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {userModules.map((module) => (
                <div
                  key={module.moduleId}
                  onClick={() => handleModuleClick(module.moduleId)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100 overflow-hidden group"
                >
                  <div className={`bg-gradient-to-br ${module.color} p-6 sm:p-8 text-center`}>
                    <div className="w-20 h-20 mx-auto rounded-full bg-white/10 flex items-center justify-center text-4xl sm:text-5xl mb-3 font-bold text-white transform group-hover:scale-110 transition-transform">
                      {getModuleInitials(module.moduleName)}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
                      {module.moduleName}
                    </h3>
                  </div>
                  <div className="p-4 sm:p-6 bg-white">
                    <div className="flex items-center justify-center gap-2 text-gray-600 group-hover:text-indigo-600 transition-colors">
                      <span className="text-sm font-medium">Acceder al módulo</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {userModules.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-xl font-bold text-gray-600 mb-2">No tienes módulos asignados</h3>
                <p className="text-gray-500">Contacta al administrador para solicitar acceso a los módulos</p>
              </div>
            )}
          </div>
        ) : (
  
          <div>
            <div className="mb-6 sm:mb-8 bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-white ${currentModule ? 'bg-gradient-to-br' : ''} ${currentModule ? currentModule.color : ''}`}>
                  {getModuleInitials(currentModule?.moduleName || selectedModule.moduleName)}
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{selectedModule.moduleName}</h2>
                  <p className="text-sm sm:text-base text-gray-600">Menú de opciones disponibles</p>
                </div>
                {selectedModule && (
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Dashboard
              </button>
            )}
              </div>
              
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {selectedModule.menuItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100 p-6 group"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-2xl sm:text-3xl font-bold text-gray-700 transform group-hover:scale-110 transition-transform">
                      {getItemInitials(item.name)}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <span>Ir a la sección</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center">
          <p className="text-sm text-gray-600">
            Sistema de Gestión Municipal (SGM) © 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;