import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProductosService } from 'src/app/service/productos.service';

@Component({
  selector: 'app-bodega',
  templateUrl: './bodega.page.html',
  styleUrls: ['./bodega.page.scss'],
    imports: [IonicModule, CommonModule, ReactiveFormsModule],
    standalone: true
})
export class BodegaPage implements OnInit {

  constructor( private productosService: ProductosService) { }
  productos: any[] = [];
  async ngOnInit() {
     await this.cargarProductos();
  }
  async cargarProductos() {
    try {
      this.productos = await this.productosService.obtenerProductos();
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  }
    handleImageError(event: any, producto: any) {
    event.target.src = 'assets/images/relleno1.png';
  }
}
