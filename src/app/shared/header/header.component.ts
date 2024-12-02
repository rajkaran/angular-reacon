import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { UtilAuthenticationService } from 'src/app/core/authentication/services/util-authentication.service';
import { EachLink, SidebarMatrix } from 'src/app/core/models/sidebar-matrix.model';
import { AccessToken } from 'src/app/core/models/user.model';
import { LocalStorageCacheService } from 'src/app/core/services/local-storage-cache.service';
import { UtilAuthorizationMatrixService } from 'src/app/setting/authorization-matrix/services/util-authorization-matrix.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'wx-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  accessToken: AccessToken;
  userOrganizationType: string;

  linkMatrix: SidebarMatrix[] = []
  subsinks: SubSink = new SubSink();

  constructor(
    private localStorageCacheService: LocalStorageCacheService,
    private utilAuthorizationMatrixService: UtilAuthorizationMatrixService
  ) { }

  ngOnInit(): void {
    this.accessToken = this.localStorageCacheService.getItem('accessToken');

    this.findUserOrganizationType();
  }

  // Remove all those links which are not accessible by currently logged in user
  trimSidebarByAccess(){
    for(let i = 0, len = this.linkMatrix.length; i < len; i++){
      this.linkMatrix[i].linkList = this.linkMatrix[i].linkList.filter( (link: EachLink) => {
        return (link.onlyAllowedTo.length == 0 || link.onlyAllowedTo.indexOf(this.userOrganizationType) > -1 )
      });
    }

    this.linkMatrix = this.linkMatrix.filter( (matrix: SidebarMatrix) => matrix.linkList.length > 0)
  }

  // Find out organizationType of the logged in user's organization.
  findUserOrganizationType(){
    this.subsinks.sink = forkJoin([
      this.utilAuthorizationMatrixService.organizationTypeVote(),
      this.createLinkMatrix()
    ]) 
    .subscribe( ([organizationTypeVote, flag]) => {
      this.userOrganizationType = organizationTypeVote;
      this.trimSidebarByAccess();
    });
  }

  createLinkMatrix(){
    this.linkMatrix = [
      { matIcon: "account_balance", displayText: "Accounts", linkList: [
        { matIcon: "business", routerLink: ['organization/list', this.accessToken.organizationId], displayText: "Vendors", onlyAllowedTo: ["wx"] },
        { matIcon: "business", routerLink: ['organization/list', this.accessToken.organizationId], displayText: "Clients", onlyAllowedTo: ["vendor"] },
        { matIcon: "business", routerLink: ['organization/list', this.accessToken.organizationId], displayText: "Stores", onlyAllowedTo: ["client"] },
        { matIcon: "people_alt", routerLink: ['organization/user/list', this.accessToken.organizationId], displayText: "Users", onlyAllowedTo: [] }
      ]},
      { matIcon: "settings", displayText: "Settings", linkList: [
        { matIcon: "view_module", routerLink: ['setting/keyValuePair/upsert', this.accessToken.organizationId], displayText: "System", onlyAllowedTo: ["wx"] },
        { matIcon: "grid_3x3", routerLink: ['setting/authorizationMatrix/list', this.accessToken.organizationId], displayText: "Matrices", onlyAllowedTo: ["wx"] },
        { matIcon: "wifi_channel", routerLink: ['setting/featureMethod/upsert', this.accessToken.organizationId], displayText: "POS Feature", onlyAllowedTo: ["wx"] }
      ]},
      { matIcon: "query_stats", displayText: "Reports", linkList: [
        { matIcon: "analytics", routerLink: [''], displayText: "Daily Sale", onlyAllowedTo: ["store"] }
      ]}
    ]

    return of(true);
  }

  ngOnDestroy(){
    this.subsinks.unsubscribe();
  }

}
