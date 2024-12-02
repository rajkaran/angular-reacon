import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { concat, of, throwError } from 'rxjs';
import { catchError, concatMap, filter, tap } from 'rxjs/operators';
import { SecureLayoutService } from 'src/app/core/broadcasts/secure-layout.service';
import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { DropdownOption } from 'src/app/core/models/key-value-pair.model';
import { AccessToken, User } from 'src/app/core/models/user.model';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { LocalStorageCacheService } from 'src/app/core/services/local-storage-cache.service';
import { KeyValuePairService } from 'src/app/setting/key-value-pair/repositories/key-value-pair.service';
import { UserValidator } from 'src/app/shared/validators/user.validator';
import { SubSink } from 'subsink';
import { UserService } from '../repositories/user.service';

@Component({
  selector: 'wx-upsert-user',
  templateUrl: './upsert-user.component.html',
  styleUrls: ['./upsert-user.component.scss']
})
export class UpsertUserComponent implements OnInit {

  accessToken: AccessToken;
  id: string;
  user: User;
  organizationId: string;
  userForm: FormGroup;

  action: string = 'Create';
  dropdownOptions: {[key: string]: DropdownOption[]} = {roleTypes: []};
  emailPattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  fieldType: string = 'password';
  isSaving: boolean = false;
  passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,35}$/;
  subsinks: SubSink = new SubSink();

  constructor(
    private userService: UserService, private router: Router,
    public snackBar: MatSnackBar, private route: ActivatedRoute,
    private localStorageCacheService: LocalStorageCacheService,
    private interpretServerErrorService: InterpretServerErrorService,
    private keyValuePairService: KeyValuePairService,
    private secureLayoutBroadcast: SecureLayoutService
  ) { }

  ngOnInit(): void {
    this.organizationId = this.route.snapshot.paramMap.get("organizationId") || 'none';
    this.id = this.route.snapshot.paramMap.get("id") || 'none';
    this.accessToken = this.localStorageCacheService.getItem('accessToken');
		
		if(this.id != 'none'){
      this.fetchUserDetails();
      this.action = 'Edit';
    }

    this.secureLayoutBroadcast.emitPageTitleEvent(this.action+' User');

		this.initUserForm();
    this.fetchAllDropDownOptions();
  }

  // initialize user form with validation on email and password fields. Form can only be submitted if confirmPassword matches password.
  initUserForm(): void{

    this.userForm = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        email: new FormControl('', {validators: [Validators.required,
            Validators.pattern(this.emailPattern)], updateOn: 'blur'}
        ),
        password: new FormControl('', [ Validators.required, Validators.pattern(this.passwordPattern) ]),
        confirmPassword: new FormControl('', Validators.required),
        isActive: new FormControl(true, Validators.required),
        organizationId: new FormControl(this.organizationId),
        roles: new FormControl(['user']),
        roleInputBox: new FormControl('user'),
        createDatetime: new FormControl(new Date(), Validators.required),
    }, UserValidator.mustMatch('password', 'confirmPassword'));

    //tap change event on email to make sure entered email is unique
    this.onUserFormValueChanges();
  }

  // convenience getter for easy access to form fields
  get f() { return this.userForm.controls; }

  /* Server expects unique valid email. To make sure user has entered valid
   * email we verify email uniqueness with server on every focus out event.
   */
  onUserFormValueChanges(){
    const emailControl = this.userForm.get('email') as FormControl;

    this.subsinks.sink = emailControl.valueChanges
    .pipe(
      filter( (value: string) => emailControl.valid),
      concatMap( (value: string) => this.userService.validateEmail(value, this.organizationId)),
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe(res => {
      emailControl.setErrors(null);
    }, (appropriateError: {msg: string, status: number}) => {
      emailControl.setErrors({'email already taken': true});
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  // fetch drop down options from keyValuePairs
  fetchAllDropDownOptions(){
    this.subsinks.sink = this.keyValuePairService.fetchDropdownOptions(['roleTypes'], this.organizationId)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )       
    .subscribe( (allDropdownOptions: {[key: string]: DropdownOption[]}) => {
      this.dropdownOptions = allDropdownOptions;
    }, (appropriateError: {msg: string, status: number}) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  // fetch user details to autofill form
  fetchUserDetails(){
    this.subsinks.sink = this.userService.fetchUserById(this.id, this.organizationId)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    ) 
    .subscribe( (user: User) => {
      this.user = user;
      this.updateUserForm();
    }, (appropriateError: {msg: string, status: number}) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  /* update userForm with fetched user details. Password controls needs to
   * be disabled as server will not accept password field while editing user.
   */
  updateUserForm(){
    if(this.user){

			this.userForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        password: null,
        confirmPassword: null,
        isActive: this.user.isActive,
        organizationId: this.user.organizationId,
        roles: this.user.roles,
        roleInputBox: this.user.roles[0],
        createDatetime: this.user.createDatetime,
      });

      this.userForm.get('email')?.patchValue(this.user.email, { emitEvent: false });

      this.userForm.controls['password'].disable();
      this.userForm.controls['confirmPassword'].disable();
		}
  }

  // Submit changes made to user details.
  onSubmit(){
    if(this.userForm.valid){
      this.isSaving = true;

      this.userForm.get('roles')?.patchValue([this.userForm.value.roleInputBox], { emitEvent: false });

      delete this.userForm.value.confirmPassword;
      delete this.userForm.value.roleInputBox;

      const creatingUser = of(this.id).pipe(
          filter( () => this.id == 'none'),
          concatMap( () => this.userService.createUser(this.userForm.value, this.organizationId) )
      );

      const updatingUser = of(this.id).pipe(
          filter( () => this.id != 'none'),
          tap( () => delete this.userForm.value.password),
          concatMap( () => this.userService.patchUser(this.id, this.userForm.value, this.organizationId) )
      );

      this.subsinks.sink = concat(creatingUser, updatingUser)
      .pipe(
        catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
      )
      .subscribe( (user: User | null) => {
          this.router.navigate(['/organization/user/list/', this.organizationId]);
      }, (appropriateError: {msg: string, status: number}) => {
          this.displayError(appropriateError.msg, appropriateError.status);
          this.isSaving = false;
      });
    }
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
