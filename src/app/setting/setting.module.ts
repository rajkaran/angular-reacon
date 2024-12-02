import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingRoutingModule } from './setting-routing.module';
import { AuthorizationMatrixModule } from './authorization-matrix/authorization-matrix.module';
import { KeyValuePairModule } from './key-value-pair/key-value-pair.module';
import { FeatureMethodModule } from './feature-method/feature-method.module';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    SettingRoutingModule,
    AuthorizationMatrixModule,
    KeyValuePairModule,
    FeatureMethodModule
  ]
})
export class SettingModule { }
