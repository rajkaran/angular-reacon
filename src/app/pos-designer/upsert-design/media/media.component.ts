import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, throwError } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';
import { SubSink } from 'subsink';

import { environment } from 'src/environments/environment';
import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { FileAndFolderMetadata } from 'src/app/core/models/file-and-folder-metadata.model';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { FileAndFolderMetadataService } from 'src/app/file-manager/repositories/file-and-folder-metadata.service';
import { FileUploadAndDownloadService } from 'src/app/file-manager/repositories/file-upload-and-download.service';
import { UtilFileManagerService } from 'src/app/file-manager/services/util-file-manager.service';
import { FromMediaBroadcastService } from '../broadcasts/from-media-broadcast.service';

@Component({
  selector: 'wx-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent implements OnInit, OnDestroy {

  @Input() organizationId: string;
  @Input() canvasHeight: number;
  @Input() canvasWidth: number;
  @Input() mediaList: FileAndFolderMetadata[];

  uploadMediaForm: FormGroup;

  isMediaPreviewOpen: boolean = false;
  fileUpload: FormControl = new FormControl('');
  selectedFileName = 'Choose File';
  selectedMediaFile: {mediaObject: FileAndFolderMetadata|undefined, index: number} = {mediaObject: undefined, index: -1};
  serverUrl = environment.api_url;
  subsinks: SubSink = new SubSink();

  constructor(
    private fromMediaBroadcast: FromMediaBroadcastService,
    public snackBar: MatSnackBar,
    private interpretServerErrorService: InterpretServerErrorService,
    private fileAndFolderMetadataService: FileAndFolderMetadataService,
    private fileUploadAndDownloadService: FileUploadAndDownloadService,
    private utilFileManagerService: UtilFileManagerService
  ) { }

  ngOnInit(): void {
    this.initUploadMediaForm();
  }

  // Initialize upload media form
  initUploadMediaForm(){
		this.uploadMediaForm = new FormGroup({
      media: new FormControl('')
    });
  }


  /**
   * 
   * @param event 
   * Reactive Form isn't enough to upload file to server. FormGroup is JSON object whereas to upload server requires FormData.
   * This method only uploads one file at a time, to upload multiple files we would need to call this method for each selected file.
   */
	onUploadMedia(event: any){
    const fileListObject: FileList|null = (event.target as HTMLInputElement).files;
    
    if(fileListObject != null && fileListObject.length > 0){
      const file: File = fileListObject[0];
      this.selectedFileName = file.name;
      this.uploadMediaForm.patchValue({ media: file });
      this.uploadMediaForm.get('media')?.updateValueAndValidity;

      this.displayError('Getting ready to upload file '+this.selectedFileName, 200);
      this.processUpload(file);
    }
  }

  /**
   * 
   * @param file 
   * Upload a selected file to server as a FormData. This formdata will have complete metadata 
   * which is needed to be stored on server.
   * By default 'My Drive' folder exist in every organization. Until SL Drive like folder structure not developed
   * we will continue to save all files in this default logical folder.
   */
  processUpload(file: File){
    this.subsinks.sink = forkJoin([
      this.fileAndFolderMetadataService.createBasicMetadata(file.name, 'My Drive', this.organizationId),
      this.utilFileManagerService.determineMediaType(file.type)
    ]) 
    .pipe(
      concatMap( ([destination, mediaType]) => {
        const formData = new FormData();

        formData.append('container', destination.store.container.toString());
        formData.append('isContainerExist', destination.store.exist.toString());
        formData.append('folder', destination.parentFolderId);
        formData.append('fileId', destination.metadata.id);
        formData.append('filename', destination.metadata.filename);
        formData.append('mediaType', mediaType);
        formData.append('organizationId', this.organizationId);
        formData.append('media', file);
        
        return this.fileUploadAndDownloadService.uploadMedia(formData, this.organizationId);
      }),
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (file: FileAndFolderMetadata) => {
      this.displayError(this.selectedFileName+' file is uploaded', 200);
      this.fromMediaBroadcast.emitAddMediaInPosWindowEvent(file);
      this.uploadMediaForm.reset();
    }, (appropriateError: any) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  /**
   * 
   * @param mediaId 
   * @param mediaIndex 
   * Open Media preview in a draggable box
   */
  onSelectMedia(mediaObject: FileAndFolderMetadata, mediaIndex:number){
    if(this.selectedMediaFile.mediaObject?.id !== mediaObject.id){
      this.selectedMediaFile = {mediaObject: mediaObject, index: mediaIndex};
    }

    this.isMediaPreviewOpen = true;
  }

  /**
   * 
   * @param id 
   * @param filename 
   * Trigger download for a file when user clicks on the file
   */
  onDownload(id?: string, filename?: string){
    if(id && filename){
      this.displayError(`Downloading file ${this.selectedFileName}`, 200);

      this.subsinks.sink = this.fileUploadAndDownloadService.downloadMedia(id, this.organizationId)
      .pipe(
        concatMap( (fileBlob: ArrayBuffer) => this.utilFileManagerService.autoStartDownload(new Blob([fileBlob]), filename) ),
        catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
      )
      .subscribe( (msg: string) => {
        this.displayError(msg, 200);
      }, (appropriateError: any) => {
        this.displayError(appropriateError.msg, appropriateError.status);
      });
    }
  }

  /**
   * 
   * @param mediaObject 
   * Remove media from media list of POS window and persist to server.
   */
  onRemove(mediaObject: FileAndFolderMetadata){
    this.fromMediaBroadcast.emitRemoveMediaInPosWindowEvent(mediaObject);
  }

  // close media list draggable box
  onCloseMediaList(){
    this.fromMediaBroadcast.emitCloseMediaListEvent(false);
  }

  // display messages in snackbar
  displayError(message: string, action: number){
    this.snackBar.openFromComponent(InteractMessageComponent, {
      data: {message: message, action: action},
      duration: 5000,
    });
  }

  // destroy subscriptions on component destroy
  ngOnDestroy(){
    this.subsinks.unsubscribe();
  }

}
