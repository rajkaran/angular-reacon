export interface Menu {
}

export interface MenuItem {
    id?: string;
    name?: string;
    alias?: string;
    department?: string;
    price?: string;
    displayName?: string;
    description?: string;
    notes?: string;
    limitedTimeOnly?: object[];
    comboItem?: string;
    reqComboItem?: object[];
    replaceable?: string;
    replaceWith?: object[];
    misc?: object[];
    pos?: string;
    xTaxes?: object[];
    customerEditable?: boolean;
    canUseCoupons?: boolean;
    canUseRewards?: boolean;
    special?: boolean;
    onSale?: boolean;
    new?: boolean;
    referenced?: boolean;
    menuId?: string;
    isActive?: boolean;
    organizationId: string;
    createDatetime: string;
}
