import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SecureLayoutService } from 'src/app/core/broadcasts/secure-layout.service';
import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { DropdownOption } from 'src/app/core/models/key-value-pair.model';
import { AccessToken, User } from 'src/app/core/models/user.model';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { LocalStorageCacheService } from 'src/app/core/services/local-storage-cache.service';
import { KeyValuePairService } from 'src/app/setting/key-value-pair/repositories/key-value-pair.service';
import { SubSink } from 'subsink';
import { UserService } from '../repositories/user.service';

@Component({
  selector: 'wx-list-user',
  templateUrl: './list-user.component.html',
  styleUrls: ['./list-user.component.scss']
})
export class ListUserComponent implements OnInit {

  accessToken: AccessToken;
  users: User[];
  organizationId: string;

  dropdownOptions: {[key: string]: DropdownOption[]} = {salutations: [], contactWays: [], contactTypes: [], phoneTypes: [], provinces: [], countries: [], entityState: []};
  entityState: FormControl = new FormControl('active', [Validators.required]);
  isEditing: boolean = false;
  limit: FormControl = new FormControl(20, [Validators.required, Validators.pattern(/^\d+$/)]);
  subsinks: SubSink = new SubSink();

  constructor(
    private userService: UserService,
    public snackBar: MatSnackBar, private route: ActivatedRoute,
    private interpretServerErrorService: InterpretServerErrorService,
    private keyValuePairService: KeyValuePairService,
    private localStorageCacheService: LocalStorageCacheService,
    private secureLayoutBroadcast: SecureLayoutService
  ) { }

  ngOnInit(): void {
    this.accessToken = this.localStorageCacheService.getItem('accessToken');
    
    this.secureLayoutBroadcast.emitPageTitleEvent('Users');

    this.tapChangesToRoute();
  }

  // This will allow user to load it's colleagues while on customer's user list
  tapChangesToRoute(){
    this.subsinks.sink = this.route.params.subscribe( (params: Params) => {
      this.organizationId = params['organizationId'];
      this.fetchAllDropDownOptions();
      this.fetchUsers();
    });
  }

  // fetch drop down options from keyValuePairs
  fetchAllDropDownOptions(){
    this.subsinks.sink = this.keyValuePairService.fetchDropdownOptions( ['entityState'], this.organizationId)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )       
    .subscribe( (allDropdownOptions: {[key: string]: DropdownOption[]}) => {
      this.dropdownOptions = allDropdownOptions;
    }, (appropriateError: {msg: string, status: number}) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  // fetch all users with selected state and associated to given organization.
  fetchUsers(){
    if(this.entityState.valid && this.limit.valid){
      this.subsinks.sink = this.userService.fetchAllUsers(this.organizationId, this.entityState.value, this.limit.value)
      .pipe(
        catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
      ) 
      .subscribe( (users: User[]) => {
        this.users = users;
      }, (appropriateError: {msg: string, status: number}) => {
        this.displayError(appropriateError.msg, appropriateError.status);
      });
    }
  }

  // Activate or deactivate user. Only Active users can log into application
  onChange(state: MatSlideToggleChange, index: number){
    this.isEditing = true;
    const updateObj: {isActive: boolean} = {isActive: state.checked};

    this.subsinks.sink = this.userService.patchUser(this.users[index].id, updateObj, this.organizationId)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (user: null) => {
      this.displayError(`Status updated for ${this.users[index].firstName} ${this.users[index].lastName}.`, 200);
    }, (appropriateError: {msg: string, status: number}) => {
      this.displayError(appropriateError.msg, appropriateError.status);
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
