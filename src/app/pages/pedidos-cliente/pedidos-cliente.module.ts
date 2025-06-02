import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PedidosClientePageRoutingModule } from './pedidos-cliente-routing.module';

import { PedidosClientePage } from './pedidos-cliente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PedidosClientePageRoutingModule
  ],
})
export class PedidosClientePageModule {}
