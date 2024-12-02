import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthorizationMatrix } from 'src/app/core/models/authorization-matrix.model';
import { CommunicateServerService } from 'src/app/core/rest/communicate-server.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationMatrixService {

  constructor(private communicateServerService: CommunicateServerService) { }

  /**
   * 
   * @param organizationId 
   * Fetch all authorization matrices as WX organization
   * @returns 
   */
	fetchAllMatricesAsWX(organizationId: string): Observable<AuthorizationMatrix[]>{
		let url = '/authorization-matrices/wx/'+organizationId;
		return <any>this.communicateServerService.fetch(url);
	}

  /**
   * 
   * @param organizationId 
   * Fetch all active authorization matrices as a customer
   * @returns 
   */
	fetchAllMatricesAsCustomer(organizationId: string): Observable<AuthorizationMatrix[]>{
		let url = '/authorization-matrices/customer/'+organizationId;
		return <any>this.communicateServerService.fetch(url);
	}

  /**
   * 
   * @param id 
   * @param organizationId 
   * Fetch a Matrix for given Id
   * @returns 
   */
	fetchMatrixById(id: string, organizationId: string): Observable<AuthorizationMatrix>{
		let url = '/authorization-matrices/'+organizationId+'/'+id;
		return <any>this.communicateServerService.fetch(url);
	}

  /**
	 * 
	 * @param organization 
	 * @param organizationId 
	 * create a new organization
	 */
	createMatrix(matrix: AuthorizationMatrix, organizationId: string): Observable<AuthorizationMatrix>{
		let url = '/authorization-matrices/'+organizationId;
		return <any>this.communicateServerService.store(url, matrix);
	}

	/**
	 * 
	 * @param id 
	 * @param matrix 
	 * Update or insert a given user
	 */
	patchMatrix(id: string, organizationId: string, matrix: any): Observable<null>{
		let url = '/authorization-matrices/'+organizationId+'/'+id;
		return <any>this.communicateServerService.patch(url, matrix);
	}


}
