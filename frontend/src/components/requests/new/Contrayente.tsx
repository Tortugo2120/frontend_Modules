
interface Solicitud {
    tipoSolicitudNombre?: string;
}
const Contrayente = (props: Solicitud) => {
    const { tipoSolicitudNombre } = props;
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 pb-3 border-b border-b-blue-300">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-user text-blue-600"></i>
                    <span>Datos de los Contrayentes</span>
                </h3>
                {tipoSolicitudNombre && (
                    <span className="bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg inline-flex items-center w-fit">
                        <i className="fas fa-file-alt mr-2"></i>
                        {tipoSolicitudNombre.toUpperCase()}
                    </span>
                )}
            </div>

            {/* Contenido del paso 3 */}
            <h1 className="text-xl font-bold text-gray-800">Contrayente 1</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Tipo de Documento */}
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Doc.<span className="text-red-500">*</span>
                    </label>
                    <select
                        name="tipoDocSolicitante"

                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Seleccione</option>
                        <option value="DNI">DNI</option>
                        <option value="C. de Extranjeria">Carnet de extranjería</option>
                    </select>
                </div>

                {/* DNI */}
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        DNI <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="dniSolicitante"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="DNI"

                    />

                </div>

                {/* Nombres */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombres <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="nombresSolicitante"

                        className={"w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"}
                        placeholder="Nombres"
                    />

                </div>

                {/* Apellido Paterno */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido Paterno <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="apellidoPaternoSolicitante"

                        className={"w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"}
                        placeholder="Apellido paterno"
                    />

                </div>

                {/* Apellido Materno */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido Materno <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="apellidoMaternoSolicitante"
                        className={"w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"}
                        placeholder="Apellido materno"
                    />

                </div>

                {/* Fecha de Nacimiento */}
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="fechaNacimientoSolicitante"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                </div>

                {/* Dirección */}
                <div className='mb-0 sm:col-span-2 lg:col-span-3'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="direccionSolicitante"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Dirección"
                    />

                </div>

                {/* Sexo */}
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sexo <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="sexoSolicitante"

                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Seleccione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </select>
                </div>

                {/* Correo */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="correoSolicitante"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="correo@ejemplo.com"
                    />

                </div>

                {/* Teléfono */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="telefonoSolicitante"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="987654321"
                        maxLength={9}
                    />

                </div>

                {/* Ubigeo */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubigeo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="ubigeoSolicitante"

                        className={"w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"}
                        placeholder="150101"
                        maxLength={6}
                    />

                </div>

                {/* Estado Civil */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado Civil <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="estadoCivilSolicitante"

                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Seleccione</option>
                        <option value="Soltero">Soltero(a)</option>
                        <option value="Casado">Casado(a)</option>
                        <option value="Divorciado">Divorciado(a)</option>
                        <option value="Viudo">Viudo(a)</option>
                    </select>
                </div>
            </div>
            <div className=" border-solid border-b border-b-blue-300"></div>
            <h1 className="text-xl font-bold text-gray-800">Contrayente 2</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Tipo de Documento */}
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Doc.<span className="text-red-500">*</span>
                    </label>
                    <select
                        name="tipoDocSolicitante"

                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Seleccione</option>
                        <option value="DNI">DNI</option>
                        <option value="C. de Extranjeria">Carnet de extranjería</option>
                    </select>
                </div>

                {/* DNI */}
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        DNI <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="dniSolicitante"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="DNI"

                    />

                </div>

                {/* Nombres */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombres <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="nombresSolicitante"

                        className={"w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"}
                        placeholder="Nombres"
                    />

                </div>

                {/* Apellido Paterno */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido Paterno <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="apellidoPaternoSolicitante"

                        className={"w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"}
                        placeholder="Apellido paterno"
                    />

                </div>

                {/* Apellido Materno */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido Materno <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="apellidoMaternoSolicitante"
                        className={"w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"}
                        placeholder="Apellido materno"
                    />

                </div>

                {/* Fecha de Nacimiento */}
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="fechaNacimientoSolicitante"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                </div>

                {/* Dirección */}
                <div className='mb-0 sm:col-span-2 lg:col-span-3'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="direccionSolicitante"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Dirección"
                    />

                </div>

                {/* Sexo */}
                <div className='mb-0'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sexo <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="sexoSolicitante"

                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Seleccione</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </select>
                </div>

                {/* Correo */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="correoSolicitante"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="correo@ejemplo.com"
                    />

                </div>

                {/* Teléfono */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="telefonoSolicitante"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="987654321"
                        maxLength={9}
                    />

                </div>

                {/* Ubigeo */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubigeo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="ubigeoSolicitante"

                        className={"w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"}
                        placeholder="150101"
                        maxLength={6}
                    />

                </div>

                {/* Estado Civil */}
                <div className='mb-0 sm:col-span-2 lg:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado Civil <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="estadoCivilSolicitante"

                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white outline-0 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Seleccione</option>
                        <option value="Soltero">Soltero(a)</option>
                        <option value="Casado">Casado(a)</option>
                        <option value="Divorciado">Divorciado(a)</option>
                        <option value="Viudo">Viudo(a)</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default Contrayente