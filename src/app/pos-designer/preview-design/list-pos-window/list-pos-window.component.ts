import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SecureLayoutService } from 'src/app/core/broadcasts/secure-layout.service';
import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { DropdownOption } from 'src/app/core/models/key-value-pair.model';
import { PosWindow } from 'src/app/core/models/pos-window.model';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { LocalStorageCacheService } from 'src/app/core/services/local-storage-cache.service';
import { KeyValuePairService } from 'src/app/setting/key-value-pair/repositories/key-value-pair.service';
import { UtilKeyValuePairService } from 'src/app/setting/key-value-pair/services/util-key-value-pair.service';
import { SubSink } from 'subsink';
import { PosWindowService } from '../../repositories/pos-window.service';

@Component({
  selector: 'wx-list-pos-window',
  templateUrl: './list-pos-window.component.html',
  styleUrls: ['./list-pos-window.component.scss']
})
export class ListPosWindowComponent implements OnInit {

  posWindows: PosWindow[];
  organizationId: string;

  dropdownOptions: {[key: string]: DropdownOption[]} = {measurementUnit: [], aspectRatio: [], designerLayerType: [], designerLayerFieldAvail: []};
  entityState: FormControl = new FormControl('active', [Validators.required]);
  isEditing: boolean = false;
  limit: FormControl = new FormControl(20, [Validators.required, Validators.pattern(/^\d+$/)]);
  subsinks: SubSink = new SubSink();

  constructor(
    private posWindowService: PosWindowService,
    public snackBar: MatSnackBar, private route: ActivatedRoute,
    private interpretServerErrorService: InterpretServerErrorService,
    private keyValuePairService: KeyValuePairService,
    private utilKeyValuePairService: UtilKeyValuePairService,
    private secureLayoutBroadcast: SecureLayoutService
  ) { }

  ngOnInit(): void {
    this.organizationId = this.route.snapshot.paramMap.get("organizationId") || 'none';

    this.secureLayoutBroadcast.emitSidebarEvent(true); // pos design upsert closes so we have to open it again.

    this.fetchAllDropDownOptions();
    this.fetchPoswindows();
  }

  // replace dropdown key with displayText shown in options
  // Note: It has been triggering multiple times. Find out why change detection triggers multiple times. expecially for hovering over buttons.
  findInDropDownOptions(dropDownName: string, key: string){
    return this.utilKeyValuePairService.findInDropDownOptions(this.dropdownOptions[dropDownName], key);
  }

  // fetch all organizations regardless of their status
  fetchPoswindows(){
    if(this.entityState.valid && this.limit.valid){
      this.subsinks.sink = this.posWindowService.getAssociatedPosWindows(this.organizationId, this.entityState.value, this.limit.value)
      .pipe(
        catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
      ) 
      .subscribe( (posDesignList: PosWindow[]) => {
        this.posWindows = posDesignList;
      }, (appropriateError: {msg: string, status: number}) => {
        this.displayError(appropriateError.msg, appropriateError.status);
      });
    }
  }

  // fetch drop down options from keyValuePairs
  fetchAllDropDownOptions(){
    this.subsinks.sink = this.keyValuePairService.fetchDropdownOptions(
      ['measurementUnit', 'aspectRatio', 'designerLayerType', 'designerLayerFieldAvail'], this.organizationId
    )
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )       
    .subscribe( (allDropdownOptions: {[key: string]: DropdownOption[]}) => {
      this.dropdownOptions = allDropdownOptions;
    }, (appropriateError: {msg: string, status: number}) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  /**
   * 
   * @param state 
   * @param index 
   * activate or deactivate an organization. on deactivate remove organization from view.
   */
  onChange(state: MatSlideToggleChange, index: number){
    this.isEditing = true;
    const updateObj: {isActive: boolean} = {isActive: state.checked};

    this.subsinks.sink = this.posWindowService.patchPosWindow(this.posWindows[index].id || '', updateObj, this.organizationId)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (organization: null) => {
        //successful patch returns null
        this.posWindows.splice(index, 1);
        this.isEditing = false;
    }, (appropriateError: {msg: string, status: number}) => {
        this.displayError(appropriateError.msg, appropriateError.status);
        this.isEditing = false;
    });
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
