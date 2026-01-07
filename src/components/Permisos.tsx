import React, { useState, useEffect } from 'react';
import UsuarioServices from '../services/UsuariosServices.tsx';


interface UserModule {
  moduleId: string;
  ModuleName: string;
}

interface Usuario {
  userId: string;
  userName: string;
  roleId: string;
  roleName: string;
  officeName: string;
  modules: UserModule[];
}

interface Module {
  id_modulo: string;
  nombre_modulo: string;
}

const PermissionsManager = () => {
    const [userId, setUserId] = useState('');
    const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [userPermissions, setUserPermissions] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        const response = await UsuarioServices.getAllModules();
        if (response.success && response.data) {
            setModules(response.data);
        } else {
            setError('Error al cargar módulos: ' + response.message);
        }
    };

    const getInitials = (fullName: string) => {
        const nameParts = fullName.trim().split(' ');
        if (nameParts.length >= 2) {
            return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
        }
        return fullName.substring(0, 2).toUpperCase();
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUserId(value);
        setError('');
        setSuccessMessage('');
    };

    const handleSearchUser = async () => {
        if (!userId.trim()) {
            setError('Por favor ingrese un ID de usuario');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');
        
        const response = await UsuarioServices.getUserById(userId);
        
        if (response.success && response.data) {
            setSelectedUser(response.data);
            // Inicializar permisos del usuario
            const userModuleIds = new Set(response.data.modules.map(m => m.moduleId));
            setUserPermissions(userModuleIds);
        } else {
            setError(response.message || 'Usuario no encontrado');
            setSelectedUser(null);
            setUserPermissions(new Set());
        }
        
        setLoading(false);
    };

    const togglePermission = async (moduleId: string, currentHasPermission: boolean) => {
        if (!selectedUser) return;

        const newHasPermission = !currentHasPermission;
        
    
        const newPermissions = new Set(userPermissions);
        if (newHasPermission) {
            newPermissions.add(moduleId);
        } else {
            newPermissions.delete(moduleId);
        }
        setUserPermissions(newPermissions);

      
        const response = await UsuarioServices.updateUserPermission(
            selectedUser.userId,
            moduleId,
        );

        if (response.success) {
            setSuccessMessage(
                newHasPermission 
                    ? 'Permiso otorgado exitosamente' 
                    : 'Permiso revocado exitosamente'
            );
            setTimeout(() => setSuccessMessage(''), 3000);
        } else {
           
            setUserPermissions(userPermissions);
            setError('Error al actualizar permiso: ' + response.message);
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleClear = () => {
        setSelectedUser(null);
        setUserId('');
        setUserPermissions(new Set());
        setError('');
        setSuccessMessage('');
    };

    const getModuleIcon = (moduleName: string) => {
        return moduleName.substring(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-4xl mx-auto">
          
                <div className="mb-8 text-center">
                    <div className="flex justify-center items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-800">Administración de Accesos</h1>
                    </div>
                    <p className="text-gray-600">Sistema de Gestión Municipal (SGM) - Control de Usuarios</p>
                </div>

            
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-green-700 font-medium">{successMessage}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Buscar usuario por nombre
                    </label>
                    <div className="relative">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={userId}
                                    onChange={handleSearchChange}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                                    placeholder="Ingrese el ID del usuario"
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                    disabled={loading}
                                />
                            </div>
                            
                            <button
                                onClick={handleSearchUser}
                                disabled={loading}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                            >
                                {loading ? 'Buscando...' : 'Buscar'}
                            </button>
                            {userId && (
                                <button
                                    onClick={handleClear}
                                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium shadow-md hover:shadow-lg w-full sm:w-auto"
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>

                    {selectedUser && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                                    {getInitials(selectedUser.userName)}
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-xl font-bold text-gray-800">{selectedUser.userName}</h3>
                                   
                                    <p className="text-sm text-indigo-600 font-medium">{selectedUser.roleName}</p>
                                    <p className="text-sm text-gray-500">{selectedUser.officeName}</p>
                                </div>
                                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>


                {selectedUser && modules.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Módulos del Sistema</h2>

                        <div className="space-y-4">
                            {modules.map((module) => {
                                const hasPermission = userPermissions.has(module.id_modulo);
                                return (
                                    <div
                                        key={module.id_modulo}
                                        className="border-2 border-gray-200 rounded-xl p-4 sm:p-5 hover:border-indigo-300 transition-all hover:shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                                    >
                                        <div className="flex items-start gap-3 sm:gap-4 w-full sm:w-auto">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="text-indigo-600 font-bold text-sm">
                                                    {getModuleIcon(module.nombre_modulo)}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base sm:text-lg font-bold text-gray-800">{module.nombre_modulo}</h3>
                                                
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => togglePermission(module.id_modulo, hasPermission)}
                                            className={`self-center sm:self-auto w-auto px-6 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                                                hasPermission
                                                    ? 'bg-green-600 text-white shadow-md hover:bg-green-700'
                                                    : 'bg-gray-400 text-white hover:bg-indigo-600'
                                            }`}
                                        >
                                            {hasPermission ? (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Permiso Otorgado
                                                </>
                                            ) : (
                                                'Dar Permiso'
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                            <div className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-blue-800 font-medium">Información</p>
                                    <p className="text-blue-700 text-sm">Los cambios se guardan automáticamente al hacer clic en los botones de permisos.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedUser && !loading && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-600 mb-2">Busca un usuario para comenzar</h3>
                        <p className="text-gray-500">Ingresa el nombre del usuario en el campo de búsqueda</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PermissionsManager;