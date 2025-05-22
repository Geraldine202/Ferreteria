import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-aprobar-pagos',
  templateUrl: './aprobar-pagos.page.html',
  styleUrls: ['./aprobar-pagos.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  standalone: true
})
export class AprobarPagosPage implements OnInit {

    pagos: any[] = [];
  private apiUrl = 'https://mi-api.com/api/pagos';

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }
  
  async ngOnInit() {
    this.pagos = [
    { id: 1, vendedor: 'Juan Pérez', monto: 25000, estado: 'pendiente' },
    { id: 2, vendedor: 'Ana Soto', monto: 18000, estado: 'pendiente' },
  ];
  this.filtrarPagos();
    await this.cargarPagos();
  }

  pago: any[] = [];
  pagosPendientes: any[] = [];

  //SÓLO PARA PRUEBAS GERAAA:)))))
  agregarPagoDePrueba() {
  const nuevoId = this.pagos.length + 1;
  const nuevoPago = {
    id: nuevoId,
    vendedor: 'Pago Test #' + nuevoId,
    monto: Math.floor(Math.random() * 50000) + 5000,
    estado: 'pendiente'
  };
  this.pagos.push(nuevoPago);
  this.filtrarPagos(); // actualiza la lista visible
  this.mostrarToast('Pago de prueba agregado');
}

  filtrarPagos() {
  this.pagosPendientes = this.pagos.filter(p => p.estado === 'pendiente');
}

  async cargarPagos() {
    const loading = await this.loadingController.create({
      message: 'Cargando pagos...',
    });
    await loading.present();

    this.http.get<any[]>(`${this.apiUrl}?estado=pendiente`).subscribe(
      async (data) => {
        this.pagos = data;
        await loading.dismiss();
      },
      async (error) => {
        console.error('Error al obtener pagos:', error);
        await loading.dismiss();
        this.mostrarToast('Error al cargar los pagos');
      }
    );
  }

 aprobar(id: number) {
  const index = this.pagos.findIndex(p => p.id === id);
  if (index !== -1) {
    this.pagos[index].estado = 'aprobado';
    this.mostrarToast('Pago aprobado');
    this.filtrarPagos();
  }
}

rechazar(id: number) {
  const index = this.pagos.findIndex(p => p.id === id);
  if (index !== -1) {
    this.pagos[index].estado = 'rechazado';
    this.mostrarToast('Pago rechazado');
    this.filtrarPagos();
  }
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