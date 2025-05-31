import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private carrito: { id_producto: number; cantidad: number }[] = [];

  // NUEVO: BehaviorSubject para emitir el carrito actualizado
  private carritoSubject = new BehaviorSubject<{ id_producto: number; cantidad: number }[]>([]);
  public carrito$ = this.carritoSubject.asObservable();

  private contadorSubject = new BehaviorSubject<number>(this.getCantidadTotal());
  public contador$ = this.contadorSubject.asObservable();

  constructor() {
    this.cargarCarritoDesdeStorage();
    this.emitirCarrito();
    this.actualizarContador();
  }

private cargarCarritoDesdeStorage() {
    const carrito = localStorage.getItem('carrito');
    if (carrito) {
      this.carrito = JSON.parse(carrito);
      this.actualizarContador();
    }
  }

  // Emitir carrito actualizado
  private emitirCarrito() {
    this.carritoSubject.next([...this.carrito]);
  }
  private actualizarContador() {
    const total = this.carrito.reduce((sum, item) => sum + item.cantidad, 0);
    this.contadorSubject.next(total);
  }

 agregarAlCarrito(id_producto: number, cantidad: number = 1) {
    if (id_producto === undefined || id_producto === null) {
      console.error('Intento de agregar producto con id_producto inválido:', id_producto);
      return;  // Evitamos agregar producto con id inválido
    }

    const existente = this.carrito.find(p => p.id_producto === id_producto);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.carrito.push({ id_producto, cantidad });
    }
    this.guardarCarritoEnLocalStorage();
    this.emitirCarrito();      // Emitir carrito actualizado
    this.actualizarContador();
  }

  actualizarCarrito(nuevoCarrito: { id_producto: number; cantidad: number }[]) {
    this.carrito = nuevoCarrito;
    this.guardarCarritoEnLocalStorage();
    this.emitirCarrito();      // Emitir carrito actualizado
    this.actualizarContador();
  }

  obtenerCarrito() {
    return [...this.carrito];
  }

  limpiarCarrito() {
    this.carrito = [];
    this.guardarCarritoEnLocalStorage();
    this.emitirCarrito();  
    this.actualizarContador();
  }

  getCantidadTotal(): number {
    return this.carrito.reduce((total, item) => total + item.cantidad, 0);
  }

    private guardarCarritoEnLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }
}