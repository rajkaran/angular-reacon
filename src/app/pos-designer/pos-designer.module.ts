import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PosDesignerRoutingModule } from './pos-designer-routing.module';
import { KeyboardShortcutDirective } from './upsert-design/directives/keyboard-shortcut.directive';
import { UpsertDesignModule } from './upsert-design/upsert-design.module';
import { PreviewDesignModule } from './preview-design/preview-design.module';

@NgModule({
  declarations: [
    KeyboardShortcutDirective,
  ],
  imports: [
    CommonModule,
    PosDesignerRoutingModule,
    UpsertDesignModule,
    PreviewDesignModule
  ]
})
export class PosDesignerModule { }
