import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AprobarPagosPage } from './aprobar-pagos.page';

const routes: Routes = [
  {
    path: '',
    component: AprobarPagosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AprobarPagosPageRoutingModule {}
