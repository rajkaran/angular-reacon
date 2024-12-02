export interface FeatureMethod {
    id?: string;
    name?: string;
    declaration: string;
    description?: string;
    isActive: boolean;
    organizationId: string;
    createDatetime: Date;
}
