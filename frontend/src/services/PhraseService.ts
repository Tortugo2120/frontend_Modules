import axios from "axios";

interface PhraseData {
    phrase: string;
    author: string;
    day: string;
}

interface ApiResponse {
    status: number;
    req_date: string;
    data: PhraseData;
}

const baseURL = import.meta.env.DEV
    ? '/api'
    : 'https://frase-del-dia.jqz.lat';

const phraseApi = axios.create({
    baseURL,
    timeout: 5000,
});

export const getPhrase = async (): Promise<PhraseData> => {
    try {
        const response = await phraseApi.get<ApiResponse>("/");
        return response.data.data; 
    } catch (error) {
        console.error("Error fetching phrase:", error);
        throw error;
    }
};