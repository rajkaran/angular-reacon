import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SubSink } from 'subsink';

import { InteractMessageComponent } from '../../interact-message/interact-message.component';
import { AccessToken } from '../../models/user.model';
import { InterpretServerErrorService } from '../../services/interpret-server-error.service';
import { LocalStorageCacheService } from '../../services/local-storage-cache.service';
import { AuthenticationService } from '../repositories/authentication.service';

@Component({
  selector: 'wx-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit, OnDestroy {

  accessToken: AccessToken;
  userOrganizationType: string;

  subsinks: SubSink = new SubSink();

  constructor(
    private localStorageCacheService: LocalStorageCacheService,
    private authenticationService: AuthenticationService,
    private interpretServerErrorService: InterpretServerErrorService,
    public snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.accessToken = this.localStorageCacheService.getItem('accessToken');

    this.destroyTokenAndCache();
  }

  // logout user by destroying token and clear sessionStorage.
  destroyTokenAndCache(){
    this.subsinks.sink = this.authenticationService.destroyToken(this.accessToken.organizationId)
    .pipe(
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( () => {
      this.localStorageCacheService.clear();
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

  // destroy all subscrition when user leaves the page.
  ngOnDestroy(){
    this.subsinks.unsubscribe();
  }

}
