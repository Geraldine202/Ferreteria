import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-aprobar-pedido',
  templateUrl: './aprobar-pedido.page.html',
  styleUrls: ['./aprobar-pedido.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  standalone: true
})
export class AprobarPedidoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
