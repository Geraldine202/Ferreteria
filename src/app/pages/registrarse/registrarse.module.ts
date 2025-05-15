import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrarsePageRoutingModule } from './registrarse-routing.module';

import { RegistrarsePage } from './registrarse.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrarsePageRoutingModule
  ],
})
export class RegistrarsePageModule {}
