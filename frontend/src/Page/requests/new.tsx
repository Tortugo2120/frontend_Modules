import { useState } from "react";
import StepProgressBar from "../../components/requests/new/Stepprogresebar";
import RequestTypeCard from "../../components/requests/new/Requesttypecard";
import ApplicantForm from "../../components/requests/new/Applicantform";
import ConfirmationSummary from "../../components/requests/new/Confirmationsummary";
import NavigationButtons from "../../components/requests/new/Navigationbuttons";
import useTipoSolici from "../../hooks/useTipoSolici.ts";
import Contrayente from "../../components/requests/new/Matrimonio/Contrayente";
import Testigos from "../../components/requests/new/Matrimonio/Testigos.tsx";
import Requisitos from "../../components/requests/new/Matrimonio/Requisitos.tsx";
import ResumenSolicitud from "../../components/requests/new/ResumenSolicitud.tsx";
import SeleccionMatrimonio from "../../components/requests/new/Matrimonio/SeleccionMatrimonio.tsx";

// Interface para solicitantes agregados
interface SolicitanteAgregado {
    id: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fecha_nacimiento: string;
    sexo: 'M' | 'F';
    dni: string;
    direccion?: string;
    correo?: string;
    telefono?: string;
    ubigeo?: number;
    estado_civil?: string;
}

export default function NewRequest() {
    const [tipoSolicitud, setTipoSolicitud] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [contrayentes] = useState<any[]>([]);
    const [requisitos] = useState<any[]>([]);
    const [archivos] = useState<any[]>([]);
    
    // Estado para los solicitantes agregados
    const [solicitantesAgregados, setSolicitantesAgregados] = useState<SolicitanteAgregado[]>([]);

    const [formData, setFormData] = useState({
        // Datos del solicitante
        nombresSolicitante: '',
        apellidoPaternoSolicitante: '',
        apellidoMaternoSolicitante: '',
        dniSolicitante: '',
        fechaNacimientoSolicitante: '',
        sexoSolicitante: '',
        direccionSolicitante: '',
        correoSolicitante: '',
        telefonoSolicitante: '',
        ubigeoSolicitante: 0,
        estadoCivilSolicitante: '',
    });

    const handleSelectTipoSolicitud = (id: number) => {
        setTipoSolicitud(prev =>
            prev === id ? null : id
        );
    };

    const { tiposolicitud } = useTipoSolici();
    const [currentStep, setCurrentStep] = useState(1);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handler para recibir los solicitantes del componente hijo
    const handleSolicitantesChange = (solicitantes: SolicitanteAgregado[]) => {
        setSolicitantesAgregados(solicitantes);
        console.log('Solicitantes actualizados en el padre:', solicitantes);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Aquí puedes construir el objeto completo para enviar al backend
        const dataToSubmit = {
            tipoSolicitud,
            formData,
            solicitantesAgregados,
            contrayentes,
            requisitos,
            archivos
        };
        
        console.log('Solicitud enviada completa:', dataToSubmit);
        // Aquí iría la lógica para enviar al backend
    };

    const nextStep = () => {
        // Validar que haya al menos un solicitante agregado antes de avanzar del paso 2
        if (currentStep === 2 && solicitantesAgregados.length === 0) {
            alert('Debe agregar al menos un solicitante antes de continuar');
            return;
        }
        
        if (currentStep < 8) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const selectedRequestType = tiposolicitud.find(tipo => tipo.id === tipoSolicitud);

    // Filtrar solicitudes según el término de búsqueda
    const filteredSolicitudes = tiposolicitud.filter(tipo =>
        tipo.nombre_solicitud.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-blue-300/40 from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-6">
            <div className="mb-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-info-content rounded-xl flex items-center justify-center shadow-lg">
                        <i className="fas fa-file-invoice text-white text-xl"></i>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Nueva Solicitud</h1>
                        <p className="text-gray-600 text-sm mt-1">Complete los datos para registrar una nueva solicitud</p>
                    </div>
                </div>
                <StepProgressBar currentStep={currentStep} />
            </div>

            {/* Form Container */}
            <div className="mx-auto">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Tipo de Solicitud */}
                        {currentStep === 1 && (
                            <div className="p-6 lg:p-6 animate-fadeIn">
                                <div className="flex justify-between items-center flex-col sm:flex-row sm:items-end">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seleccione el tipo de solicitud</h2>
                                        <p className="text-gray-600 mb-6">Elija el trámite que desea realizar</p>
                                    </div>

                                    {/* Buscador */}
                                    <div className="mb-6">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <i className="fas fa-search text-gray-400"></i>
                                            </div>
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder="Buscar tipo de solicitud..."
                                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-0 transition-all"
                                            />
                                            {searchTerm && (
                                                <button
                                                    type="button"
                                                    onClick={() => setSearchTerm("")}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            )}
                                        </div>
                                        {searchTerm && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                {filteredSolicitudes.length} resultado{filteredSolicitudes.length !== 1 ? 's' : ''} encontrado{filteredSolicitudes.length !== 1 ? 's' : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {/* Grid de solicitudes */}
                                {filteredSolicitudes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {filteredSolicitudes.map((tipo) => (
                                            <RequestTypeCard
                                                key={tipo.id}
                                                id={tipo.id}
                                                nombre={tipo.nombre_solicitud.toUpperCase()}
                                                descripcion={tipo.descripcion}
                                                precio={tipo.precio}
                                                isSelected={tipoSolicitud === tipo.id}
                                                onSelect={handleSelectTipoSolicitud}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <i className="fas fa-search text-gray-300 text-5xl mb-4"></i>
                                        <p className="text-gray-500 text-lg">No se encontraron solicitudes</p>
                                        <p className="text-gray-400 text-sm mt-2">Intenta con otros términos de búsqueda</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Formulario de Datos */}
                        {currentStep === 2 && (
                            <div className="p-6 lg:p-6 animate-fadeIn">
                                <div className="space-y-8">
                                    {/* Datos del Solicitante */}
                                    <ApplicantForm
                                        formData={formData}
                                        onChange={handleInputChange}
                                        onSolicitantesChange={handleSolicitantesChange}
                                        tipoSolicitudNombre={selectedRequestType?.nombre_solicitud}
                                        solicitantesIniciales={solicitantesAgregados}
                                    />

                                    {/* Mostrar resumen de solicitantes agregados */}
                                    {solicitantesAgregados.length > 0 && (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <i className="fas fa-check-circle text-green-600"></i>
                                                <p className="text-sm font-semibold text-green-800">
                                                    {solicitantesAgregados.length} solicitante{solicitantesAgregados.length !== 1 ? 's' : ''} agregado{solicitantesAgregados.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <p className="text-xs text-green-700">
                                                Puede continuar al siguiente paso cuando esté listo
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Contrayentes */}
                        {currentStep === 3 && (
                            <div className="p-6 lg:p-6">
                                <Contrayente tipoSolicitudNombre={selectedRequestType?.nombre_solicitud} />
                            </div>
                        )}
                        
                        {/* Step 4: Testigos */}
                        {currentStep === 4 && (
                            <div className="p-6 lg:p-6">
                                <Testigos tipoSolicitudNombre={selectedRequestType?.nombre_solicitud} />
                            </div>
                        )}
                        
                        {/* Step 5: Requisitos */}
                        {currentStep === 5 && (
                            <div className="p-6 lg:p-6">
                                <Requisitos tipoSolicitudNombre={selectedRequestType?.nombre_solicitud} />
                            </div>
                        )}
                        
                        {/* Step 6: Tipo Matrimonio */}
                        {currentStep === 6 && (
                            <div className="p-6 lg:p-6">
                                <SeleccionMatrimonio tipoSolicitudNombre={selectedRequestType?.nombre_solicitud} />
                            </div>
                        )}
                        
                        {/* Step 7: Resumen */}
                        {currentStep === 7 && (
                            <div className="p-6 lg:p-6">
                                <ResumenSolicitud
                                    tipoSolicitudNombre={selectedRequestType?.nombre_solicitud}
                                    contrayentes={contrayentes}
                                    requisitos={requisitos}
                                    archivos={archivos}
                                />
                            </div>
                        )}
                        
                        {/* Step 8: Confirmación */}
                        {currentStep === 8 && (
                            <div className="p-6 lg:p-6">
                                <ConfirmationSummary
                                    tipoSolicitud={tipoSolicitud}
                                    tipoNombre={selectedRequestType?.nombre_solicitud}
                                    formData={formData}
                                />
                                
                                {/* Mostrar resumen de solicitantes en la confirmación final */}
                                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Solicitantes Registrados
                                    </h4>
                                    {solicitantesAgregados.length > 0 ? (
                                        <div className="space-y-3">
                                            {solicitantesAgregados.map((solicitante, index) => (
                                                <div key={solicitante.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                                    <p className="font-semibold text-gray-900">
                                                        {index + 1}. {solicitante.nombres} {solicitante.apellidoPaterno} {solicitante.apellidoMaterno}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        DNI: {solicitante.dni} | Teléfono: {solicitante.telefono}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No hay solicitantes agregados</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <NavigationButtons
                            currentStep={currentStep}
                            totalSteps={8}
                            canProceed={currentStep === 1 ? !!tipoSolicitud : true}
                            onPrevious={prevStep}
                            onNext={nextStep}
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}