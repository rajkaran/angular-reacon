import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UtilAuthenticationService } from '../authentication/services/util-authentication.service';

@Injectable({
  providedIn: 'root'
})
export class JwtBasedGuard implements CanActivate {
  constructor(private utilAuthenticationService: UtilAuthenticationService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot,state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let url: string = state.url;

    return this.utilAuthenticationService.isAuthenticated()
    .pipe(
      map( (isAuthenticated: boolean) => {
        if(isAuthenticated == true){
          return true;
        }

        if(url !== '/logout'){
          this.utilAuthenticationService.setRedirectUrl(url);
        }

        this.router.navigate(['login']);
        return false;
      })
    );
  }
  
}
