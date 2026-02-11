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
}

export const db = new DatabaseDocumentModel();