
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
