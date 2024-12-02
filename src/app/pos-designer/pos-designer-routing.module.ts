import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleBasedGuard } from '../core/guards/role-based.guard';
import { ListPosWindowComponent } from './preview-design/list-pos-window/list-pos-window.component';
import { ContainerComponent } from './upsert-design/container/container.component';

const routes: Routes = [
  {
    path: 'list/:organizationId',
    component: ListPosWindowComponent,
    pathMatch: 'full',
    canActivate: [RoleBasedGuard],
    data: {resource: 'PosWindow', scopes: ['find']}
  },
  {
    path: 'upsert/:organizationId/:id',
    component: ContainerComponent,
    pathMatch: 'full',
    canActivate: [RoleBasedGuard],
    data: {resource: 'PosWindow', scopes: ['create']}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PosDesignerRoutingModule { }
