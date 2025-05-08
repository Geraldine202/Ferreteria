import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor(private router: Router) {}
  
  imagenes: string[] = [
    'assets/images/relleno1.png',
    'assets/images/relleno1.png',
    'assets/images/relleno1.png',
  ];

  imagenIndex: number = 0; // índice del carrusel de imágenes

  ngAfterViewInit() {
    setInterval(() => {
      this.nextImage();
    }, 2000);
  }

  nextImage() {
    this.imagenIndex = (this.imagenIndex + 1) % this.imagenes.length;
  }
  productos = [
    { imgSrc: 'assets/images/relleno1.png', title: 'Producto 1', description: 'Descripción breve del producto.', price: '$19.99' },
    { imgSrc: 'assets/images/relleno1.png', title: 'Producto 2', description: 'Descripción breve del producto.', price: '$29.99' },
    { imgSrc: 'assets/images/relleno1.png', title: 'Producto 3', description: 'Descripción breve del producto.', price: '$39.99' },
    { imgSrc: 'assets/images/relleno1.png', title: 'Producto 4', description: 'Descripción breve del producto.', price: '$49.99' },
    { imgSrc: 'assets/images/relleno1.png', title: 'Producto 5', description: 'Descripción breve del producto.', price: '$49.99' },
    { imgSrc: 'assets/images/relleno1.png', title: 'Producto 6', description: 'Descripción breve del producto.', price: '$49.99' },
    { imgSrc: 'assets/images/relleno1.png', title: 'Producto 7', description: 'Descripción breve del producto.', price: '$49.99' },
  ];
  
  mostrarSubcategorias = false;

  subcategorias = ['Herramientas Manuales', 'Materiales Básicos', 'Equipos de seguridad','Tornillos y Anclajes','Fijaciones y Adhesivos','Equipos de Medición'];
  
  seleccionarSubcategoria(nombre: string) {
    console.log('Seleccionaste:', nombre);
  }
  
  productosVisibles = 3; // Mostrar 3 productos a la vez
  productoIndex: number = 0; // Índice del carrusel de productos
  
  getProductosVisibles() {
    const visibles = [];
    for (let i = 0; i < this.productosVisibles; i++) {
      const index = (this.productoIndex + i) % this.productos.length;
      const isCentral = i === 1; // El producto del centro es el de índice 1 (en una lista de 3 elementos)
      visibles.push({ producto: this.productos[index], isCentral });
    }
    return visibles;
  }
  obtenerIcono(nombre: string): string {
    switch (nombre) {
      case 'Herramientas Manuales':
        return 'construct';
      case 'Materiales Básicos':
        return 'cube';
      case 'Equipos de seguridad':
        return 'shield-checkmark';
      case 'Tornillos y Anclajes':
        return 'hardware-chip'; // no hay uno específico, este es representativo
      case 'Fijaciones y Adhesivos':
        return 'git-merge'; // algo que represente unión
      case 'Equipos de Medición':
        return 'speedometer';
      default:
        return 'pricetag';
    }
  }
  irACategoria(nombre: string) {
    // Por ejemplo, redirige a /categoria/herramientas-manuales
    const ruta = nombre.toLowerCase().replace(/\s+/g, '-'); // reemplaza espacios por guiones
    this.router.navigate(['/categoria', ruta]);
  }  
  // Método para mover el carrusel
  moveSlider(direction: number) {
    const totalProductos = this.productos.length;
  
    // Desplaza el índice de los productos y se asegura de que se mantenga en un rango válido
    this.productoIndex = (this.productoIndex + direction + totalProductos) % totalProductos;
  }
  
  // Carrusel manual de productos

  agregarAlCarrito() {
    // Lógica para agregar el producto al carrito
    console.log('Producto agregado al carrito');
  }

}
