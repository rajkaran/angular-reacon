export interface AuthorizationMatrix {
    id?: string;
    resource: string;
    scopes: string[];
    note: string;
    matrix: Matrix[];
    organizationId: string;
    isActive: boolean;
}

export interface Matrix {
    organizationTypes: string[];
    roles: string[];
    targets: string[];
}