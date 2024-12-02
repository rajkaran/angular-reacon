export interface SidebarMatrix {
    matIcon: string; 
    displayText: string;
    linkList: EachLink[];
}

export interface EachLink {
    matIcon: string; 
    routerLink: any[];
    displayText: string;
    onlyAllowedTo: string[];
}
