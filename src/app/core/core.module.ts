import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreRoutingModule } from './core-routing.module';
import { InteractMessageComponent } from './interact-message/interact-message.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AuthenticationModule } from './authentication/authentication.module';


@NgModule({
  declarations: [
    InteractMessageComponent,
    NotFoundComponent
  ],
  imports: [
    CommonModule,
    CoreRoutingModule,
    AuthenticationModule
  ]
})
export class CoreModule { }
