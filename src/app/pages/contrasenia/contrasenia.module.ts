import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContraseniaPageRoutingModule } from './contrasenia-routing.module';

import { ContraseniaPage } from './contrasenia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContraseniaPageRoutingModule
  ],
})
export class ContraseniaPageModule {}
