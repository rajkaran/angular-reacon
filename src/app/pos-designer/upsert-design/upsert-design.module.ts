import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { ToolbarComponent } from './toolbar/toolbar.component';
import { ContainerComponent } from './container/container.component';
import { CanvasComponent } from './canvas/canvas.component';
import { MaterialModule } from 'src/app/material.module';
import { SettingDialogComponent } from './setting-dialog/setting-dialog.component';
import { LoadingDialogComponent } from './loading-dialog/loading-dialog.component';
import { LayerComponent } from './layer/layer.component';
import { ScreenComponent } from './screen/screen.component';
import { MediaComponent } from './media/media.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    ToolbarComponent,
    ContainerComponent,
    CanvasComponent,
    SettingDialogComponent,
    LoadingDialogComponent,
    LayerComponent,
    ScreenComponent,
    MediaComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class UpsertDesignModule { }
