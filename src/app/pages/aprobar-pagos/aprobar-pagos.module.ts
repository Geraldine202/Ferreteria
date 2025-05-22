import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AprobarPagosPageRoutingModule } from './aprobar-pagos-routing.module';

import { AprobarPagosPage } from './aprobar-pagos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AprobarPagosPageRoutingModule
  ],
})
export class AprobarPagosPageModule {}
