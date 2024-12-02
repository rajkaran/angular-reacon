import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { SubSink } from 'subsink';

import { InteractMessageComponent } from '../../interact-message/interact-message.component';
import { AccessToken } from '../../models/user.model';
import { AuthenticationService } from '../repositories/authentication.service';
import { LocalStorageCacheService } from '../../services/local-storage-cache.service';
import { AuthorizationMatrixService } from 'src/app/setting/authorization-matrix/repositories/authorization-matrix.service';
import { OrganizationService } from 'src/app/account-manager/organization/repositories/organization.service';
import { InterpretServerErrorService } from '../../services/interpret-server-error.service';
import { Organization } from '../../models/organization.model';
import { AuthorizationMatrix } from '../../models/authorization-matrix.model';
import { UtilAuthenticationService } from '../services/util-authentication.service';

@Component({
  selector: 'wx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  accessToken: AccessToken;
  loginForm?: FormGroup;

  fieldType: string = 'password';
  submitted:boolean =  false;
  subsinks: SubSink = new SubSink();

  constructor( private authenticationService: AuthenticationService,
    private localStorageCacheService: LocalStorageCacheService,
    public snackBar: MatSnackBar, private router: Router,
    private organizationService: OrganizationService,
    private authorizationMatrixService: AuthorizationMatrixService,
    private interpretServerErrorService: InterpretServerErrorService,
    private utilAuthenticationService: UtilAuthenticationService,
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(){
    this.loginForm = new FormGroup({
      'email': new FormControl(null, Validators.required),
      'password': new FormControl(null, Validators.required)
    });
  }

  onSubmit(){
    this.submitted = true;

    if(this.loginForm?.valid){
      this.subsinks.sink = this.authenticationService.authenticateUser(this.loginForm.value)
      .pipe(
        concatMap( (token: AccessToken) => {
          this.accessToken = token;
          this.localStorageCacheService.setItem(this.accessToken, 'accessToken');
          return this.organizationService.fetchOrganizationById(token.organizationId);
        }),
        concatMap( (organization: Organization) => {
          this.localStorageCacheService.setItem(organization, 'userOrganization');
          
          if(organization.organizationType.includes('wx') == true){
            return this.authorizationMatrixService.fetchAllMatricesAsWX(this.accessToken.organizationId)
          }
          else{
            return this.authorizationMatrixService.fetchAllMatricesAsCustomer(this.accessToken.organizationId)
          }
      }),
        catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
      .subscribe( (authorizationMatrix: AuthorizationMatrix[]) => {
        this.localStorageCacheService.setItem(authorizationMatrix, 'authorizationMatrix');

        let redirectTo = '/';
        if(this.utilAuthenticationService.getRedirectUrl() != undefined){
          redirectTo = this.utilAuthenticationService.getRedirectUrl();
        } 
               
        this.router.navigate([redirectTo]);
      }, (appropriateError: {msg: string, status: number}) => {
        this.submitted = false;
        this.displayError(appropriateError.msg, appropriateError.status);
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

  // destroy all subscrition when user leaves the page.
  ngOnDestroy(){
    this.subsinks.unsubscribe();
  }

}
