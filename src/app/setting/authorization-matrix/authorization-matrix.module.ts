import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListAuthorizationMatrixComponent } from './list-authorization-matrix/list-authorization-matrix.component';
import { UpsertAuthorizationMatrixComponent } from './upsert-authorization-matrix/upsert-authorization-matrix.component';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ListAuthorizationMatrixComponent,
    UpsertAuthorizationMatrixComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule
  ]
})
export class AuthorizationMatrixModule { }
