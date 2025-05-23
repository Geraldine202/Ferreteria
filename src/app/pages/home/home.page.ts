import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductosService } from 'src/app/service/productos.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
  ],
})
export class HomePage {
  producto: any[] = [];
  imagenes: string[] = [
    'assets/images/relleno1.png',
    'assets/images/relleno1.png',
    'assets/images/relleno1.png',
  ];
  imagenIndex: number = 0;
  dolar: number = 0;

  productos = [
    { imgSrc: 'assets/images/relleno1.png', title: 'Producto 1', description: 'Descripción breve del producto.', priceCLP: 19990 },
    { imgSrc: 'assets/images/relleno1.png', title: 'Producto 2', description: 'Descripción breve del producto.', priceCLP: 29990 },
    { imgSrc: 'assets/images/relleno1.png', title: 'Producto 3', description: 'Descripción breve del producto.', priceCLP: 39990 },
    { imgSrc: 'assets/images/relleno1.png', title: 'Producto 4', description: 'Descripción breve del producto.', priceCLP: 49990 },
  ];

  productosVisibles = 3;
  productoIndex: number = 0;

  constructor(
    private router: Router,
    private productosService: ProductosService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.obtenerValorDolar();
    this.actualizarProductosVisibles();
    window.addEventListener('resize', () => this.actualizarProductosVisibles());
  }

  ngAfterViewInit() {
    setInterval(() => this.nextImage(), 2000);
  }

  async cargarProductos() {
    try {
      this.producto = await this.productosService.obtenerProductos();
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  }

  obtenerValorDolar() {
    this.http.get<any>('https://mindicador.cl/api').subscribe({
      next: (data) => {
        this.dolar = data.dolar.valor;
      },
      error: (err) => {
        console.error('Error obteniendo dólar:', err);
      },
    });
  }

  convertirAPrecioUSD(precioCLP: number): number {
    return this.dolar ? precioCLP / this.dolar : 0;
  }

  getProductosVisibles() {
    const visibles = [];
    for (let i = 0; i < this.productosVisibles; i++) {
      const index = (this.productoIndex + i) % this.productos.length;
      const item = this.productos[index];
      const priceUSD = this.convertirAPrecioUSD(item.priceCLP).toFixed(2);
      visibles.push({
        producto: item,
        priceDisplay: `${item.priceCLP.toLocaleString('es-CL')} CLP (USD $${priceUSD})`,
        isCentral: i === 1
      });
    }
    return visibles;
  }

  nextImage() {
    this.imagenIndex = (this.imagenIndex + 1) % this.imagenes.length;
  }

  actualizarProductosVisibles() {
    const anchoPantalla = window.innerWidth;
    this.productosVisibles = anchoPantalla < 768 ? 1 : 3;
  }

  moveSlider(direction: number) {
    const totalProductos = this.productos.length;
    this.productoIndex = (this.productoIndex + direction + totalProductos) % totalProductos;
  }

  agregarAlCarrito(producto: any) {
    console.log('Producto agregado:', producto);
    // Aquí agregar la lógica real para agregar al carrito
  }
}
