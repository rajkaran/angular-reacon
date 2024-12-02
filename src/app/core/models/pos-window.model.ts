import { FileAndFolderMetadata } from "./file-and-folder-metadata.model";

export interface PosWindow {
     id?: string;
     name: string;
     alias: string;
     canvasWidth: number;
     canvasHeight: number;
     designWidth: number;
     designHeight: number;
     screens: PosScreen[];
     mediaList: string[];
     mediaListObjects?: FileAndFolderMetadata[];
     aspectRatio: {
          width: string,
          height: string
     },
     googleFontLink?: {family: string, link: string}[];
     isActive: boolean;
     organizationId: string;
     createDatetime: Date;
}

export interface PosWindowSetting {
     name: string;
     alias: string;
     canvasWidth: number;
     canvasHeight: number;
     designWidth: number;
     designHeight: number;
     aspectRatio: {
          width: string,
          height: string
     }
}

export interface PosScreen {
     id: string;
     name: string;
     background: {'background-color': string, 'background-image': string, 'background-position': string, 'background-size': string, 'background-repeat': string};
     customStyle: {property: string, value: string}[];
     layers: Layer[];
     style: {[key: string]: string};
}

export interface Layer {
     id: string;
     type: string;
     name: string;
     content: string;
     source: string;
     screen: string;
     menuItem: string;
     featureMethod: string;
     position: {top: number, left: number};
     dimension:{width: number, height: number};   
     background: {'background-color': string, 'background-image': string, 'background-position': string, 'background-size': string, 'background-repeat': string};   
     border: {'border-width': number, 'border-style': string, 'border-color': string, 'border-radius': number}; 
     padding: {'padding-top': number, 'padding-bottom': number, 'padding-left': number, 'padding-right': number};
     margin: {'margin-top': number, 'margin-bottom': number, 'margin-left': number, 'margin-right': number};
     text: {'text-align': string, 'font-size': number, 'font-family': string, 'font-weight': string, color: string};
     customStyle: {property: string, value: string}[];
     isActive: boolean;
     style: {[key: string]: string};
}

export interface SelectedLayer {
     id: string;
     index: number;
}

export interface SelectedScreen {
     id: string;
     index: number;
}