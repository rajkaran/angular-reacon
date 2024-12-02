import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot, UrlTree } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { UtilAuthorizationMatrixService } from 'src/app/setting/authorization-matrix/services/util-authorization-matrix.service';
import { Matrix } from '../models/authorization-matrix.model';
import { AccessToken } from '../models/user.model';
import { LocalStorageCacheService } from '../services/local-storage-cache.service';

@Injectable({
  providedIn: 'root'
})
export class RoleBasedGuard implements CanActivate, CanActivateChild {

  constructor(
    private utilAuthorizationMatrixService: UtilAuthorizationMatrixService,
    private localStorageCacheService: LocalStorageCacheService
  ) { }
  
  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // this will be passed from the route config on the data property
    let targetOrganizationId = route.paramMap.get('organizationId');

    // Dashboard is an default landing page of any organization. which won't have oragnizationId param and it will always be for itself.
    if(targetOrganizationId == null && route.data.resource == 'Dashboard'){
      const accessToken: AccessToken = this.localStorageCacheService.getItem('accessToken')
      targetOrganizationId = accessToken.organizationId;
    }

    return forkJoin([
			this.utilAuthorizationMatrixService.roleVote(),
			this.utilAuthorizationMatrixService.organizationTypeVote(),
			this.utilAuthorizationMatrixService.targetVote(targetOrganizationId || '')
		])
    .pipe( 
			concatMap( ([roleTypeVote, organizationTypeVote, targetVote]) => {
        // console.log([targetOrganizationId, roleTypeVote, organizationTypeVote, targetVote, route.data.scopes, route.data.resource]);
				return this.utilAuthorizationMatrixService.getMatrixEntry(roleTypeVote, organizationTypeVote, targetVote, route.data.scopes, route.data.resource);
			}),
			map( (matrix: Matrix|undefined) => {
        // console.log('matched matrix ', matrix)
        return matrix != undefined 
      })
    );
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivateChild(route, state);
  }
  
}
