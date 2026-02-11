import Dexie, {type Table} from "dexie";

export interface DocumentModel {
    id?: number; // ID autoincrementado
    requirementId: number;
    file: File | null;
    nombreArchivo: string;
}

export class DatabaseDocumentModel extends Dexie{
    documents! : Table<DocumentModel>;
    constructor() {
        super('DocumentDatabase');
        this.version(1).stores({
            documents: '++id, requirementId'
        });
    }

    async obtenerDocuments(): Promise<DocumentModel[]> {
        return this.documents.toArray();
    }

    async deleteDocuments(): Promise<void> {
        await this.documents.clear();
    }

    async addDocument(document: DocumentModel) {
        const id = await this.documents.add(document);
        const doc = await this.documents.get(id);
        return doc;
    }

    async getDocumentByRequirementId(requirementId: number): Promise<DocumentModel | undefined> {
        return this.documents
            .where('requirementId')
            .equals(requirementId)
            .first();
    }

    async deleteDocument(id: number): Promise<void> {
        await this.documents.delete(id);
    }
}

export const db = new DatabaseDocumentModel();