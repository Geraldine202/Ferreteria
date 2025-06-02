import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PedidosClientePage } from './pedidos-cliente.page';

const routes: Routes = [
  {
    path: '',
    component: PedidosClientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PedidosClientePageRoutingModule {}
