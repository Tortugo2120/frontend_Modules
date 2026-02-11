// frontend/src/hooks/useUploadDocuments.ts
import { useState } from 'react';
import { uploadDocument as uploadDocumentService } from '../services/DocumentService';

interface UploadDocumentPayload {
    applicationId: number;
    requirementId: number;
    file: File;
}

interface UploadResponse {
    status: boolean;
    code: number;
    message: string;
}

export const useUploadDocuments = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

    const uploadDocument = async (payload: UploadDocumentPayload): Promise<UploadResponse> => {
        try {
            const response = await uploadDocumentService(payload); // Usa el servicio importado
            return response;
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            console.error(axiosError.response);
            throw new Error(axiosError.response?.data?.message || 'Error al subir documento');
        }
    };

    const uploadMultipleDocuments = async (documents: UploadDocumentPayload[]) => {
        setIsUploading(true);
        setUploadError(null);
        setUploadSuccess(false);
        setUploadProgress({ current: 0, total: documents.length });

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        };

        for (let i = 0; i < documents.length; i++) {
            try {
                await uploadDocument(documents[i]);
                results.success++;
                setUploadProgress({ current: i + 1, total: documents.length });
            } catch (error) {
                results.failed++;
                const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
                results.errors.push(`${documents[i].file.name}: ${errorMsg}`);
            }
        }

        setIsUploading(false);

        if (results.failed === 0) {
            setUploadSuccess(true);
            return { success: true, message: `${results.success} documentos subidos exitosamente` };
        } else if (results.success > 0) {
            setUploadError(`${results.success} exitosos, ${results.failed} fallidos`);
            return { success: false, message: results.errors.join(', ') };
        } else {
            setUploadError('Todos los documentos fallaron');
            return { success: false, message: results.errors.join(', ') };
        }
    };

    return {
        uploadMultipleDocuments,
        isUploading,
        uploadError,
        uploadSuccess,
        uploadProgress
    };
};