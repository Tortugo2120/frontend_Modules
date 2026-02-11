import {useState} from "react";
import {db, type DocumentModel} from "../model/documentModel.ts";

export const useDocument = () => {
    const [documents, setDocuments] = useState<DocumentModel[]>([]);

    const obtenerDocuments = async () => {
        try {
            const docs = await db.obtenerDocuments();
            setDocuments(docs);
        }catch (error) {
            console.log("Ocurrio un error al obtener todos los documentos",error);
        }
    }

    const deleteDocuments = async () => {
        try {
            await db.deleteDocuments();
            return true;
        }catch (error) {
            console.log("Ocurrio un error al eliminar todos los documentos",error);
        }
    }

    const addDocument = async (document: DocumentModel) => {
        try{
           return await db.addDocument(document);
        }catch (error) {
            console.log("Ocurrio un error al agregar el documento",error);
        }
    }

    const deleteDocument = async (requerimentId: number) => {
        try {
            const doc = await db.getDocumentByRequirementId(requerimentId);
            if (doc && doc.id) {
                await db.deleteDocument(doc.id);
            }
        }catch (error) {
            console.log("Ocurrio un error al eliminar el documento",error);
        }
    }

    return {documents, deleteDocuments,obtenerDocuments,addDocument,deleteDocument};
}