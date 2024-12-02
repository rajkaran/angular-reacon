import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleBasedGuard } from '../core/guards/role-based.guard';
import { ListOrganizationComponent } from './organization/list-organization/list-organization.component';
import { UpsertOrganizationComponent } from './organization/upsert-organization/upsert-organization.component';
import { ListUserComponent } from './user/list-user/list-user.component';
import { ResetPasswordComponent } from './user/reset-password/reset-password.component';
import { UpsertUserComponent } from './user/upsert-user/upsert-user.component';

const routes: Routes = [
  {
    path: 'list/:organizationId',
    component: ListOrganizationComponent,
    pathMatch: 'full',
    canActivate: [RoleBasedGuard],
    data: {resource: 'Organization', scopes: ['find']}
  },
  {
    path: 'upsert/:organizationId/:id',
    component: UpsertOrganizationComponent,
    pathMatch: 'full',
    canActivate: [RoleBasedGuard],
    data: {resource: 'Organization', scopes: ['create']}
  },
  {
    path: 'user/list/:organizationId',
    component: ListUserComponent,
    pathMatch: 'full',
    canActivate: [RoleBasedGuard],
    data: {resource: 'User', scopes: ['find']}
  },
  {
    path: 'user/upsert/:organizationId/:id',
    component: UpsertUserComponent,
    pathMatch: 'full',
    canActivate: [RoleBasedGuard],
    data: {resource: 'User', scopes: ['create']}
  },
  {
    path: 'user/password/:organizationId/:id',
    component: ResetPasswordComponent,
    pathMatch: 'full',
    canActivate: [RoleBasedGuard],
    data: {resource: 'User', scopes: ['updateById']}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountManagerRoutingModule { }
