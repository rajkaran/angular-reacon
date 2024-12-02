import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuBuilderRoutingModule } from './menu-builder-routing.module';
import { UpsertMenuComponent } from './upsert-menu/upsert-menu.component';
import { ListMenuComponent } from './list-menu/list-menu.component';
import { MaterialModule } from '../material.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    UpsertMenuComponent,
    ListMenuComponent
  ],
  imports: [
    CommonModule,
    MenuBuilderRoutingModule,
    MaterialModule,
    ReactiveFormsModule
  ]
})
export class MenuBuilderModule { }
