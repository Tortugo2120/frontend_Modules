import React from 'react';
import { Link } from 'react-router-dom';


const Home: React.FC = () => {
  return (
    <>
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="max-w-4xl w-full px-6">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Bienvenido al Sistema de Gestión Municipal</h1>
            <p className="mt-3 text-gray-600">Selecciona una de las opciones para continuar. Interfaz diseñada para ser clara, rápida y accesible.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link to="/Dashboard" className="group block bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
               
                  DS
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
                  <p className="mt-1 text-sm text-gray-600">Accede al panel principal con métricas, atajos y módulos disponibles.</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-600 group-hover:underline">Ir al Dashboard</span>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link to="/Permisos" className="group block bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
                  PM
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Permisos</h2>
                  <p className="mt-1 text-sm text-gray-600">Gestiona roles y permisos de usuarios para controlar acceso a los módulos.</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-green-600 group-hover:underline">Ir a Permisos</span>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            Si necesitas ayuda, contacta con el administrador del sistema.
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
