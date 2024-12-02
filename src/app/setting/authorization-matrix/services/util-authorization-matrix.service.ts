import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthorizationMatrix, Matrix } from 'src/app/core/models/authorization-matrix.model';
import { LocalStorageCacheService } from 'src/app/core/services/local-storage-cache.service';

@Injectable({
  providedIn: 'root'
})
export class UtilAuthorizationMatrixService {

  constructor(
    private localStorageCacheService: LocalStorageCacheService
  ) { }

  /**
   *
   * @param roles
   * Find largest roleassigned to user
   */
  roleVote(): Observable<string> {
		const accessToken = this.localStorageCacheService.getItem('accessToken');

    if (accessToken.roles.indexOf('admin') != -1) return of('admin');
    else return of('user');
  }

	/**
	 * 
	 * @param organizationType 
	 * find largest organizationType
	 */
	organizationTypeVote(): Observable<string>{
		const userOrganization = this.localStorageCacheService.getItem('userOrganization');

    if (userOrganization == null) {
      return of('');
    }

    return of(userOrganization.organizationType);
	}

	/**
	 * 
	 * @param organizationType 
	 * fnd relation between user's organization and target organization
	 */
	targetVote(targetOrganizationId: string): Observable<string>{
		const accessToken = this.localStorageCacheService.getItem('accessToken');

    if(accessToken.organizationId == targetOrganizationId) return of('itself');
    else return of('customer');
	}

  /**
   *
   * @param roleTypeVote
   * @param organizationTypeVote
   * @param targetVote
   * @param scopes
   * @param resource
   * If we query authorization matrix with given params should yield an entry. If not returns an empty array then
   * deny access to user.
   */
  getMatrixEntry(roleTypeVote: string, organizationTypeVote: string, targetVote: string, scopes: string[], resource: string): Observable<Matrix|undefined>{
		const authorizationMatrix: AuthorizationMatrix[] = this.localStorageCacheService.getItem('authorizationMatrix');

		for(let i = 0, length = authorizationMatrix.length; i < length; i++){
			
			if(authorizationMatrix[i].resource == resource){
        let intersection = authorizationMatrix[i].scopes.filter(x => scopes.includes(x));
        
        if(intersection.length > 0){
          let matrix: Matrix[] = authorizationMatrix[i].matrix;
          
          for(let j = 0, len = matrix.length; j < len; j++){
            if(matrix[j].roles.indexOf(roleTypeVote) != -1 && 
              matrix[j].targets.indexOf(targetVote) != -1 && 
              matrix[j].organizationTypes.indexOf(organizationTypeVote) != -1
            ){
              return of(matrix[j]);
            }
          }
          
        }
			}
		}

		return of(undefined);
	}



}
