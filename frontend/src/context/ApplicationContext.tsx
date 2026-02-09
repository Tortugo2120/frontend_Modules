import type {CreateApplicationPayload, Participant, ParticipantRol, RequisitoEstado} from "../model/aplicationModel.ts";
import React, {createContext, type ReactNode, useCallback, useContext, useEffect, useState} from "react";

interface ApplicationContextType {
    formDataAplication: CreateApplicationPayload;
    addParticipant: (participant: Omit<Participant, 'role'> & { role: ParticipantRol }) => void;
    deleteParticipant: (dni: string) => void;
    updateApplicationData: (data: Partial<CreateApplicationPayload['application']>) => void;
    updateRequisitos: (requisitos: RequisitoEstado[]) => void;
    resetForm: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: ReactNode }) => {
    const [formDataAplication, setFormDataAplication] = useState<CreateApplicationPayload>(()=>{
        const saved = localStorage.getItem('pending_application');
        return saved ? JSON.parse(saved) : {
            application: { userId: 0, applicationTypeId: 0, expedientNumber: "" },
            participants: [],
            requisitos: []
        };
    });

    useEffect(() => {
        localStorage.setItem('pending_application', JSON.stringify(formDataAplication));
    }, [formDataAplication]);

    const addParticipant = useCallback((newParticipant: Omit<Participant, 'role'> & { role: ParticipantRol }) => {
        console.log('Agregando participante:', newParticipant);

        setFormDataAplication(prev => {
            const existingIndex = prev.participants.findIndex(p => p.dni === newParticipant.dni);

            if (existingIndex >= 0) {
                // Si ya existe, reemplazar con el nuevo rol
                const updatedParticipants = [...prev.participants];
                updatedParticipants[existingIndex] = {
                    ...updatedParticipants[existingIndex],
                    ...newParticipant
                };
                console.log('Participante actualizado:', updatedParticipants[existingIndex]);

                return {
                    ...prev,
                    participants: updatedParticipants
                };
            }

            // Si no existe, crear nuevo participante
            const newParticipantData: Participant = {
                ...newParticipant
            };

            console.log('Nuevo participante creado:', newParticipantData);

            return {
                ...prev,
                participants: [...prev.participants, newParticipantData]
            };
        });
    }, []);

    const updateApplicationData = useCallback((data: Partial<CreateApplicationPayload['application']>) => {
        setFormDataAplication(prev => ({
            ...prev,
            application: { ...prev.application, ...data }
        }));
    }, []);

    const updateRequisitos = useCallback((requisitos: RequisitoEstado[]) => {
        setFormDataAplication(prev => ({
            ...prev,
            requisitos
        }));
    }, []);

    const resetForm = useCallback(() => {
        localStorage.removeItem('pending_application');
        setFormDataAplication({
            application: {userId: 0, applicationTypeId: 0, expedientNumber: ""},
            participants: [],
            requisitos: []
        });
    }, []);

    const deleteParticipant = useCallback((dni: string) => {
        setFormDataAplication(prev => {
            // Eliminar completamente al participante por DNI
            return {
                ...prev,
                participants: prev.participants.filter(p => p.dni !== dni)
            };
        });
    }, []);

    return (
        <ApplicationContext.Provider value={{ formDataAplication, addParticipant, updateApplicationData, updateRequisitos, resetForm, deleteParticipant }}>
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
