import { ContainerStateType } from "./organization.model";

export interface FileAndFolderMetadata {
    id?: string;
	name: string;
	extension?: string;
	itemType: string;
	mediaType?: string;
	container?: number;
	organizationId: string;
	parentId?: string;
	details?: FileDetails;
	uploadedWith?: object;
	isActive?: boolean;
	createDatetime?: string;
}

export interface FileDetails {
    encoding: string;
	fieldname: string;
	filename: string;
	mimetype: string
	originalname: string;
	size: number;
}

export interface BasicMetadata {
    store: ContainerStateType;
    parentFolderId: string;
    metadata: {id: string, filename: string}
}
