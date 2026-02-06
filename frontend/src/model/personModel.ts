export interface PersonCreateResponse{
    status:boolean;
    code:number;
    data:{
        name:string;
        documentNumber:string;
        paternalSurname:string;
        maternalSurname:string;
        birthdate:string;
        address:string;
        email:string;
        phone:string;
        ubigeoId:string;
        maritalStatus:string
        gender:string;
    }
}