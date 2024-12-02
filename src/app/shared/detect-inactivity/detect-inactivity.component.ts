import { Component, NgZone, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { fromEvent, interval, merge, Observable, Subscription, throwError } from 'rxjs';
import { catchError, concatMap, skipWhile, switchMap, take, tap } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/core/authentication/repositories/authentication.service';
import { AccessToken } from 'src/app/core/models/user.model';
import { HelperService } from 'src/app/core/services/helper.service';
import { InterpretServerErrorService } from 'src/app/core/services/interpret-server-error.service';
import { LocalStorageCacheService } from 'src/app/core/services/local-storage-cache.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'wx-detect-inactivity',
  templateUrl: './detect-inactivity.component.html',
  styleUrls: ['./detect-inactivity.component.scss']
})
export class DetectInactivityComponent implements OnInit {
  @ViewChild('countingDownDialog') countingDownDialog: TemplateRef<any>;

  accessToken: AccessToken;
  countingDown: number;
  dialogRef: any;
  eventsMergedObservable: Observable<any>;
  inactivityObservable: Observable<any>;
  intervalSubscription: Subscription;
  onloadRefreshSubscription: Subscription;
  refreshingIn: number;
  
  countdownTime: number = 60;
  inactivityTime:  number = 540; // number of seconds of Inactivity before popup.
  inactivityTimerEvent: Array<any>[] = [];
  loginDatetime: {timestamp: Date};
  refreshTime: number = 55; // refresh token in every 55 minutes / 3300000 milliseconds
  subsinks: SubSink = new SubSink();

  constructor(
    private dialog: MatDialog, private router: Router,
    private localStorageCacheService: LocalStorageCacheService,
    private helperService: HelperService, private ngZone: NgZone,
    private authenticationService: AuthenticationService,
    private interpretServerErrorService: InterpretServerErrorService,
  ) { }

  ngOnInit(): void {
    this.accessToken = this.localStorageCacheService.getItem('accessToken');

    /**
     * previous configuration based on setTimeout wasn't efficient as it was trigger change detection.
     * To rpevent chnage detection we have taken activity detection outseide of Angular by following tutorial
     * https://medium.com/@pankumar.kumar29606/inactivity-timer-implementation-in-angular-and-rxjs-c84224c3a1b0
     * List all Events which we need to consider for Inactivity. These events will reset inactivity counter.
     */
    this.inactivityTimerEvent = [ 
        [document, 'click'], [document, 'keyup'], [document, 'mousemove']
    ];
    
    this.createObservableForTrackedEvents();
    this.setTokenRefreshTime();
  }

  /**
   * Create an observable for events, selected to detect activity. Create abn array of Rxjs fromEvent and then
   * merge it into a single observable. By default merge doesn't work for obervable array. ES6 has provided a
   * solution to it; by adding ... in front of array will make it a list of events. 
   * [fromEvent(document, 'click'), fromEvent(document, 'keyup')] to (fromEvent(document, 'click'), fromEvent(document, 'keyup'))
   */
  createObservableForTrackedEvents(){
    let trackedEventsObservableArray: Observable<any>[] = [];

    this.inactivityTimerEvent.forEach( eachEvent => {
      trackedEventsObservableArray.push( fromEvent(eachEvent[0], eachEvent[1]) )
    })

    this.eventsMergedObservable = merge(...trackedEventsObservableArray);

    this.createObservableHandler();
  }

  /**
   * Here we are handling major part detection and outside of Angular. Here we are using switchMap to unsubscribe
   * previous event while creating a new one and reset counter back to zero. Every second we will calculate if 
   * we need to show dialog box or close. We will use skipWhile function to prevent user logging out before
   * inactivity time expires.
   */
  createObservableHandler(){
    this.ngZone.runOutsideAngular( () => {

      this.inactivityObservable = this.eventsMergedObservable
      .pipe(
        switchMap( (ev) => interval(1000).pipe(take(this.inactivityTime)) ),
        tap(value => this.isItTimeToShowPopUp(value)),
        skipWhile( (counter: number) => counter != this.inactivityTime - 1 )
      )

      this.subscribeInactivityObservable();
    });
  }

  // Once count down expired close dialog box and logout user.
  subscribeInactivityObservable(){
    this.subsinks.sink = this.inactivityObservable
    .subscribe( (counter: number) => {
      this.dialog.closeAll();
      this.ngZone.run(() => this.router.navigate(['/logout']) );
    });
  }

  /**
   * 
   * @param value 
   * Open or close dialog box as timepasses.
   * We would show a dialog box before actually logging out a user. This will give user an opportunity
   * to reset timer. we have pre-decided countdownTime for which we will show dialog box. This count down
   * time is carved out of our inactivity time. If counter reset then close dialog box.
   */
  isItTimeToShowPopUp(value: number){
    if(value == (this.inactivityTime - this.countdownTime)){
      this.ngZone.run(() => this.showCountdown() );
    }
    else if(value == 0 && this.dialogRef){
      this.dialogRef.close();
    }
  }

  /* Open dialog box to show message and count down on screen once inactive timeout is about to expired.
   * First reset counting down the begin an interval to simulate count down.
   */
  showCountdown(){
    this.countingDown = this.countdownTime;
    this.dialogRef = this.dialog.open(this.countingDownDialog);
    this.onCountdownClose();

    this.intervalSubscription = interval(1000)
    .subscribe( (counter: number) => {
      this.countingDown--;
    });
  }

  // Tap onto dialog box close event. Everytime count down is interupted reset timeout and destroy interval.
  onCountdownClose(){
    this.subsinks.sink = this.dialogRef.afterClosed()
    .subscribe( (data: any) => {
      this.intervalSubscription.unsubscribe();
    });
  }

  /* When user refreshes the page refresh cycles will reset to 55 minutes.
   * Whereas actual TTL of token will be less than cycle. To prevent token
   * exipiring before cycle completes, we will adjust cycle time and refresh
   * token earlier.
   */
  setTokenRefreshTime(){
    let currentDatetime = new Date();
    let loginDatetime = new Date(this.accessToken.createDatetime);

    this.onloadRefreshSubscription = this.helperService.dateDiff(currentDatetime, loginDatetime, 'minutes')
    .pipe(
      concatMap( (diff: number) => {
        this.refreshingIn = this.refreshTime - diff;

        if(this.refreshingIn < 1){
          return this.authenticationService.replaceToken(this.accessToken.roles, this.accessToken.organizationId)
        }
        else{
          return interval(this.refreshingIn*60*1000)
          .pipe(
              concatMap( () => this.authenticationService.replaceToken(this.accessToken.roles, this.accessToken.organizationId) )
          )
        }
      }),
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (newToken: AccessToken) => {
      this.localStorageCacheService.setItem(newToken, 'accessToken');
      this.initRefreshTokenCycle();
    });
  }

  // Token is valid for one an hour so to be on safer side we will refresh token in every preset number of minutes.
  initRefreshTokenCycle(){
    // destroy onload refresh token observable.
    if(this.onloadRefreshSubscription){
      this.onloadRefreshSubscription.unsubscribe();
    }

    this.subsinks.sink = interval(this.refreshTime*60*1000)
    .pipe(
      concatMap( () => this.authenticationService.replaceToken(this.accessToken.roles, this.accessToken.organizationId) ),
      catchError( error => throwError(this.interpretServerErrorService.displayAppropriateError(error)) )
    )
    .subscribe( (newToken: AccessToken) => {
      this.localStorageCacheService.setItem(newToken, 'accessToken');
    });
  }

  // destroy all subscrition when user leaves the page.
  ngOnDestroy(){
    if(this.intervalSubscription) {
        this.intervalSubscription.unsubscribe();
    }

    if(this.onloadRefreshSubscription){
        this.onloadRefreshSubscription.unsubscribe();
    }

    this.subsinks.unsubscribe();
  }

}
