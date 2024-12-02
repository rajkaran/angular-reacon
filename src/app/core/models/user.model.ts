export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    organizationId: string;
    roles: string[];
    createDatetime: Date; 
}

export interface Credential {
    email: string;
    password: string;
}

export interface AccessToken {
	id: string;
	roles: string[];
	token: string;
	name: string;
	createDatetime: Date;
	organizationId: string;
}

export interface DecodedToken {
    alg: string;
    email: string;
    exp: number;
    iat: number;
    id: string;
    name: string;
    typ: string;
}