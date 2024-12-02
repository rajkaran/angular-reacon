import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { concat, forkJoin, of, throwError } from 'rxjs';
import { catchError, concatMap, debounceTime, filter, map } from 'rxjs/operators';
import { SecureLayoutService } from 'src/app/core/broadcasts/secure-layout.service';
import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { FeatureMethod } from 'src/app/core/models/feature-method.model';
import { FileAndFolderMetadata } from 'src/app/core/models/file-and-folder-metadata.model';
import { DropdownOption } from 'src/app/core/models/key-value-pair.model';
import { MenuItem } from 'src/app/core/models/menu.model';
import { PosScreen, PosWindow } from 'src/app/core/models/pos-window.model';
import { HelperService } from 'src/app/core/services/helper.service';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { FileAndFolderMetadataService } from 'src/app/file-manager/repositories/file-and-folder-metadata.service';
import { MenuItemService } from 'src/app/menu-builder/repositories/menu-item.service';
import { FeatureMethodService } from 'src/app/setting/feature-method/repositories/feature-method.service';
import { KeyValuePairService } from 'src/app/setting/key-value-pair/repositories/key-value-pair.service';
import { SubSink } from 'subsink';
import { PosWindowService } from '../../repositories/pos-window.service';
import { KeypressEventBroadcastService } from '../broadcasts/keypress-event-broadcast.service';
import { LoadingDialogComponent } from '../loading-dialog/loading-dialog.component';

@Component({
  selector: 'wx-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit {

  dialogRef: any;
  featureMethods: FeatureMethod[];
  id: string;
  menuItems: MenuItem[];
  organizationId: string;
  posWindow: PosWindow;

  dropdownOptions: {[key: string]: DropdownOption[]} = {measurementUnit: [], aspectRatio: [], designerLayerType: [], designerLayerFieldAvail: []};
  subsinks: SubSink = new SubSink();

  constructor(
    public snackBar: MatSnackBar, private route: ActivatedRoute,
    private secureLayoutBroadcast: SecureLayoutService,
    private posWindowService: PosWindowService,
    private keyValuePairService: KeyValuePairService,
    private featureMethodService: FeatureMethodService,
    private menuItemService: MenuItemService,
    private interpretServerErrorService: InterpretServerErrorService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.organizationId = this.route.snapshot.paramMap.get("organizationId") || '';
    this.id = this.route.snapshot.paramMap.get("id") || '';

    this.createOrFindPosWindow();
    
    // along with title emit event to hide sidebar on load
    this.secureLayoutBroadcast.emitPageTitleEvent('Modify POS Design');
    this.secureLayoutBroadcast.emitSidebarEvent(false);
  }

  /**
   * We need to pull information from server. That information has to be pulled in certain sequence which will be managed by pipe sequence.
   * fetch drop down options from keyValuePairs before anything else
   * If posWindowId is given then fetch details of POS window to render all screens. otherwise Create a new entry with 
   * default values so that user can store work under a POS window.
   */
  createOrFindPosWindow(){
    this.showLoading();

    const defaultValues = {name: 'Untitled POS', alias: '', canvasWidth: 1024, canvasHeight: 576, designWidth: 1920, designHeight: 1080,
      aspectRatio: {width: "16", height: "9"}, organizationId: this.organizationId, screens: [], mediaList: [], createDatetime: new Date(), isActive: true};

    let createObservable = of(this.id)
    .pipe(
      filter( (id: string) => id == 'none'),
      concatMap( () => this.posWindowService.countOverallEnteries(this.organizationId)),
      concatMap( (count: {count: number}) => {
        defaultValues.alias = 'pwc'+(count.count+1);
        return this.posWindowService.createPosWindow(defaultValues, this.organizationId)
      }),
    );

    let findObservable = of(this.id)
    .pipe(
      filter( (id: string) => id != 'none'),
      concatMap( () => this.posWindowService.fetchPosWindowById(this.id, this.organizationId))
    );

    this.subsinks.sink = forkJoin([
      this.featureMethodService.fetchAllFeatureMethodAsCustomer(this.organizationId),
      this.menuItemService.fetchMenuItem(this.organizationId),
      this.keyValuePairService.fetchDropdownOptions( ['measurementUnit', 'aspectRatio', 'designerLayerType', 'designerLayerFieldAvail'], this.organizationId )
    ])
    .pipe(
      concatMap( ([featureMethodList, menuItemList, allDropdownOptions]) => {
        this.dropdownOptions = <{[key: string]: DropdownOption[]}>allDropdownOptions;
        this.featureMethods = featureMethodList;
        this.menuItems = menuItemList;

        return concat(createObservable, findObservable)
      }),
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (posWindow: PosWindow) => {
      this.posWindow = posWindow;
      this.secureLayoutBroadcast.emitPageTitleEvent(`Modify ${this.posWindow.name} Design`);
      this.hideLoading();
    }, (appropriateError) => {
      this.hideLoading();
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  
  
  // Show loading spinner
  showLoading(){
    this.dialogRef = this.dialog.open(LoadingDialogComponent, {
      disableClose: false
    });
  }

  // Hide loading spinner
  hideLoading(){
    this.dialogRef.close();
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
