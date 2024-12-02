import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { HeaderComponent } from './header/header.component';
import { PublicLayoutComponent } from './public-layout/public-layout.component';
import { SecureLayoutComponent } from './secure-layout/secure-layout.component';
import { DetectInactivityComponent } from './detect-inactivity/detect-inactivity.component';
import { MaterialModule } from '../material.module';
import { RouterModule } from '@angular/router';
import { EllipsePipe } from './pipes/ellipse.pipe';


@NgModule({
  declarations: [
    HeaderComponent,
    PublicLayoutComponent,
    SecureLayoutComponent,
    DetectInactivityComponent,
    EllipsePipe
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    MaterialModule,
    RouterModule
  ],
  exports: [
    EllipsePipe
  ]
})
export class SharedModule { }
