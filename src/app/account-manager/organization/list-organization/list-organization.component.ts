import { Component, OnDestroy, OnInit } from '@angular/core';
import { SubSink } from 'subsink';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Organization } from 'src/app/core/models/organization.model';
import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { ActivatedRoute, Params } from '@angular/router';
import { OrganizationService } from '../repositories/organization.service';
import { catchError, concatMap } from 'rxjs/operators';
import { forkJoin, of, throwError } from 'rxjs';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { KeyValuePairService } from 'src/app/setting/key-value-pair/repositories/key-value-pair.service';
import { DropdownOption } from 'src/app/core/models/key-value-pair.model';
import { UtilKeyValuePairService } from 'src/app/setting/key-value-pair/services/util-key-value-pair.service';
import { FormControl, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { LocalStorageCacheService } from 'src/app/core/services/local-storage-cache.service';
import { UtilOrganizationService } from '../services/util-organization.service';
import { SecureLayoutService } from 'src/app/core/broadcasts/secure-layout.service';

@Component({
  selector: 'wx-list-organization',
  templateUrl: './list-organization.component.html',
  styleUrls: ['./list-organization.component.scss']
})
export class ListOrganizationComponent implements OnInit, OnDestroy {

  organizations: Organization[];
  organizationId: string;

  dropdownOptions: {[key: string]: DropdownOption[]} = {salutations: [], contactWays: [], contactTypes: [], phoneTypes: [], provinces: [], countries: [], entityState: []};
  entityState: FormControl = new FormControl('active', [Validators.required]);
  isEditing: boolean = false;
  limit: FormControl = new FormControl(20, [Validators.required, Validators.pattern(/^\d+$/)]);
  organizationType: string = '';
  userOrganizationType: string = '';
  subsinks: SubSink = new SubSink();

  constructor(
    private organizationService: OrganizationService,
    public snackBar: MatSnackBar, private route: ActivatedRoute,
    private interpretServerErrorService: InterpretServerErrorService,
    private keyValuePairService: KeyValuePairService,
    private utilKeyValuePairService: UtilKeyValuePairService,
    private localStorageCacheService: LocalStorageCacheService,
    private utilOrganizationService: UtilOrganizationService,
    private secureLayoutBroadcast: SecureLayoutService
  ) { }

  ngOnInit(): void {
    this.organizationId = this.route.snapshot.paramMap.get("organizationId") || 'none';

    this.tapChangesToRoute();
    this.fetchAllDropDownOptions();
  }

  // This will allow user to load it's colleagues while on customer's user list
  tapChangesToRoute(){
    this.subsinks.sink = this.route.params.subscribe( (params: Params) => {
      this.organizationId = params['organizationId'];

      this.determineOrganizationType();
      this.fetchOrganizations();
    });
  }

  // replace dropdown key with displayText shown in options
  // Note: It has been triggering multiple times. Find out why change detection triggers multiple times. expecially for hovering over buttons.
  findInDropDownOptions(dropDownName: string, key: string){
    return this.utilKeyValuePairService.findInDropDownOptions(this.dropdownOptions[dropDownName], key);
  }

  // determine organizationType when creating a new organization
  determineOrganizationType(){
    this.subsinks.sink = this.organizationService.fetchOrganizationById(this.organizationId)
    .pipe(
      concatMap( (cachedUserOrganization: Organization) => {
        return this.utilOrganizationService.determineTypeForNewOrganization(cachedUserOrganization);
      })
    )
    .subscribe( (organizationType: string) => {
      this.organizationType = organizationType;      
      this.secureLayoutBroadcast.emitPageTitleEvent(organizationType+'s');
    });
  }

  // fetch all organizations regardless of their status
  fetchOrganizations(){
    if(this.entityState.valid && this.limit.valid){
      this.subsinks.sink = this.organizationService.getAssociatedOrganizations(this.organizationId, this.entityState.value, this.limit.value)
      .pipe(
        catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
      ) 
      .subscribe( (organizations: Organization[]) => {
        this.organizations = organizations;
      }, (appropriateError: {msg: string, status: number}) => {
        this.displayError(appropriateError.msg, appropriateError.status);
      });
    }
  }

  // find organizationType of a logged in user
  loggedUserOrganizationType(){
    return of(this.localStorageCacheService.getItem('userOrganization'))
    .pipe(
      concatMap( (cachedUserOrganization: Organization) => {
        return this.utilOrganizationService.determineTypeForNewOrganization(cachedUserOrganization);
      })
    );
  }

  // fetch drop down options from keyValuePairs
  fetchAllDropDownOptions(){
    this.subsinks.sink = forkJoin([
      this.keyValuePairService.fetchDropdownOptions(
        ['salutations', 'contactWays', 'contactTypes', 'phoneTypes', 'provinces', 'countries', 'entityState'], this.organizationId
      ),
      this.loggedUserOrganizationType()
    ])
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )       
    .subscribe( ([allDropdownOptions, organizationType]) => {
      this.dropdownOptions = <{[key: string]: DropdownOption[]}>allDropdownOptions;
      this.userOrganizationType = <string>organizationType;
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

    this.subsinks.sink = this.organizationService.patchOrganization(this.organizations[index].id || '', updateObj, this.organizationId)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (organization: null) => {
        //successful patch returns null
        this.organizations.splice(index, 1);
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
