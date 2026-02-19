// Payload para actualizar un testigo
export interface WitnessUpdatePayload {
    documentTypeId: number;
    cui: string;
    names: string;
    paternalSurname: string;
    maternalSurname: string;
    birthdate: string;
    gender: 'M' | 'F';
    address: string;
    email: string;
    phone: string;
    ubigeoId: string;
    maritalStatus: string;
}

// Respuesta del backend al actualizar testigos
export interface UpdateWitnessesResponse {
    status: boolean;
    code: number;
    message: string;
}
