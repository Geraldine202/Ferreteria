import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AprobarPedidoPage } from './aprobar-pedido.page';

const routes: Routes = [
  {
    path: '',
    component: AprobarPedidoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AprobarPedidoPageRoutingModule {}
