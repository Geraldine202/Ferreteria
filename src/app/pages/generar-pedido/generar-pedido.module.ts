import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GenerarPedidoPageRoutingModule } from './generar-pedido-routing.module';

import { GenerarPedidoPage } from './generar-pedido.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GenerarPedidoPageRoutingModule
  ],
})
export class GenerarPedidoPageModule {}
