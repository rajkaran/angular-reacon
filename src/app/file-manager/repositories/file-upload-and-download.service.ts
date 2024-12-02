import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileAndFolderMetadata } from 'src/app/core/models/file-and-folder-metadata.model';
import { CommunicateServerService } from 'src/app/core/rest/communicate-server.service';

@Injectable({
  providedIn: 'root'
})
export class FileUploadAndDownloadService {

  constructor(private communicateServerService: CommunicateServerService) { }

  /**
   * 
   * @param fileAndMetaData 
   * @param organizationId 
   * Upload media with a specific name and given path.
   * @returns 
   */
  uploadMedia(fileAndMetaData: FormData, organizationId: string): Observable<FileAndFolderMetadata>{
    let url = '/file-uploads/'+organizationId;
    return <any>this.communicateServerService.store(url, fileAndMetaData);
  }

  /**
   * 
   * @param fileId 
   * @param organizationId 
   * Download a file by id
   * @returns 
   */
  downloadMedia(fileId: string, organizationId: string){
    let url = '/file-downloads/'+organizationId+'/'+fileId;
    return <any>this.communicateServerService.fetchWithHeaders(url, {responseType: 'blob'});
  }


}
