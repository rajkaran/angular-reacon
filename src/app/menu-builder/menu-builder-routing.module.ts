import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleBasedGuard } from '../core/guards/role-based.guard';
import { ListMenuComponent } from './list-menu/list-menu.component';
import { UpsertMenuComponent } from './upsert-menu/upsert-menu.component';

const routes: Routes = [
  {
    path: 'list/:organizationId',
    component: ListMenuComponent,
    pathMatch: 'full',
    canActivate: [RoleBasedGuard],
    data: {resource: 'Menu', scopes: ['find']}
  },
  {
    path: 'upsert/:organizationId/:id',
    component: UpsertMenuComponent,
    pathMatch: 'full',
    canActivate: [RoleBasedGuard],
    data: {resource: 'Menu', scopes: ['create']}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MenuBuilderRoutingModule { }
