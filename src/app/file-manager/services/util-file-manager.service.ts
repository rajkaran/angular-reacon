import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilFileManagerService {

  constructor() { }

  /**
   * 
   * @param blobContent 
   * @param fileName 
   * This method will initiate download automatically. This will generate a file containing content provided 
   * to it, at the default download location of browser.
   * @returns 
   */
  autoStartDownload(blobContent: Blob, fileName: string){
    let dataType = blobContent.type;
    let binaryData: Blob[] = [];
    let downloadLink = document.createElement('a');

    binaryData.push(blobContent);

    downloadLink.href = window.URL.createObjectURL(
        new Blob(binaryData, {type: dataType})
    );

    downloadLink.setAttribute('download', fileName);
    document.body.appendChild(downloadLink);
    downloadLink.click();

    return of('downloading...');
  }

  /**
   * 
   * @param fileType 
   * File object by default has a field named type which we can use to determine mediaType of the file.
   * We know what type of file we are allowing so we can add more logic to this function to determine for future file types.
   */
  determineMediaType(fileType: string): Observable<string>{
    let components = fileType.split('/').filter( (eachElement: string) => eachElement !== '' );
    return of(components[0]);
  }


}
