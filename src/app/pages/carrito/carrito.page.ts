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

  carrito = [
    { nombre: 'Martillo', descripcion: 'Martillo de acero', precio: 5990, cantidad: 1 },
    { nombre: 'Destornillador', descripcion: 'Philips mediano', precio: 2990, cantidad: 2 },
    { nombre: 'Serrucho', descripcion: 'Para madera', precio: 8490, cantidad: 1 }
  ];

  constructor() { }

  ngOnInit() {
  }

  calcularTotal(): number {
    return this.carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
  }

  finalizarCompra() {
    console.log('Compra finalizada:', this.carrito);
    // Aquí podrías limpiar el carrito o redirigir
  }
}
