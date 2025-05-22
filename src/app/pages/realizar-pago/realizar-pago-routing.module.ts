import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RealizarPagoPage } from './realizar-pago.page';

const routes: Routes = [
  {
    path: '',
    component: RealizarPagoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RealizarPagoPageRoutingModule {}
