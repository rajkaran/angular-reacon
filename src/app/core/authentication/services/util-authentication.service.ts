import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { UtilAuthorizationMatrixService } from 'src/app/setting/authorization-matrix/services/util-authorization-matrix.service';
import { Matrix } from '../../models/authorization-matrix.model';
import { AccessToken, DecodedToken } from '../../models/user.model';
import { LocalStorageCacheService } from '../../services/local-storage-cache.service';

@Injectable({
  providedIn: 'root'
})
export class UtilAuthenticationService {
  public redirectUrl: string;

  constructor(
    private localStorageCacheService: LocalStorageCacheService,
    private utilAuthorizationMatrixService: UtilAuthorizationMatrixService
  ) { }

  // set a variable to allow login component to redirect user to requested url.
  setRedirectUrl(actualUrl: string): void {
    this.redirectUrl = actualUrl;
  }

  // get url user first requested.
  getRedirectUrl(): string {
    return this.redirectUrl;
  }

  /**
   * Check if JWT is still valid and exist in session storage. Validity checked against TTL instead of checking 
   * against server which has been causing race condition between Token update and validation.
   * @returns 
   */
  isAuthenticated(): Observable<boolean>{
    return of(<AccessToken>this.localStorageCacheService.getItem('accessToken'))
    .pipe(
      concatMap( (accessToken: AccessToken) => {
        return (accessToken == null)? throwError('Token not found!'): this.decodeToken(accessToken.token);
      }),
      map( (decodedToken: DecodedToken) => {
        // get current unix timestamp in seconds
        const unixTimestamp = Math.floor(Date.now() / 1000);
        return unixTimestamp < decodedToken.exp;
      }),
      catchError( (error: any) => of(false) )
    );
  }

  /**
   * 
   * @param token 
   * This function decodes jwt token supplied by server. source code taken from 
   * https://stackblitz.com/edit/angular11-token-decode?file=src%2Fapp%2Futils%2Ftoken.ts
   * @returns 
   */
  decodeToken(token: string): Observable<DecodedToken>{
    if (!token) { return throwError('Not a valid token'); }

    const _decodeToken = (token: string) => {
      try {
        return JSON.parse(atob(token));
      } catch {
        return;
      }
    };

    const result = token
    .split('.')
    .map(token => _decodeToken(token))
    .reduce((acc, curr) => {
      if (!!curr) acc = { ...acc, ...curr };
      return acc;
    }, Object.create(null));

    return of(result);
  }

  /**
   * 
   * @param targetOrganizationId 
   * @param scopes 
   * @param resource 
   * A common method to evaluate authorization for logged in user to different assets.
   * @returns 
   */
  handleAuthorization(targetOrganizationId: string, scopes: string[], resource: string){
    return forkJoin([
			this.utilAuthorizationMatrixService.roleVote(),
			this.utilAuthorizationMatrixService.organizationTypeVote(),
			this.utilAuthorizationMatrixService.targetVote(targetOrganizationId || '')
		])
    .pipe( 
			concatMap( ([roleTypeVote, organizationTypeVote, targetVote]) => {
        // console.log([targetOrganizationId, roleTypeVote, organizationTypeVote, targetVote, route.data.scopes, route.data.resource]);
				return this.utilAuthorizationMatrixService.getMatrixEntry(roleTypeVote, organizationTypeVote, targetVote, scopes, resource);
			}),
			map( (matrix: Matrix|undefined) => {
        // console.log('matched matrix ', matrix)
        return matrix != undefined 
      })
    );
  }

}
