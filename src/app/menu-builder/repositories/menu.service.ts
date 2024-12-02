import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Menu } from 'src/app/core/models/menu.model';
import { CommunicateServerService } from 'src/app/core/rest/communicate-server.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private communicateServerService: CommunicateServerService) { }

  /**
   * 
   * @param organizationId 
   * Fetch all menu
   * @returns 
   */
	fetchMenu(organizationId: string): Observable<Menu[]>{
		let url = '/menu/'+organizationId;
		return <any>this.communicateServerService.fetch(url);
	}

  /**
	 * 
	 * @param menu 
	 * @param organizationId 
	 * create a new menu
	 */
   createMenu(menu: Menu, organizationId: string): Observable<Menu>{
    let url = '/menu/'+organizationId;
    return <any>this.communicateServerService.store(url, menu);
  }

  /**
  * 
  * @param id 
  * @param menu 
  * @param organizationId
  * Update specific properties of a menu 
  */
  patchMenu(id: string, menu: Menu | {isActive: boolean}, organizationId: string): Observable<null>{
    let url = '/menu/'+organizationId+'/'+id;
    return <any>this.communicateServerService.patch(url, menu);
  }


}
