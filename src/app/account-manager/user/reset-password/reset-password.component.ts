import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InteractMessageComponent } from 'src/app/core/interact-message/interact-message.component';
import { AccessToken, User } from 'src/app/core/models/user.model';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { LocalStorageCacheService } from 'src/app/core/services/local-storage-cache.service';
import { UserValidator } from 'src/app/shared/validators/user.validator';
import { SubSink } from 'subsink';
import { UserService } from '../repositories/user.service';

@Component({
  selector: 'wx-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  accessToken: AccessToken;
  id: string;
  user: User;
  organizationId: string;
  resetPasswordForm: FormGroup;

  fieldType: string = 'password';
  isSaving: boolean = false;
  passwordPattern = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,35}$/;
  subsinks: SubSink = new SubSink();

  constructor(
    private userService: UserService, private router: Router,
    public snackBar: MatSnackBar, private route: ActivatedRoute,
    private localStorageCacheService: LocalStorageCacheService,
    private interpretServerErrorService: InterpretServerErrorService
  ) { }

  ngOnInit(): void {
    this.organizationId = this.route.snapshot.paramMap.get("organizationId") || 'none';
    this.id = this.route.snapshot.paramMap.get("id") || 'none';
    this.accessToken = this.localStorageCacheService.getItem('accessToken');

    this.fetchUserDetails();
  }

  // initialize resetPasswordForm with validation on email and password fields. Form can only be submitted if confirmPassword matches password.
  initResetPasswordForm(): void{
    this.resetPasswordForm = new FormGroup({
        email: new FormControl('', {validators: [Validators.required,
            Validators.pattern(this.user.email)], updateOn: 'blur'}
        ),
        password: new FormControl('', [Validators.required, Validators.pattern(this.passwordPattern)]),
        confirmPassword: new FormControl('', Validators.required),
    }, UserValidator.mustMatch('password', 'confirmPassword'));
  }

  // convenience getter for easy access to form fields
  get f() { return this.resetPasswordForm.controls; }

  // fetch user details to autofill form
  fetchUserDetails(){
    this.subsinks.sink = this.userService.fetchUserById(this.id, this.organizationId)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    ) 
    .subscribe( (user: User) => {
      this.user = user;
      this.initResetPasswordForm();
    }, (appropriateError: {msg: string, status: number}) => {
      this.displayError(appropriateError.msg, appropriateError.status);
    });
  }

  // Submit new password to server with assoicated email. Delete confirmPassword from object as server isn't expecting it.
  onSubmit(){
    if (this.resetPasswordForm.valid) { 
      this.isSaving = true;

      delete this.resetPasswordForm.value.confirmPassword;

      this.subsinks.sink = this.userService.resetPasword(this.resetPasswordForm.value, this.organizationId)
      .pipe(
        catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
      )
      .subscribe( (user: null) => {
          /*successful patch returns null*/
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
