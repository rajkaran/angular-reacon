import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BasicMetadata, FileAndFolderMetadata } from 'src/app/core/models/file-and-folder-metadata.model';
import { CommunicateServerService } from 'src/app/core/rest/communicate-server.service';

@Injectable({
  providedIn: 'root'
})
export class FileAndFolderMetadataService {

  constructor(private communicateServerService: CommunicateServerService) { }

  /**
   * 
   * @param filename 
   * @param path 
   * @param organizationId 
   * Create a place holder in fileAndFolderMetadata collection before uploading an actual file.
   * @returns 
   */
  createBasicMetadata(filename: string, path: string, organizationId: string): Observable<BasicMetadata>{
    let url = '/file-and-folder/metadata/'+organizationId;
		return <any>this.communicateServerService.store(url, {filename: filename, path: path});
  }

  /**
   * 
   * @param parentFolderName 
   * @param organizationId 
   * Fetch all the files from a given folder of an organization.
   * @returns 
   */
  getfilesFromFolder(parentFolderName: string, organizationId: string): Observable<FileAndFolderMetadata[]>{
    let url = '/file-and-folder/from-folder/'+organizationId;
    let httpParams = new HttpParams().set('parentFolder', parentFolderName);
		return <any>this.communicateServerService.fetchWithParam(url, { params: httpParams });
  }


}
