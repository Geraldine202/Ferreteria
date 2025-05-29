import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carrito: { id_producto: number; cantidad: number }[] = [];
  private contadorSubject = new BehaviorSubject<number>(0);
  public contador$ = this.contadorSubject.asObservable();

  constructor() {
    this.actualizarContador();
  }

  private actualizarContador() {
    const total = this.carrito.reduce((sum, item) => sum + item.cantidad, 0);
    this.contadorSubject.next(total);
  }

  agregarAlCarrito(id_producto: number, cantidad: number = 1) {
    const existente = this.carrito.find(p => p.id_producto === id_producto);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.carrito.push({ id_producto, cantidad });
    }
    this.actualizarContador();
  }

  actualizarCarrito(nuevoCarrito: any[]) {
    this.carrito = nuevoCarrito;
    this.actualizarContador();
  }

  obtenerCarrito() {
    return [...this.carrito];
  }

  limpiarCarrito() {
    this.carrito = [];
    this.actualizarContador();
  }

  getCantidadTotal(): number {
    return this.carrito.reduce((total, item) => total + item.cantidad, 0);
  }
}