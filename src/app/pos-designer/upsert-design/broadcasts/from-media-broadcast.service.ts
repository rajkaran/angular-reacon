import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { FileAndFolderMetadata } from 'src/app/core/models/file-and-folder-metadata.model';

@Injectable({
  providedIn: 'root'
})
export class FromMediaBroadcastService {

  constructor() { }

  closeMediaList = new Subject<boolean>();
  addMediaInPosWindow = new Subject<FileAndFolderMetadata>();
  removeMediaFromPosWindow = new Subject<FileAndFolderMetadata>();

  emitCloseMediaListEvent(flag: boolean): void {
    this.closeMediaList.next(flag);
  }
  listenCloseMediaListEvent(): Observable<boolean> {
    return this.closeMediaList.asObservable();
  }

  emitAddMediaInPosWindowEvent(media: FileAndFolderMetadata): void {
    this.addMediaInPosWindow.next(media);
  }
  listenAddMediaInPosWindowEvent(): Observable<FileAndFolderMetadata> {
    return this.addMediaInPosWindow.asObservable();
  }

  emitRemoveMediaInPosWindowEvent(media: FileAndFolderMetadata): void {
    this.removeMediaFromPosWindow.next(media);
  }
  listenRemoveMediaInPosWindowEvent(): Observable<FileAndFolderMetadata> {
    return this.removeMediaFromPosWindow.asObservable();
  }


}
