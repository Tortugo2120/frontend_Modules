import type {CreateApplicationPayload, Participant} from "../model/aplicationModel.ts";
import React, {createContext, type ReactNode, useCallback, useContext, useEffect, useState} from "react";

interface ApplicationContextType {
    formDataAplication: CreateApplicationPayload;
    addParticipant: (participant: Participant) => void;
    deleteParticipant: (dni: string) => void;
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

    const addParticipant = useCallback((newParticipant: Participant) => {
        console.log(newParticipant);
        setFormDataAplication(prev => ({
            ...prev,
            participants: [
                ...prev.participants.filter(p => p.dni !== newParticipant.dni),
                newParticipant
            ]
        }));
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

    const deleteParticipant = useCallback((dni: string) => {
        setFormDataAplication(prev => ({
            ...prev,
            participants: prev.participants.filter(p => p.dni !== dni)
        }));
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