import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { ListOrganizationComponent } from './list-organization/list-organization.component';
import { UpsertOrganizationComponent } from './upsert-organization/upsert-organization.component';



@NgModule({
  declarations: [
    ListOrganizationComponent,
    UpsertOrganizationComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule
  ]
})
export class OrganizationModule { }
