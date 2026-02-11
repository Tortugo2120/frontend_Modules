import apiAxios from "../api/Axios.tsx";

interface UploadDocumentPayload {
    applicationId: number;
    requirementId: number;
    file: File;
}

export const uploadDocument = async (payload:UploadDocumentPayload)=>{
    const formData = new FormData();
    formData.append('applicationId', payload.applicationId.toString());
    formData.append('requirementId', payload.requirementId.toString());
    formData.append('file', payload.file);

    const response = await apiAxios.post("api/v1/document", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
}