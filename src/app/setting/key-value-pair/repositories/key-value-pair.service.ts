import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DropdownOption, KeyValuePair } from 'src/app/core/models/key-value-pair.model';
import { CommunicateServerService } from 'src/app/core/rest/communicate-server.service';

@Injectable({
  providedIn: 'root'
})
export class KeyValuePairService {

  constructor(private communicateServerService: CommunicateServerService) { }

  /**
   * 
   * @param organizationId 
   * Fetch all pairs for an organization
   * @returns 
   */
	fetchAllPairs(organizationId: string): Observable<KeyValuePair[]>{
		let url = '/key-value-pairs/'+organizationId;
		return <any>this.communicateServerService.fetch(url);
	}

  /**
   * 
   * @param organizationId 
   * Fetch key-value pairs as a literally key-value pair that can be used in a drop down for options.
   * @returns 
   */
	fetchDropdownOptions(pairTypes: string[], organizationId: string): Observable<{[key: string]: DropdownOption[]}>{
		let url = '/key-value-pairs/global/'+organizationId;
		return <any>this.communicateServerService.store(url, pairTypes);
	}

  /**
	 * 
	 * @param pair 
	 * @param organizationId 
	 * create a new key-value pair
	 */
   createPair(pair: KeyValuePair, organizationId: string): Observable<KeyValuePair>{
    let url = '/key-value-pairs/'+organizationId;
    return <any>this.communicateServerService.store(url, pair);
  }

  /**
  * 
  * @param id 
  * @param pair 
  * @param organizationId
  * Update specific properties of a pair 
  */
  patchPair(id: string, pair: KeyValuePair | {isActive: boolean}, organizationId: string): Observable<null>{
    let url = '/key-value-pairs/'+organizationId+'/'+id;
    return <any>this.communicateServerService.patch(url, pair);
  }


}
