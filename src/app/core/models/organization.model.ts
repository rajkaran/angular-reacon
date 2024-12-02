export interface Organization {
    id?: string;
    name: string;
    businessType: string;
    website: string;
    location: Location;
    address: Address[];
    contact: Contact[];
    socialMedia: SocialMedia[];
    operationHour: OperationHour[];
    statutoryHolidayHour: OperationHour[];
    tax: Tax[];
    menu: {id: string, name: string, pos: number}[];
    vendorId: string;    
    organizationType: string;
    serviceCharge: ServiceCharge[]
    onlineOrder: OnlineOrder;
    isActive: boolean;
    isDeleted: boolean;
    isOpened: boolean;
    openDatetime: Date;
    createDatetime: Date;
}

export interface Address {
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    addressType?: string;
    latitude?: string;
    longitude?: string;
}

export interface Contact {
    designation: string;
    email: string[];
    familyName: string;
    givenName: string;
    phone: Phone[];
    preferredWay: string;
    salutation: string;
    type: string;
    emailInputBox?: string;
}

export class Phone {
    ext: string;
    number: string;
    type: string;
}

export interface OnlineOrder { 
    delivery: boolean;
    pickup: boolean;
}

export interface Location { 
    type: string; 
    coordinates: number[];
}

export class OperationHour {
    day: string;
    openAt: number;
    closeAt: number;
}

export class Tax {
    name: string;
    percent: number;
}

export class ServiceCharge {
    name: string;
    percent: number;
    amount: number;
}

export class SocialMedia {
    platform: string;
    url: string;
}

export interface ContainerStateType{
    container: number;
    exist: boolean;
  }
