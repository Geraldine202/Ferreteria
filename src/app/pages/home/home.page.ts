import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductosService } from 'src/app/service/productos.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor(private router: Router, private productosService: ProductosService) {}
  producto: any[] = [];
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
  ngOnInit() {
  this.cargarProductos()
  this.actualizarProductosVisibles();
  window.addEventListener('resize', () => this.actualizarProductosVisibles());
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
  
  async cargarProductos() {
    try {
      this.producto = await this.productosService.obtenerProductos();
    } catch (error) {
      console.error('Error cargando productos:', error);
      // Mostrar mensaje de error al usuario
    }
  }
  productosVisibles = 3; // Mostrar 3 productos a la vez
  productoIndex: number = 0; // Índice del carrusel de productos
  actualizarProductosVisibles() {
  const anchoPantalla = window.innerWidth;

  if (anchoPantalla < 768) {
    this.productosVisibles = 1; // En móviles o pantallas pequeñas
  } else {
    this.productosVisibles = 3; // En pantallas normales/escritorio
  }
}

  getProductosVisibles() {
    const visibles = [];
    for (let i = 0; i < this.productosVisibles; i++) {
      const index = (this.productoIndex + i) % this.productos.length;
      const isCentral = i === 1; // El producto del centro es el de índice 1 (en una lista de 3 elementos)
      visibles.push({ producto: this.productos[index], isCentral });
    }
    return visibles;
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
