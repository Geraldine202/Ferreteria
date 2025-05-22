import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AprobarPedidoPageRoutingModule } from './aprobar-pedido-routing.module';

import { AprobarPedidoPage } from './aprobar-pedido.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AprobarPedidoPageRoutingModule
  ],
})
export class AprobarPedidoPageModule {}
