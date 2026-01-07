import React, { useState } from 'react';

const PermissionsManager = () => {
    const [searchName, setSearchName] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const employees = [
        { id: 1, dni: '12345678', name: 'Juan Pérez', role: 'Desarrollador' },
        { id: 2, dni: '87654321', name: 'María García', role: 'Diseñadora' },
        { id: 3, dni: '11223344', name: 'Carlos Rodríguez', role: 'Gerente' },
        { id: 4, dni: '44332211', name: 'Ana Martínez', role: 'Analista' },
        { id: 5, dni: '73974061', name: 'Dickens Labán', role: 'Desarrollador' },
        { id: 6, dni: '99887766', name: 'Laura Fernández', role: 'Marketing' },
    ];

    const getInitials = (fullName) => {
        const nameParts = fullName.trim().split(' ');
        if (nameParts.length >= 2) {
            return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
        }
        return fullName.substring(0, 2).toUpperCase();
    };

    const modules = [
        {
            id: 1,
            name: 'Recursos Humanos',
            description: 'Gestión de personal y nóminas',
            icon: 'RH'
        },
        {
            id: 2,
            name: 'Finanzas',
            description: 'Control de gastos e ingresos',
            icon: 'FI'
        },
        {
            id: 3,
            name: 'Defensa civil',
            description: 'Gestión de emergencias y seguridad',
            icon: 'DC'
        },
        {
            id: 4,
            name: 'Seguridad',
            description: 'Monitoreo y control de accesos',
            icon: 'SE'
        },
        {
            id: 5,
            name: 'OTIC',
            description: 'Gestión de capacitación y desarrollo',
            icon: 'OT'
        },
    ];

    const [userPermissions, setUserPermissions] = useState({});

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchName(value);

        if (value.trim() === '') {
            setFilteredEmployees([]);
            setShowSuggestions(false);
            return;
        }

        // Filtrar empleados por nombre
        const filtered = employees.filter(emp =>
            emp.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredEmployees(filtered);
        setShowSuggestions(true);
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setSearchName(user.name);
        setShowSuggestions(false);

        if (!userPermissions[user.id]) {
            const initialPermissions = {};
            modules.forEach(module => {
                initialPermissions[module.id] = [];
            });
            setUserPermissions({ ...userPermissions, [user.id]: initialPermissions });
        }
    };

    const togglePermission = (moduleId, permission) => {
        if (!selectedUser) return;

        const currentPerms = userPermissions[selectedUser.id][moduleId] || [];
        const newPerms = currentPerms.includes(permission)
            ? currentPerms.filter(p => p !== permission)
            : [...currentPerms, permission];

        setUserPermissions({
            ...userPermissions,
            [selectedUser.id]: {
                ...userPermissions[selectedUser.id],
                [moduleId]: newPerms
            }
        });
    };

    const handleSave = () => {
        alert('¡Permisos guardados exitosamente!');
    };

    const handleClear = () => {
        setSelectedUser(null);
        setSearchName('');
        setFilteredEmployees([]);
        setShowSuggestions(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="flex justify-center items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-800">Gestión de Permisos</h1>
                    </div>
                    <p className="text-gray-600">Asigna y administra permisos de acceso a los módulos del sistema</p>
                </div>

                {/* Búsqueda de usuario */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Buscar trabajador por nombre
                    </label>
                    <div className="relative">
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={searchName}
                                    onChange={handleSearchChange}
                                    placeholder="Ingrese el nombre del trabajador"
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                                    onFocus={() => searchName && setShowSuggestions(true)}
                                />
                            </div>
                            {searchName && (
                                <button
                                    onClick={handleClear}
                                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium shadow-md hover:shadow-lg"
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>

                        {/* Sugerencias de búsqueda */}
                        {showSuggestions && filteredEmployees.length > 0 && (
                            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-indigo-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                {filteredEmployees.map((emp) => (
                                    <div
                                        key={emp.id}
                                        onClick={() => handleSelectUser(emp)}
                                        className="p-4 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {getInitials(emp.name)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">{emp.name}</p>
                                            <p className="text-sm text-gray-600">DNI: {emp.dni} • {emp.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Sin resultados */}
                        {showSuggestions && searchName && filteredEmployees.length === 0 && (
                            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-red-200 rounded-xl shadow-lg p-4">
                                <div className="flex items-center gap-3">
                                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <p className="text-red-700 font-medium">No se encontraron trabajadores con ese nombre</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Usuario seleccionado */}
                    {selectedUser && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                                    {getInitials(selectedUser.name)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800">{selectedUser.name}</h3>
                                    <p className="text-gray-600">DNI: {selectedUser.dni}</p>
                                    <p className="text-sm text-indigo-600 font-medium">{selectedUser.role}</p>
                                </div>
                                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                {/* Módulos y permisos */}
                {selectedUser && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Módulos del Sistema</h2>

                        <div className="space-y-4">
                            {modules.map((module) => (
                                <div
                                    key={module.id}
                                    className="border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-all hover:shadow-md flex justify-between items-center"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <span className="text-indigo-600 font-bold text-sm">{module.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800">{module.name}</h3>
                                            <p className="text-sm text-gray-600">{module.description}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => togglePermission(module.id, 'Ver')}
                                        className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${userPermissions[selectedUser.id]?.[module.id]?.includes('Ver')
                                                ? 'bg-green-600 text-white shadow-md hover:bg-green-700'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            }`}
                                    >
                                        {userPermissions[selectedUser.id]?.[module.id]?.includes('Ver') ? (
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
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={handleClear}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl"
                            >
                                Guardar Permisos
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PermissionsManager;