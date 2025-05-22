import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GenerarPedidoPage } from './generar-pedido.page';

const routes: Routes = [
  {
    path: '',
    component: GenerarPedidoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GenerarPedidoPageRoutingModule {}
