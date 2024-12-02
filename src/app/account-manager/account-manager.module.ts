import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountManagerRoutingModule } from './account-manager-routing.module';
import { OrganizationModule } from './organization/organization.module';
import { UserModule } from './user/user.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AccountManagerRoutingModule,
    OrganizationModule,
    UserModule
  ]
})
export class AccountManagerModule { }
