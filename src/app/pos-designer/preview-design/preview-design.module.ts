import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListPosWindowComponent } from './list-pos-window/list-pos-window.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    ListPosWindowComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule
  ]
})
export class PreviewDesignModule { }
