import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BodegaPageRoutingModule } from './bodega-routing.module';

import { BodegaPage } from './bodega.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BodegaPageRoutingModule
  ],
})
export class BodegaPageModule {}
