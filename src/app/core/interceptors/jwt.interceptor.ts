/* Based on https://medium.com/@ryanchenkie_40935/angular-authentication-using-the-http-client-and-http-interceptors-2f9d1540eb8
* To automatically attach authentication information to requests grab the JWT which is in local storage as the Authorization 
* header in any HTTP request that is sent.
*/

import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalStorageCacheService } from '../services/local-storage-cache.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(public localStorageCacheService: LocalStorageCacheService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let accessToken = this.localStorageCacheService.getItem('accessToken');

    if(accessToken && accessToken.token){
      request = request.clone({
        setHeaders: {
            Authorization: `Bearer ${accessToken.token}`
        }
      });
    }

    return next.handle(request);
  }
}
