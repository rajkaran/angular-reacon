import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleBasedGuard } from '../core/guards/role-based.guard';
import { ListAuthorizationMatrixComponent } from './authorization-matrix/list-authorization-matrix/list-authorization-matrix.component';
import { UpsertAuthorizationMatrixComponent } from './authorization-matrix/upsert-authorization-matrix/upsert-authorization-matrix.component';
import { UpsertFeatureMethodComponent } from './feature-method/upsert-feature-method/upsert-feature-method.component';
import { UpsertKeyValuePairComponent } from './key-value-pair/upsert-key-value-pair/upsert-key-value-pair.component';

const routes: Routes = [
  {
    path: 'authorizationMatrix/list/:organizationId',
    component: ListAuthorizationMatrixComponent,
    pathMatch: 'full',
    canActivate: [RoleBasedGuard],
    data: {resource: 'AuthorizationMatrix', scopes: ['findAsWX']}
  },
  {
    path: 'authorizationMatrix/upsert/:organizationId/:id',
    component: UpsertAuthorizationMatrixComponent,
    pathMatch: 'full',
    canActivate: [RoleBasedGuard],
    data: {resource: 'AuthorizationMatrix', scopes: ['create']}
  },
  {
    path: 'keyValuePair/upsert/:organizationId',
    component: UpsertKeyValuePairComponent,
    pathMatch: 'full',
    canActivate: [RoleBasedGuard],
    data: {resource: 'KeyValuePair', scopes: ['create']}
  },
  {
    path: 'featureMethod/upsert/:organizationId',
    component: UpsertFeatureMethodComponent,
    pathMatch: 'full',
    canActivate: [RoleBasedGuard],
    data: {resource: 'KeyValuePair', scopes: ['create']}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
