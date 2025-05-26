import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContraseniaPage } from './contrasenia.page';

const routes: Routes = [
  {
    path: '',
    component: ContraseniaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContraseniaPageRoutingModule {}
