import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-aprobar-pedido',
  templateUrl: './aprobar-pedido.page.html',
  styleUrls: ['./aprobar-pedido.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  standalone: true
})
export class AprobarPedidoPage implements OnInit {
  pedidos: any[] = [];
  pedidosPendientes: any[] = [];

  constructor(private toastCtrl: ToastController) { }

  ngOnInit() {
    this.pedidos = [
      { id: 1, cliente: 'Carlos Díaz', producto: 'Camisa', cantidad: 3, estado: 'pendiente' },
      { id: 2, cliente: 'Laura Ruiz', producto: 'Zapatos', cantidad: 1, estado: 'pendiente' },
    ];
    this.filtrarPedidos();
  }

  filtrarPedidos() {
    this.pedidosPendientes = this.pedidos.filter(p => p.estado === 'pendiente');
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  aprobar(id: number) {
    const index = this.pedidos.findIndex(p => p.id === id);
    if (index !== -1) {
      this.pedidos[index].estado = 'aprobado';
      this.mostrarToast('Pedido aprobado');
      this.filtrarPedidos();
    }
  }

  rechazar(id: number) {
    const index = this.pedidos.findIndex(p => p.id === id);
    if (index !== -1) {
      this.pedidos[index].estado = 'rechazado';
      this.mostrarToast('Pedido rechazado');
      this.filtrarPedidos();
    }
  }

  agregarPedidoDePrueba() {
    const nuevoId = this.pedidos.length + 1;
    this.pedidos.push({
      id: nuevoId,
      cliente: `Pedido Test #${nuevoId}`,
      producto: 'Producto Demo',
      cantidad: Math.floor(Math.random() * 10) + 1,
      estado: 'pendiente'
    });
    this.filtrarPedidos();
    this.mostrarToast('Pedido de prueba agregado');
  }

}