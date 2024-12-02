import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { concat, of, throwError } from 'rxjs';
import { catchError, concatMap, filter } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as uuid from 'uuid';

import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { DropdownOption } from 'src/app/core/models/key-value-pair.model';
import { Layer, PosScreen, PosWindow, PosWindowSetting } from 'src/app/core/models/pos-window.model';
import { HelperService } from 'src/app/core/services/helper.service';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { FromLayerBroadcastService } from '../broadcasts/from-layer-broadcast.service';
import { FromToolbarBroadcastService } from '../broadcasts/from-toolbar-broadcast.service';
import { SettingDialogComponent } from '../setting-dialog/setting-dialog.component';
import { ToolbarService } from '../services/toolbar.service';
import { PosWindowService } from '../../repositories/pos-window.service';
import { FromScreenBroadcastService } from '../broadcasts/from-screen-broadcast.service';
import { FromMediaBroadcastService } from '../broadcasts/from-media-broadcast.service';
import { FileAndFolderMetadata } from 'src/app/core/models/file-and-folder-metadata.model';
import { FeatureMethod } from 'src/app/core/models/feature-method.model';
import { MenuItem } from 'src/app/core/models/menu.model';
import { SecureLayoutService } from 'src/app/core/broadcasts/secure-layout.service';

@Component({
  selector: 'wx-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit, OnChanges {

  @Input() organizationId: string;
  @Input() posWindow: PosWindow;
  @Input() dropdownOptions: {[key: string]: DropdownOption[]};
  @Input() featureMethods: FeatureMethod[];
  @Input() menuItems: MenuItem[];  

  posWindowLocal: PosWindow;

  departments: string[] = [];
  fieldAvailability: {[key: string]: string[]} = {};
  isEditLayerOpen: boolean = false;
  isEditScreenOpen: boolean = false;
  isLayerListOpen: boolean = false;
  isMediaListOpen: boolean = false;
  isScreenListOpen: boolean = false;
  isToolbarVisible: boolean = true;
  measurementUnits: {[key: string]: string} = {};
  selectedLayer: {id: string, index: number} = {id: '', index: -1};
  selectedScreen: {id: string, index: number} = {id: '', index: -1};
  subsinks: SubSink = new SubSink();

  constructor(
    public snackBar: MatSnackBar, public dialog: MatDialog,
    private interpretServerErrorService: InterpretServerErrorService,
    private fromToolbarBroadcast: FromToolbarBroadcastService,
    private helperService: HelperService,
    private fromLayerBroadcast: FromLayerBroadcastService,
    private fromScreenBroadcast: FromScreenBroadcastService,
    private fromMediaBroadcast: FromMediaBroadcastService,
    private toolbarService: ToolbarService,
    private posWindowService: PosWindowService,
    private secureLayoutBroadcast: SecureLayoutService,
  ) { }

  ngOnInit(): void {
    this.tapBroadcasts();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {

      if(propName === 'dropdownOptions'){
        for(let i = 0, len = this.dropdownOptions.designerLayerFieldAvail.length; i < len; i++){
          if(this.fieldAvailability.hasOwnProperty(this.dropdownOptions.designerLayerFieldAvail[i].key)){
            this.fieldAvailability[this.dropdownOptions.designerLayerFieldAvail[i].key].push(this.dropdownOptions.designerLayerFieldAvail[i].displayText);
          }
          else{
            this.fieldAvailability[this.dropdownOptions.designerLayerFieldAvail[i].key] = [this.dropdownOptions.designerLayerFieldAvail[i].displayText];
          }
        }

        for(let i = 0, len = changes[propName].currentValue.measurementUnit.length; i < len; i++){
          this.measurementUnits[this.dropdownOptions.measurementUnit[i].key] = this.dropdownOptions.measurementUnit[i].displayText
        }
      }

      if(propName === 'menuItems'){
        if(changes[propName].currentValue){
          this.departments = this.menuItems.map( (item: MenuItem) => item.department || '').filter( (value, index, self) => self.indexOf(value) === index );
        }        
      }

      if(propName === 'posWindow'){
        if(changes[propName].currentValue){
          console.log('toolbar', this.posWindow)
          this.posWindowLocal = this.posWindow;

          // select first screen to render on load. emitting event causes race condition.
          this.selectedScreen = {id: this.posWindowLocal.screens[0].id, index: 0};
        }
      }

    }
  }

  
  /**
   * {'font-size': {
            '768': '9px',
            '1024': '12px',
            '1200': '14px',
            '1366': '14px'
          }}
          googleFontLink
   */

  // build/design widgets invoice and status how they would look like.

  // create or find posWindow in a resolution so that upsert page will never have poswindowId as none. this will recreate object on refresh.
  // Have alist of POSWindows from where a vendor can go to edit a posWindow
  // preview media on the view by pulling from Ajax and pushed to view instead of using url. URL can't send authorization bearer to server
  // make sure wx do not have options to edit information of customer of client and store and vendor can't edit store info.

  // Add option in settings dialog to select media of another posWindow.
  // Add option of adding google font from settings
  // Add option of adjusting global font from settings
  // Add option to delete media permanently.
  // Show path to layers to which a media item is associated.

  // build group setup for layers
  // configure key board short cuts save, preview, move  a layer, open screen or layer list.
  // Add an option to add line on the canvas to help in aligning layers
  // Add ability to drag and drop buttons 
  // Add ability to resize a layer by dragging from different corners of the layer. 
  // use local storage in place of session storage so that user can oprn application in multiple tabs.
   

  // tap broadcasted events through out the designer
  tapBroadcasts(){
    // update layer view as layer style changes
    this.subsinks.sink = this.fromLayerBroadcast.listenUpdateLayerEvent()
    .subscribe( (layer: Layer) => {
      this.posWindowLocal.screens[this.selectedScreen.index].layers[this.selectedLayer.index] = layer;
    });

    // update screen view as screen style changes
    this.subsinks.sink = this.fromScreenBroadcast.listenUpdateScreenEvent()
    .subscribe( (screen: PosScreen) => {
      this.posWindowLocal.screens[this.selectedScreen.index] = screen;
    });

    // toggle media list visbility
    this.subsinks.sink = this.fromMediaBroadcast.listenCloseMediaListEvent()
    .subscribe( (flag: boolean) => {
      this.isMediaListOpen = flag;
    });

    // Add newly uploaded media into POS window
    this.subsinks.sink = this.fromMediaBroadcast.listenAddMediaInPosWindowEvent()
    .subscribe( (media: FileAndFolderMetadata) => {
      this.posWindowLocal.mediaList.push(media.id || '');
      this.posWindowLocal.mediaListObjects?.push(media);
      this.onSave();
    });

    // Remove a media from POS window
    this.subsinks.sink = this.fromMediaBroadcast.listenRemoveMediaInPosWindowEvent()
    .subscribe( (media: FileAndFolderMetadata) => {
      const index = this.posWindowLocal.mediaList.indexOf(media.id || '');
      this.posWindowLocal.mediaList.splice(index, 1);
      this.posWindowLocal.mediaListObjects?.splice(index, 1);
      this.onSave();
    });
  }

  // Add a new screen with default entries
  onAddScreen(){
    this.subsinks.sink = this.toolbarService.screenDefault()
    .subscribe( (newScreen: PosScreen) => {
      this.posWindowLocal.screens.push(newScreen);
    });
  }

  /**
   * 
   * @param screenId 
   * @param screenIndex 
   * broadcast screen being selected to modify. Open updated screen form to edit.
   */
  onSelectedScreen(screenId: string, screenIndex: number){
    if(this.selectedScreen.id !== screenId){
      this.fromToolbarBroadcast.emitSelectedScreenEvent(screenId, screenIndex);
      this.selectedScreen = {id: screenId, index: screenIndex};

      this.fromToolbarBroadcast.emitSelectedLayerEvent('', -1);
      this.selectedLayer = {id: '', index: -1};  
      this.isEditLayerOpen = false;
      this.isLayerListOpen = false;
    }
    
    this.isEditScreenOpen = true;
  }

  /**
   * 
   * @param screenId 
   * @param screenIndex 
   * Clone a screen and add it back to screen list of POS Window.
   */
  onCloneScreen(screenId: string, screenIndex: number){
    this.subsinks.sink = this.helperService.deepClone(this.posWindowLocal.screens[screenIndex])
    .subscribe( (clonedScreen: PosScreen) => {
      this.posWindowLocal.screens.push(clonedScreen);
    });
  }

  /**
   * 
   * @param screenId 
   * @param screenIndex 
   * Deleteing a screen from here will delete it from canvas component too
   */
  onDeleteScreen(screenId: string, screenIndex: number){
    this.posWindowLocal.screens.splice(screenIndex, 1);

    if(screenIndex < this.selectedScreen.index){
      this.selectedScreen.index -= 1;
      this.fromToolbarBroadcast.emitSelectedScreenEvent(this.selectedScreen.id, this.selectedScreen.index);
    }
    else if(screenIndex == this.selectedScreen.index){
      if(screenIndex == 0){
        this.selectedScreen.id = this.posWindowLocal.screens[screenIndex].id;
      }
      else{
        this.selectedScreen.index -= 1;
        this.selectedScreen.id = this.posWindowLocal.screens[this.selectedScreen.index].id;
      }

      this.isEditLayerOpen = false;
      this.isLayerListOpen = false;
      this.fromToolbarBroadcast.emitSelectedLayerEvent('', -1);
      this.fromToolbarBroadcast.emitSelectedScreenEvent(this.selectedScreen.id, this.selectedScreen.index);
    }    
  }

  /**
   * 
   * @param event 
   * Angular material provides a utility to re-arrange a list. We will utilize it to re-arrange position of our layers.
   * As user drag and drops a layer at different location in the list. Order of layers will also get updated.
   */
  onDropLayer(event: CdkDragDrop<string[]>) {
    if(this.selectedLayer.index == event.previousIndex){
      this.selectedLayer.index = event.currentIndex;
      this.fromToolbarBroadcast.emitSelectedLayerEvent(this.selectedLayer.id, this.selectedLayer.index);
    }
    else if(this.selectedLayer.index != undefined && event.currentIndex <= this.selectedLayer.index && event.previousIndex > this.selectedLayer.index){
      this.selectedLayer.index += 1;
      this.fromToolbarBroadcast.emitSelectedLayerEvent(this.selectedLayer.id, this.selectedLayer.index);
    }
    else if(this.selectedLayer.index != undefined && event.currentIndex >= this.selectedLayer.index && event.previousIndex < this.selectedLayer.index){
      this.selectedLayer.index -= 1;
      this.fromToolbarBroadcast.emitSelectedLayerEvent(this.selectedLayer.id, this.selectedLayer.index);
    }

    moveItemInArray(this.posWindowLocal.screens[this.selectedScreen.index].layers, event.previousIndex, event.currentIndex);
  }

  /**
   * 
   * @param layerId 
   * @param layerIndex 
   * broadcast layer being selected to modify. Open updated layer form to edit. 
   */
  onSelectLayer(layerId: string, layerIndex: number){
    if(this.selectedLayer.id !== layerId){
      this.fromToolbarBroadcast.emitSelectedLayerEvent(layerId, layerIndex);
      this.selectedLayer = {id: layerId, index: layerIndex};
    }

    this.isEditLayerOpen = true;
  }

  // Changing flag here will change the status in canvas component
  onToggleLayerVisibility(layerId: string, layerIndex: number, isActive: boolean){
    this.posWindowLocal.screens[this.selectedScreen.index].layers[layerIndex].isActive = isActive;    
  }

  /**
   * 
   * @param layerType 
   * Add an ew layer with default entries for styling. set layer type to provided layerType.
   */
  onAddNewLayer(layerType: string){
    const navLinkObservable = of(layerType)
    .pipe(
      filter( (lt: string) => lt === 'navLink'),
      concatMap( () => this.toolbarService.navigationLink(layerType))
    );

    const btnObservable = of(layerType)
    .pipe(
      filter( (lt: string) => lt === 'btn'),
      concatMap( () => this.toolbarService.regularButton(layerType))
    )

    const dialogBtnObservable = of(layerType)
    .pipe(
      filter( (lt: string) => lt === 'dialogBtn'),
      concatMap( () => this.toolbarService.dialogBoxButton(layerType))
    )

    const invoiceWidgetObservable = of(layerType)
    .pipe(
      filter( (lt: string) => lt === 'invoiceWidget'),
      concatMap( () => this.toolbarService.invoiceWidget(layerType))
    )

    const statusWidgetObservable = of(layerType)
    .pipe(
      filter( (lt: string) => lt === 'statusWidget'),
      concatMap( () => this.toolbarService.statusWidget(layerType))
    )

    const imageObservable = of(layerType)
    .pipe(
      filter( (lt: string) => lt === 'image'),
      concatMap( () => this.toolbarService.imageBlock(layerType))
    )

    const videoObservable = of(layerType)
    .pipe(
      filter( (lt: string) => lt === 'video'),
      concatMap( () => this.toolbarService.videoBlock(layerType))
    )

    const textboxObservable = of(layerType)
    .pipe(
      filter( (lt: string) => lt === 'textbox'),
      concatMap( () => this.toolbarService.textbox(layerType))
    )

    this.subsinks.sink = concat(navLinkObservable, btnObservable, dialogBtnObservable, invoiceWidgetObservable, 
      statusWidgetObservable, imageObservable, videoObservable, textboxObservable)
    .subscribe( (newLayer: Layer) => {
      const lastIndex = this.posWindowLocal.screens[this.selectedScreen.index].layers.length;
      this.posWindowLocal.screens[this.selectedScreen.index].layers[lastIndex] = newLayer;
      this.fromToolbarBroadcast.emitAddLayerEvent(lastIndex);
    });
  }

  /**
   * 
   * @param layerId 
   * @param layerIndex 
   * Clone a layer and add it back to layer list of current screen.
   */
  onCloneLayer(layerId: string, layerIndex: number){
    this.subsinks.sink = this.helperService.deepClone(this.posWindowLocal.screens[this.selectedScreen.index].layers[layerIndex])
    .subscribe( (clonedLayer: Layer) => {
      clonedLayer.isActive = true;
      clonedLayer.id = uuid.v4();
      clonedLayer.name += ' - copy';
      
      this.posWindowLocal.screens[this.selectedScreen.index].layers.push(clonedLayer);
    });
  }
  
  /**
   * 
   * @param layerId 
   * @param layerIndex 
   * Deleteing a layer from here will delete it from canvas component too
   */
  onDeleteLayer(layerId: string, layerIndex: number){
    this.posWindowLocal.screens[this.selectedScreen.index].layers.splice(layerIndex, 1);

    if(layerIndex < this.selectedLayer.index){
      this.selectedLayer.index -= 1;
      this.fromToolbarBroadcast.emitSelectedLayerEvent(this.selectedLayer.id, this.selectedLayer.index);
    }
    else if(this.selectedLayer.id === layerId){
      this.fromToolbarBroadcast.emitSelectedLayerEvent('', -1);
      this.selectedLayer = {id: '', index: -1};  
      this.isEditLayerOpen = false;
    }
  }

  // open settings dialog box to allow user to update pos name, alias and dimensions
  onSetting(){
    const dialogRef = this.dialog.open(SettingDialogComponent, {
      data: {posWindow: this.posWindowLocal, organizationId: this.organizationId, dropdownOptions: this.dropdownOptions}
    });

    this.subsinks.sink = dialogRef.afterClosed()
    .pipe(
      filter( (posWindowSetting: PosWindowSetting) => posWindowSetting != undefined),
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (posWindowSetting: PosWindowSetting) => {

      for(let property in posWindowSetting){
        this.posWindowLocal[property] = posWindowSetting[property];
      }

      this.secureLayoutBroadcast.emitPageTitleEvent(`Modify ${this.posWindow.name} Design`);

      this.fromToolbarBroadcast.emitUpdateDimensionEvent(true);
    }, (appropriateError: any) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  // persist POS design to server
  onSave(){
    this.subsinks.sink = this.helperService.deepClone(this.posWindowLocal)
    .pipe(
      concatMap( (posWindowCloned: PosWindow) => {
        delete posWindowCloned.mediaListObjects
        return this.posWindowService.patchPosWindow(this.posWindowLocal.id || '', posWindowCloned, this.organizationId)
      }),
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (poswindow: null) => {
      this.displayError(`All Changes Saved`, 200);
    },(appropriateError) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  onPreview(){

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
