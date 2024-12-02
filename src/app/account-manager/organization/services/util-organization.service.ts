import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Organization } from 'src/app/core/models/organization.model';

@Injectable({
  providedIn: 'root'
})
export class UtilOrganizationService {

  constructor() { }

  /**
   * 
   * @param userOrganization 
   * Whenever user is creating a new organization it is always be for a cutomer/lower level.
   * Every organization has it's organizationType associated with it. To determine what should be
   * the type of organization user is creating we will use user's organization. such as 
   * only WX user can create vendor
   * only Vendor can create client
   * only Client can create store
   * @returns 
   */
  determineTypeForNewOrganization(userOrganization: Organization): Observable<string>{
    let result: string = '';

    switch(userOrganization.organizationType){
      case 'wx':
        result = 'vendor';
        break;
      case 'vendor':
        result = 'client';
        break;
      default:
        result = 'store';
        break;
    }

    return of(result);
  }

}
