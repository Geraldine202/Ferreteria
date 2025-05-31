import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UsuariosService } from 'src/app/service/usuarios.service';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-aprobar-pagos',
  templateUrl: './aprobar-pagos.page.html',
  styleUrls: ['./aprobar-pagos.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  standalone: true
})
export class AprobarPagosPage implements OnInit {

  pagosPendientes: any[] = [];
  cargando: boolean = false;
  pagoSeleccionado: any = null;
  modalAbierto: boolean = false;

  constructor(
    private usuariosService: UsuariosService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }
  
  async ngOnInit() {
    await this.cargarPagosPendientes();
  }

  async cargarPagosPendientes() {
    this.cargando = true;
    const loading = await this.loadingController.create({
      message: 'Cargando pagos pendientes...',
    });
    await loading.present();

    this.usuariosService.obtenerPagosPendientes().subscribe({
      next: (pagos) => {
        this.pagosPendientes = pagos;
        loading.dismiss();
        this.cargando = false;
      },
      error: async (error) => {
        console.error('Error al obtener pagos pendientes:', error);
        loading.dismiss();
        this.cargando = false;
        this.mostrarToast('Error al cargar pagos pendientes');
      }
    });
  }

  verComprobante(pago: any) {
    this.pagoSeleccionado = pago;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.pagoSeleccionado = null;
  }

  descargarComprobante(url: string) {
    if (!url) {
      this.mostrarToast('No hay comprobante disponible');
      return;
    }
    
    // Crea un enlace temporal para descarga
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = `comprobante-pago-${this.pagoSeleccionado.id_pedido}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async aprobarPago(id_pedido: number) {
    const loading = await this.loadingController.create({
      message: 'Aprobando pago...',
    });
    await loading.present();

    this.usuariosService.actualizarEstadoPago(id_pedido, 2).subscribe({
      next: async () => {
        loading.dismiss();
        this.mostrarToast('Pago aprobado correctamente');
        await this.cargarPagosPendientes();
      },
      error: async (error) => {
        console.error('Error al aprobar pago:', error);
        loading.dismiss();
        this.mostrarToast('Error al aprobar el pago');
      }
    });
  }

  async rechazarPago(id_pedido: number) {
    const loading = await this.loadingController.create({
      message: 'Rechazando pago...',
    });
    await loading.present();

    this.usuariosService.actualizarEstadoPago(id_pedido, 3).subscribe({
      next: async () => {
        loading.dismiss();
        this.mostrarToast('Pago rechazado correctamente');
        await this.cargarPagosPendientes();
      },
      error: async (error) => {
        console.error('Error al rechazar pago:', error);
        loading.dismiss();
        this.mostrarToast('Error al rechazar el pago');
      }
    });
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}