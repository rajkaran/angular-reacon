import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccessToken } from '../../models/user.model';
import { CommunicateServerService } from '../../rest/communicate-server.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private communicateServerService: CommunicateServerService) { }

  /**
   * 
   * @param credentials 
   * Submit user provided credentails
   * @returns 
   */
  authenticateUser(credentials: Credential): Observable<any>{
    let url = '/users/login';
    return this.communicateServerService.store(url, credentials);
  }

  /**
   * 
   * @param organizationId 
   * ping server with current token to ensure it's still valid
   * @returns 
   */
  validateToken(organizationId: string){
    let url = '/access-tokens/valid/'+organizationId;
    return this.communicateServerService.fetch(url);
  }

  /**
   * 
   * @param roles 
   * @param organizationId 
   * Request server to generate new token for existing one to continue current session.
   * @returns 
   */
  replaceToken(roles: string[], organizationId: string): Observable<AccessToken>{
    let url = '/access-tokens/refresh/'+organizationId;
    return <any>this.communicateServerService.put(url, roles);
  }

  /**
   * 
   * @param organizationId 
   * To completely logout from system destroy token.
   * @returns 
   */
  destroyToken(organizationId: string){
    let url = '/access-tokens/'+organizationId;
    return this.communicateServerService.delete(url);
  }


}
