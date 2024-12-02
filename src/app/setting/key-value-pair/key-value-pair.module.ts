import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpsertKeyValuePairComponent } from './upsert-key-value-pair/upsert-key-value-pair.component';
import { MaterialModule } from 'src/app/material.module';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    UpsertKeyValuePairComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ]
})
export class KeyValuePairModule { }
