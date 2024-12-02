import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuItem } from 'src/app/core/models/menu.model';
import { CommunicateServerService } from 'src/app/core/rest/communicate-server.service';

@Injectable({
  providedIn: 'root'
})
export class MenuItemService {

  constructor(private communicateServerService: CommunicateServerService) { }

  /**
   * 
   * @param organizationId 
   * Fetch all menu item
   * @returns 
   */
	fetchMenuItem(organizationId: string): Observable<MenuItem[]>{
		let url = '/menu-items/'+organizationId;
		return <any>this.communicateServerService.fetch(url);
	}

  /**
   * 
   * @param organizationId 
   * @param id 
   * Fetch all menu item
   * @returns 
   */
	fetchMenuItemById(organizationId: string, id: string): Observable<MenuItem>{
		let url = '/menu-items/'+organizationId+'/'+id;
		return <any>this.communicateServerService.fetch(url);
	}

  /**
	 * 
	 * @param menuItem 
	 * @param organizationId 
	 * create a new menu item
	 */
  createMenuItem(menuItem: MenuItem, organizationId: string): Observable<MenuItem>{
    let url = '/menu-items/'+organizationId;
    return <any>this.communicateServerService.store(url, menuItem);
  }

  /**
  * 
  * @param id 
  * @param menuItem 
  * @param organizationId
  * Update specific properties of a menu item 
  */
  patchMenuItem(id: string, menuItem: MenuItem | {isActive: boolean}, organizationId: string): Observable<null>{
    let url = '/menu-items/'+organizationId+'/'+id;
    return <any>this.communicateServerService.patch(url, menuItem);
  }


}
