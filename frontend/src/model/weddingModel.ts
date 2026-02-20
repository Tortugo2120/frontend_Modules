
export interface MarriageDetails {
    id: string;
    fechaM: string;
    hora: string;
    direccion: string;
    oficianteId: string;
    oficiante: string;
}

export interface MarriageDetailsResponse {
    status: boolean;
    code: number;
    message: string;
    data: MarriageDetails;
}

export interface WeddingUpdatePayload {
    marriageDate: string;
    marriageTime: string;
    marriagePlace: string;
    marriageOfficiantId: string;
}

export interface UpdateWeddingResponse {
    status: boolean;
    code: number;
    message: string;
}
