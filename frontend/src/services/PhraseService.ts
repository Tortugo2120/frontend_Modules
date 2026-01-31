import axios from "axios";

interface PhraseResponse {
    phrase: string;
    author: string;
}

const baseURL = import.meta.env.MODE === 'development'
    ? '/api'
    : 'https://frasedeldia.azurewebsites.net/api';

const phraseApi = axios.create({
    baseURL,
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
    },
});

export const getPhrase = async (): Promise<PhraseResponse> => {
    try {
        const response = await phraseApi.get<PhraseResponse>("/phrase");
        return response.data;
    } catch (error) {
        console.error("Error fetching phrase:", error);
        throw error;
    }
};