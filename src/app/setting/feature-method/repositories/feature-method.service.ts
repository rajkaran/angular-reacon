import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FeatureMethod } from 'src/app/core/models/feature-method.model';
import { CommunicateServerService } from 'src/app/core/rest/communicate-server.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureMethodService {

  constructor(private communicateServerService: CommunicateServerService) { }

  /**
   * 
   * @param organizationId 
   * Fetch all feature methods
   * @returns 
   */
	fetchAllFeatureMethod(organizationId: string): Observable<FeatureMethod[]>{
		let url = '/feature-methods/'+organizationId;
		return <any>this.communicateServerService.fetch(url);
	}

  /**
   * 
   * @param organizationId 
   * Fetch all feature methods as a customer either vendor, client and store
   * @returns 
   */
	fetchAllFeatureMethodAsCustomer(organizationId: string): Observable<FeatureMethod[]>{
    console.log('fetchAllFeatureMethodAsCustomer', organizationId)
		let url = '/feature-methods/customer/'+organizationId;
		return <any>this.communicateServerService.fetch(url);
	}

  /**
	 * 
	 * @param featureMethod 
	 * @param organizationId 
	 * create a new featureMethod
	 */
   createFeatureMethod(featureMethod: FeatureMethod, organizationId: string): Observable<FeatureMethod>{
    let url = '/feature-methods/'+organizationId;
    return <any>this.communicateServerService.store(url, featureMethod);
  }

  /**
  * 
  * @param id 
  * @param featureMethod 
  * @param organizationId
  * Update specific properties of a featureMethod 
  */
  patchFeatureMethod(id: string, featureMethod: FeatureMethod | {isActive: boolean}, organizationId: string): Observable<null>{
    let url = '/feature-methods/'+organizationId+'/'+id;
    return <any>this.communicateServerService.patch(url, featureMethod);
  }
}
