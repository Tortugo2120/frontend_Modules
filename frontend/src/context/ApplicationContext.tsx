import type {CreateApplicationPayload, Participant, ParticipantRol, RequisitoEstado, MarriageDetails} from "../model/aplicationModel.ts";
import React, {createContext, type ReactNode, useCallback, useContext, useEffect, useState} from "react";

interface ApplicationContextType {
    formDataAplication: CreateApplicationPayload;
    addParticipant: (participant: Omit<Participant, 'rol'> &
        {
            rol: ParticipantRol;
            ctry?: string | null;
        }) => void;
    deleteParticipant: (dni: string) => void;
    updateApplicationData: (data: Partial<CreateApplicationPayload['application']>) => void;
    updateRequisitos: (requisitos: RequisitoEstado[]) => void;
    updateMarriageDetails: (details: Partial<MarriageDetails>) => void;
    clearMarriageDetails: () => void;
    resetForm: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }: { children: ReactNode }) => {
    const [formDataAplication, setFormDataAplication] = useState<CreateApplicationPayload>(()=>{
        const saved = localStorage.getItem('pending_application');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return {
                    ...parsed,
                    // marriageDetails solo se preserva si existe en el guardado
                    marriageDetails: parsed.marriageDetails ?? undefined
                };
            } catch (error) {
                console.error('Error al parsear datos guardados:', error);
                return {
                    application: { userId: 0, applicationTypeId: 0, expedientNumber: "" },
                    participants: [],
                    requirements: [],
                };
            }
        }
        return {
            application: { userId: 0, applicationTypeId: 0, expedientNumber: "" },
            participants: [],
            requirements: [],
        };
    });

    useEffect(() => {
        localStorage.setItem('pending_application', JSON.stringify(formDataAplication));
    }, [formDataAplication]);

    const addParticipant = useCallback((newParticipant: Omit<Participant, 'rol'> & {
        rol: ParticipantRol;
        ctry?: string | null;
    }) => {
        console.log('Agregando participante:', newParticipant);

        setFormDataAplication(prev => {
            const existingIndex = prev.participants.findIndex(p => p.cui === newParticipant.cui);

            if (existingIndex >= 0) {
                // Si ya existe, reemplazar con el nuevo rol
                const updatedParticipants = [...prev.participants];
                const updatedParticipant: Participant = {
                    ...updatedParticipants[existingIndex],
                    ...newParticipant
                };

                // Asignar ctry según el rol
                if (newParticipant.rol === 'contrayente') {
                    updatedParticipant.ctry = null;
                } else if (newParticipant.rol === 'testigo') {
                    updatedParticipant.ctry = newParticipant.ctry || null;
                }

                updatedParticipants[existingIndex] = updatedParticipant;
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

            if (newParticipant.rol === 'contrayente') {
                newParticipantData.ctry = null;
            } else if (newParticipant.rol === 'testigo') {
                newParticipantData.ctry = newParticipant.ctry || null;
            }

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

    const updateRequisitos = useCallback((requirements: RequisitoEstado[]) => {
        setFormDataAplication(prev => ({
            ...prev,
            requirements
        }));
    }, []);

    const updateMarriageDetails = useCallback((details: Partial<MarriageDetails>) => {
        setFormDataAplication(prev => ({
            ...prev,
            marriageDetails: {
                marriageOfficiantId: prev.marriageDetails?.marriageOfficiantId ?? 0,
                marriagePlace: prev.marriageDetails?.marriagePlace ?? "",
                marriageDate: prev.marriageDetails?.marriageDate ?? "",
                marriageTime: prev.marriageDetails?.marriageTime ?? "",
                ...details
            }
        }));
    }, []);

    const clearMarriageDetails = useCallback(() => {
        setFormDataAplication(prev => {
            const next = { ...prev };
            delete next.marriageDetails;
            return next;
        });
    }, []);

    const resetForm = useCallback(() => {
        localStorage.removeItem('pending_application');
        setFormDataAplication({
            application: {userId: 0, applicationTypeId: 0, expedientNumber: ""},
            participants: [],
            requirements: [],
        });
    }, []);

    const deleteParticipant = useCallback((cui: string) => {
        setFormDataAplication(prev => {
            // Eliminar completamente al participante por DNI
            return {
                ...prev,
                participants: prev.participants.filter(p => p.cui !== cui)
            };
        });
    }, []);

    return (
        <ApplicationContext.Provider value={{ formDataAplication, addParticipant, updateApplicationData, updateRequisitos, updateMarriageDetails, clearMarriageDetails, resetForm, deleteParticipant }}>
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
