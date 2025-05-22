import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RealizarPagoPageRoutingModule } from './realizar-pago-routing.module';

import { RealizarPagoPage } from './realizar-pago.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RealizarPagoPageRoutingModule
  ],
})
export class RealizarPagoPageModule {}
