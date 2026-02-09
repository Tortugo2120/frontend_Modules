import type {CreateApplicationPayload, Participant} from "../model/aplicationModel.ts";
import React, {createContext, type ReactNode, useCallback, useContext, useEffect, useState} from "react";

interface ApplicationContextType {
    formDataAplication: CreateApplicationPayload;
    addParticipant: (participant: Omit<Participant, 'roles'> & { rol: string }) => void;
    deleteParticipant: (dni: string, rol?: string) => void;
    updateApplicationData: (data: Partial<CreateApplicationPayload['application']>) => void;
    resetForm: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: ReactNode }) => {
    const [formDataAplication, setFormDataAplication] = useState<CreateApplicationPayload>(()=>{
        const saved = localStorage.getItem('pending_application');
        return saved ? JSON.parse(saved) : {
            application: { userId: 0, applicationTypeId: 0, expedientNumber: "" },
            participants: []
        };
    });

    useEffect(() => {
        localStorage.setItem('pending_application', JSON.stringify(formDataAplication));
    }, [formDataAplication]);

    const addParticipant = useCallback((newParticipant: Omit<Participant, 'roles'> & { rol: string }) => {
        console.log('Agregando participante:', newParticipant);

        setFormDataAplication(prev => {
            const existingIndex = prev.participants.findIndex(p => p.dni === newParticipant.dni);

            if (existingIndex >= 0) {
                // Si ya existe, agregar el nuevo rol al array de roles
                const updatedParticipants = [...prev.participants];
                const existingParticipant = updatedParticipants[existingIndex];

                // Obtener roles actuales
                const currentRoles = existingParticipant.roles || [];

                // Si el rol no existe, agregarlo
                if (!currentRoles.includes(newParticipant.rol as any)) {
                    updatedParticipants[existingIndex] = {
                        ...existingParticipant,
                        roles: [...currentRoles, newParticipant.rol as any]
                    };
                    console.log('Rol agregado a participante existente:', updatedParticipants[existingIndex]);
                } else {
                    console.log('El participante ya tiene ese rol');
                }

                return {
                    ...prev,
                    participants: updatedParticipants
                };
            }

            // Si no existe, crear nuevo participante con array de roles
            const { rol, ...participantData } = newParticipant;
            const newParticipantWithRoles: Participant = {
                ...participantData,
                roles: [rol as any]
            };

            console.log('Nuevo participante creado:', newParticipantWithRoles);

            return {
                ...prev,
                participants: [...prev.participants, newParticipantWithRoles]
            };
        });
    }, []);

    const updateApplicationData = useCallback((data: Partial<CreateApplicationPayload['application']>) => {
        setFormDataAplication(prev => ({
            ...prev,
            application: { ...prev.application, ...data }
        }));
    }, []);

    const resetForm = useCallback(() => {
        localStorage.removeItem('pending_application');
        setFormDataAplication({
            application: {userId: 0, applicationTypeId: 0, expedientNumber: ""},
            participants: []
        });
    }, []);

    const deleteParticipant = useCallback((dni: string, rol?: string) => {
        setFormDataAplication(prev => {
            if (rol) {
                // Si se especifica un rol, solo eliminar ese rol del array
                const updatedParticipants = prev.participants.map(p => {
                    if (p.dni === dni) {
                        const updatedRoles = p.roles.filter(r => r !== rol);

                        // Si no quedan roles, marcar para eliminar
                        if (updatedRoles.length === 0) {
                            return null;
                        }

                        return {
                            ...p,
                            roles: updatedRoles
                        };
                    }
                    return p;
                }).filter((p): p is Participant => p !== null);

                return {
                    ...prev,
                    participants: updatedParticipants
                };
            }

            // Si no se especifica rol, eliminar completamente al participante
            return {
                ...prev,
                participants: prev.participants.filter(p => p.dni !== dni)
            };
        });
    }, []);

    return (
        <ApplicationContext.Provider value={{ formDataAplication, addParticipant, updateApplicationData, resetForm,deleteParticipant }}>
            {children}
        </ApplicationContext.Provider>
    );
};

export const ApplicationHandler = () => {
    const context = useContext(ApplicationContext);
    if (!context) throw new Error('ApplicationHandler debe usarse dentro de ApplicationProvider');
    return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApplicationContext = ApplicationHandler;
