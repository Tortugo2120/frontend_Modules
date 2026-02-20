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
    ubigeoId: number;  // el backend valida como integer
    maritalStatus: string;
    rol: 'testigo';
    ctry: string;      // DNI del contrayente al que representa
}

// Respuesta del backend al actualizar testigos
export interface UpdateWitnessesResponse {
    status: boolean;
    code: number;
    message: string;
}
