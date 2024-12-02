import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PosWindow, PosWindowSetting } from 'src/app/core/models/pos-window.model';
import { CommunicateServerService } from 'src/app/core/rest/communicate-server.service';

@Injectable({
  providedIn: 'root'
})
export class PosWindowService {

  constructor(private communicateServerService: CommunicateServerService) { }

  /**
	 * @param organizationId 
	 * fetch limited number of posWindows that comes under given organizationId and has given state.
	 */
	getAssociatedPosWindows(organizationId: string, entityState: string, limit: number): Observable<PosWindow[]>{
    let url = '/pos-windows/'+organizationId;
    url += '?state='+entityState+'&limit='+limit;
		return <any>this.communicateServerService.fetch(url);
  }

  /**
   * 
   * @param organizationId 
   * fetch details of an posWindow matching given id
   */
  fetchPosWindowById(id: string, organizationId: string): Observable<PosWindow>{
    let url = '/pos-windows/'+organizationId+'/'+id;
    return <any>this.communicateServerService.fetch(url);
  }

  /**
   * 
   * @param organizationId 
   * count overall pos enteries in database
   */
  countOverallEnteries(organizationId: string): Observable<{count: number}>{
    let url = '/pos-windows/count/'+organizationId;
    return <any>this.communicateServerService.fetch(url);
  }

  /**
   * 
   * @param organizationId 
   * check if given lias is unqie within given organization Id.
   */
   validateAlias(alias: string, organizationId: string): Observable<boolean>{
    let url = '/pos-windows/validate/'+organizationId+'/'+alias;
    return <any>this.communicateServerService.fetch(url);
  }

  /**
   * 
   * @param posWindow 
   * @param organizationId 
   * create a new posWindow
   * @returns 
   */
  createPosWindow(posWindow: PosWindow, organizationId: string): Observable<PosWindow>{
    let url = '/pos-windows/'+organizationId;
    return <any>this.communicateServerService.store(url, posWindow);
  }

  /**
   * 
   * @param id 
   * @param posWindow 
   * @param organizationId 
   * update certain fields for given posWindow.
   * @returns 
   */
  patchPosWindow(id: string, posWindow: PosWindow | PosWindowSetting | {isActive: boolean}, organizationId: string): Observable<null>{
    let url = '/pos-windows/'+organizationId+'/'+id;
    return <any>this.communicateServerService.patch(url, posWindow);
  }

}
