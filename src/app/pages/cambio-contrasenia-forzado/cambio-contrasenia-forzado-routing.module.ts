import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CambioContraseniaForzadoPage } from './cambio-contrasenia-forzado.page';

const routes: Routes = [
  {
    path: '',
    component: CambioContraseniaForzadoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CambioContraseniaForzadoPageRoutingModule {}
