import { CommonModule } from '@angular/common';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { UsuariosService } from 'src/app/service/usuarios.service';

@Component({
  selector: 'app-generar-pedido',
  templateUrl: './generar-pedido.page.html',
  styleUrls: ['./generar-pedido.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true
})
export class GenerarPedidoPage implements OnInit {
  pedidosListos: any[] = [];
  
  // Mapeo de tipos de entrega
  tipoEntregaMap: { [key: number]: string } = {
    1: 'Retiro en tienda',
    2: 'Despacho a domicilio',
  };

  constructor(
    private UsuariosService: UsuariosService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    this.UsuariosService.obtenerPedidosEstado5().subscribe({
      next: (data) => {
        this.pedidosListos = data;
      },
      error: async (err) => {
        const alert = await this.alertController.create({
          header: 'Error',
          message: err.message,
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  recargarPedidos(event: any) {
    this.UsuariosService.obtenerPedidosEstado5().subscribe({
      next: (data) => {
        this.pedidosListos = data;
        event.target.complete();
      },
      error: async (err) => {
        event.target.complete();
        const alert = await this.alertController.create({
          header: 'Error al recargar',
          message: err.message,
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  // Método para determinar si mostrar botón de despachado
  mostrarDespachado(idEntrega: number): boolean {
    return idEntrega === 2; // Solo para despacho a domicilio
  }

  // Método para determinar si mostrar botón de entregado
  mostrarEntregado(idEntrega: number): boolean {
    return idEntrega === 1; // Para retiro en tienda y delivery
  }

  async actualizarDespachado(idPedido: number) {
    this.UsuariosService.actualizarPedidoADespachado(idPedido).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Pedido marcado como despachado.',
          buttons: ['OK']
        });
        await alert.present();
        this.cargarPedidos();
      },
      error: async () => {
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'No se pudo actualizar el pedido a despachado.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  async actualizarEntregado(idPedido: number) {
    this.UsuariosService.actualizarPedidoAEntregado(idPedido).subscribe({
      next: async () => {
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Pedido marcado como entregado.',
          buttons: ['OK']
        });
        await alert.present();
        this.cargarPedidos();
      },
      error: async () => {
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'No se pudo actualizar el pedido a entregado.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}