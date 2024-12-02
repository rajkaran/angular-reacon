export interface KeyValuePair {
    id: string;
    identifier: string;
    pairValue: string;
    pairType: string;
    organizationId: string;
    isActive: boolean;
    createDatetime: Date;
}

export interface PartialKeyValuePair {
    identifier: string;
    pairValue: string;
    pairType: string;
}

export interface DropdownOption {
    key: string;
    displayText: string;
}
