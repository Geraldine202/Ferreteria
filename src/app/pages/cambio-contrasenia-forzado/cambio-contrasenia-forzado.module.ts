import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CambioContraseniaForzadoPageRoutingModule } from './cambio-contrasenia-forzado-routing.module';

import { CambioContraseniaForzadoPage } from './cambio-contrasenia-forzado.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CambioContraseniaForzadoPageRoutingModule
  ],
})
export class CambioContraseniaForzadoPageModule {}
