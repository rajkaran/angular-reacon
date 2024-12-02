import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpsertFeatureMethodComponent } from './upsert-feature-method/upsert-feature-method.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';



@NgModule({
  declarations: [
    UpsertFeatureMethodComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ]
})
export class FeatureMethodModule { }
