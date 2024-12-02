import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JwtBasedGuard } from './core/guards/jwt-based.guard';
import { RoleBasedGuard } from './core/guards/role-based.guard';
import { LoginComponent } from './core/authentication/login/login.component';
import { LogoutComponent } from './core/authentication/logout/logout.component';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { DetectInactivityComponent } from './shared/detect-inactivity/detect-inactivity.component';
import { PublicLayoutComponent } from './shared/public-layout/public-layout.component';
import { SecureLayoutComponent } from './shared/secure-layout/secure-layout.component';
import { VendorDashboardComponent } from './dashboard/vendor-dashboard/vendor-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DetectInactivityComponent,
    canActivate: [JwtBasedGuard],
    children: [{
      path: '',
      component: SecureLayoutComponent,
      children: [
        {
          path: '',
          component: VendorDashboardComponent,
          pathMatch: 'full',
          canActivate: [RoleBasedGuard],
          data: {resource: 'Dashboard', scopes: ['find']}
        },
        {
          path: 'setting',
          loadChildren: () => import('./setting/setting.module').then(m => m.SettingModule)
        },
        {
          path: 'organization',
          loadChildren: () => import('./account-manager/account-manager.module').then(m => m.AccountManagerModule)
        },
        {
          path: 'pos',
          loadChildren: () => import('./pos-designer/pos-designer.module').then(m => m.PosDesignerModule)
        },
        {
          path: 'menu',
          loadChildren: () => import('./menu-builder/menu-builder.module').then(m => m.MenuBuilderModule)
        }
      ]
    }]
  },
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent, pathMatch: 'full' },
      { path: 'logout', component: LogoutComponent, pathMatch: 'full', canActivate: [JwtBasedGuard] }
    ]
  },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
