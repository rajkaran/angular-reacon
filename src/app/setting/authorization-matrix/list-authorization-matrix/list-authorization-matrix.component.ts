import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { SubSink } from 'subsink';

import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { AuthorizationMatrix } from 'src/app/core/models/authorization-matrix.model';
import { AuthorizationMatrixService } from '../repositories/authorization-matrix.service';
import { catchError } from 'rxjs/operators';
import { forkJoin, throwError } from 'rxjs';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { KeyValuePairService } from '../../key-value-pair/repositories/key-value-pair.service';
import { DropdownOption } from 'src/app/core/models/key-value-pair.model';
import { UtilKeyValuePairService } from '../../key-value-pair/services/util-key-value-pair.service';
import { SecureLayoutService } from 'src/app/core/broadcasts/secure-layout.service';

@Component({
  selector: 'wx-list-authorization-matrix',
  templateUrl: './list-authorization-matrix.component.html',
  styleUrls: ['./list-authorization-matrix.component.scss']
})
export class ListAuthorizationMatrixComponent implements OnInit, OnDestroy {

  authorizationMatrices: AuthorizationMatrix[];
  organizationId: string;

  dropdownOptions: {[key: string]: DropdownOption[]} = {roleTypes: [], organizationTypes: [], authMatrixTarget: []};
  isEditing: boolean = false;
  subsinks: SubSink = new SubSink();

  constructor(
    private authorizationMatrixService: AuthorizationMatrixService,
    public snackBar: MatSnackBar, private route: ActivatedRoute,
    private interpretServerErrorService: InterpretServerErrorService,
    private keyValuePairService: KeyValuePairService,
    private utilKeyValuePairService: UtilKeyValuePairService,
    private secureLayoutBroadcast: SecureLayoutService
  ) { }

  ngOnInit(): void {
    this.organizationId = this.route.snapshot.paramMap.get("organizationId") || 'none';

    this.secureLayoutBroadcast.emitPageTitleEvent('Authorization Matrices');
    
    this.fetchAuthorizationMatrices();
  }

  // replace dropdown key with displayText shown in options
  // Note: It has been triggering multiple times. Find out why change detection triggers multiple times. expecially for hovering over buttons.
  findInDropDownOptions(dropDownName: string, key: string){
    return this.utilKeyValuePairService.findInDropDownOptions(this.dropdownOptions[dropDownName], key);
  }

  // fetch all authorization matrix regardless of their status, fetch drop down options from keyValuePairs
  fetchAuthorizationMatrices(){
		this.subsinks.sink = forkJoin([
      this.authorizationMatrixService.fetchAllMatricesAsWX(this.organizationId),
      this.keyValuePairService.fetchDropdownOptions( ['roleTypes', 'organizationTypes', 'authMatrixTarget'], this.organizationId )
    ])
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
		.subscribe( ([matrices, allDropdownOptions]) => {
			this.authorizationMatrices = <AuthorizationMatrix[]>matrices;
      this.dropdownOptions = <{[key: string]: DropdownOption[]}>allDropdownOptions;
		}, (appropriateError: {msg: string, status: number}) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  /**
   * 
   * @param state 
   * @param index 
   * Tick checkbox to activate an organization. To remove an organization from system check off this checkbox.
   */
  onChange(state: any, index:number){
    this.isEditing = true;
    const updateObj = {isActive: state.checked};

    this.subsinks.sink = this.authorizationMatrixService.patchMatrix(this.authorizationMatrices[index].id || '', this.organizationId, updateObj)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (matrix: null) => {
      //successful patch returns null
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
