import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.page.html',
  styleUrls: ['./categoria.page.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true
})
export class CategoriaPage implements OnInit {
  categoria: string | null = null;  // Permite que 'categoria' sea de tipo string o null
  productosFiltrados: any[] = [];

  private productos = [
    { nombre: 'Martillo', categoria: 'Herramientas Manuales', precio: 5000, descripcion: 'Martillo de acero forjado' },
    { nombre: 'Destornillador', categoria: 'Herramientas Manuales', precio: 2500, descripcion: 'Destornillador de precisión' },
    { nombre: 'Pintura blanca', categoria: 'Materiales Básicos', precio: 4000, descripcion: 'Pintura látex 1 galón' },
    { nombre: 'Casco de seguridad', categoria: 'Equipos de seguridad', precio: 9000, descripcion: 'Casco certificado ANSI' },
    { nombre: 'Tornillos para madera', categoria: 'Tornillos y Anclajes', precio: 1200, descripcion: 'Caja de 50 tornillos' },
    { nombre: 'Silicona selladora', categoria: 'Fijaciones y Adhesivos', precio: 1500, descripcion: 'Tubo de silicona multiuso' },
    { nombre: 'Equipos de Medición', categoria: 'Equipos de Medición', precio: 2000, descripcion: 'Equipo para mediciones precisas' }

  ];

  constructor(private route: ActivatedRoute) { }

ngOnInit() {
  this.route.paramMap.subscribe(params => {
    // Reemplazamos todos los guiones por espacios
    this.categoria = params.get('nombre')?.replace(/-/g, ' ') ?? '';  // Reemplaza todos los guiones por espacios
    console.log('Categoría recibida de la URL:', this.categoria);  // Verifica la categoría recibida
    this.filtrarProductos();
  });
}




filtrarProductos() {
  const categoriaFiltrada = this.categoria ?? '';  // Si 'this.categoria' es null, se asigna un string vacío
  console.log('Filtrando productos para la categoría:', categoriaFiltrada);

  this.productosFiltrados = this.productos.filter(
    producto => producto.categoria.toLowerCase() === categoriaFiltrada.toLowerCase()
  );
  
  console.log('Productos filtrados:', this.productosFiltrados);  // Verifica los productos filtrados

  if (this.productosFiltrados.length === 0) {
    console.warn('No se encontraron productos para esta categoría:', this.categoria);
  }
}





  agregarAlCarrito(producto: any) {
    console.log('Producto agregado al carrito:', producto);
    // Aquí en el futuro puedes usar un servicio para agregar al carrito real
  }
}
