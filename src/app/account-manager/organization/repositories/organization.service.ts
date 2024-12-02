import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Organization } from 'src/app/core/models/organization.model';
import { CommunicateServerService } from 'src/app/core/rest/communicate-server.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  constructor(private communicateServerService: CommunicateServerService) { }

  /**
	 * @param organizationId 
	 * fetch limited number of organizations that comes under given organizationId and has given state.
	 */
	getAssociatedOrganizations(organizationId: string, entityState: string, limit: number): Observable<Organization[]>{
    let url = '/organizations/'+organizationId;
    let httpParams = new HttpParams().set('state', entityState).set('limit', limit);
		return <any>this.communicateServerService.fetchWithParam(url, { params: httpParams });
  }

  /**
   * 
   * @param organizationId 
   * fetch details of an organization matching given id
   */
  fetchOrganizationById(organizationId: string): Observable<Organization>{
    let url = '/organizations/details/'+organizationId;
    return <any>this.communicateServerService.fetch(url);
  }

  /**
   * 
   * @param organization 
   * @param organizationId 
   * create a new organization
   * @returns 
   */
  createOrganization(organization: Organization, organizationId: string): Observable<Organization>{
    let url = '/organizations/'+organizationId;
    return <any>this.communicateServerService.store(url, organization);
  }

  /**
   * 
   * @param id 
   * @param organization 
   * @param organizationId 
   * update certain fields for given organization.
   * @returns 
   */
  patchOrganization(id: string, organization: Organization | {isActive: boolean}, organizationId: string): Observable<null>{
    let url = '/organizations/'+organizationId+'/'+id;
    return <any>this.communicateServerService.patch(url, organization);
  }

}
