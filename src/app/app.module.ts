import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { SettingModule } from './setting/setting.module';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { AccountManagerModule } from './account-manager/account-manager.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PosDesignerModule } from './pos-designer/pos-designer.module';
import { MenuBuilderModule } from './menu-builder/menu-builder.module';
import { FileManagerModule } from './file-manager/file-manager.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    CoreModule,
    SharedModule,
    SettingModule,
    AccountManagerModule,
    DashboardModule,
    PosDesignerModule,
    MenuBuilderModule,
    FileManagerModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
