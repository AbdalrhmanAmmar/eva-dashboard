
type entityType = "individual" | "organization" | "company";

interface IAdress{

    country:string,
    city:string,
    buildingNumber:string,
    unitNumber:string,
    apartmentNumber:string,
    addressDetails:string,

}

export  interface IUser {
  _id?: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  entityType: entityType;
  entityName: string;
  accountRole: string;
  jobTitle: string;
  addresses: IAdress[];
  commercialRecordNumber: string;
  commercialRecordFile: string;
  taxNumber: string;
  taxFile: string;
  nationalAddressNumber: string;
  nationalAddressFile: string;
  verificationStatus: string;
  pendingEmail?: string;
}