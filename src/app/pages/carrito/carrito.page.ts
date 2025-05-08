import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true
})
export class CarritoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
