import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/core/models/user.model';
import { CommunicateServerService } from 'src/app/core/rest/communicate-server.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private communicateServerService: CommunicateServerService) { }

  /**
	 * @param organizationId 
	 * fetch limited number of users that comes under given organizationId and has given state.
	 */
	fetchAllUsers(organizationId: string, entityState: string, limit: number): Observable<User[]>{
    let url = '/users/'+organizationId;
    url += '?state='+entityState+'&limit='+limit;
		return <any>this.communicateServerService.fetch(url);
  }

  /**
   * 
   * @param organizationId 
   * fetch details of an user matching given id
   */
  fetchUserById(id: string, organizationId: string): Observable<User>{
    let url = '/users/'+organizationId+'/'+id;
    return <any>this.communicateServerService.fetch(url);
  }

  /* Params:
   *      id string
   * Check whether provided email is valid and not taken.
   */
  validateEmail(email: string, organizationId: string): Observable<boolean>{
    let url = '/users/validate/'+organizationId+'/'+email;
    return <any>this.communicateServerService.fetch(url);
  }

  /**
   * 
   * @param user 
   * @param organizationId 
   * create a new User
   * @returns 
   */
   createUser(user: User, organizationId: string): Observable<User>{
    let url = '/users/'+organizationId;
    return <any>this.communicateServerService.store(url, user);
  }

  /**
   * 
   * @param id 
   * @param user 
   * @param organizationId 
   * update certain fields for given user.
   * @returns 
   */
  patchUser(id: string, user: User | {isActive: boolean}, organizationId: string): Observable<null>{
    let url = '/users/'+organizationId+'/'+id;
    return <any>this.communicateServerService.patch(url, user);
  }

  /**
   * 
   * @param credentials 
   * Reset password against email as it is unque and enough to identify user.
   */
   resetPasword(credentials: Credential, organizationId: string): Observable<null>{
    let url = '/users/reset/'+organizationId;
    return <any>this.communicateServerService.store(url, credentials);
  }


}
