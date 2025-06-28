import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductosService } from 'src/app/service/productos.service';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { CarritoService } from 'src/app/service/carrito.service';
import { Subscription } from 'rxjs';

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
    'assets/images/1.jpg',
    'assets/images/2.jpg',
    'assets/images/3.jpg',
    'assets/images/4.jpg',
    'assets/images/5.jpg',
    'assets/images/6.jpg',
    'assets/images/7.jpg',
    'assets/images/8.jpg',
    'assets/images/9.jpg',
    'assets/images/10.jpg',
    'assets/images/11.jpg',
  ];
  imagenIndex: number = 0;
  dolar: number = 0;
  contadorCarrito = 0;
  contadorSubscription!: Subscription;
  productosDestacados: any[] = [];
  private carritoSubscription!: Subscription;
  productos = [
    { imgSrc: 'assets/images/relleno1.png', title: 'Producto 1', description: 'Descripción breve del producto.', priceCLP: 19990 },
    { imgSrc: 'assets/images/relleno1.png', title: 'Producto 2', description: 'Descripción breve del producto.', priceCLP: 29990 },
    { imgSrc: 'assets/images/relleno1.png', title: 'Producto 3', description: 'Descripción breve del producto.', priceCLP: 39990 },
    { imgSrc: 'assets/images/relleno1.png', title: 'Producto 4', description: 'Descripción breve del producto.', priceCLP: 49990 },
  ];

  productosVisibles = 3;
  productoIndex: number = 0;
  carrito: Array<{ producto: any, cantidad: number }> = [];
  constructor(
    private router: Router,
    private productosService: ProductosService,
    private http: HttpClient,
    private carritoService: CarritoService,
    private toastController: ToastController,
  ) {}


  ngOnInit() {
    this.cargarProductos();
    this.obtenerValorDolar();
    this.actualizarProductosVisibles();
    
    window.addEventListener('resize', () => this.actualizarProductosVisibles());
        this.carritoSubscription = this.carritoService.contador$.subscribe(
      cantidad => {
        this.contadorCarrito = cantidad;
        console.log('Contador actualizado:', cantidad); // Para depuración
      }
    );
  }
  slideOpts = {
  initialSlide: 0,
  speed: 400
};

 ngOnDestroy() {
    // Limpiar la suscripción al destruir el componente
    if (this.carritoSubscription) {
      this.carritoSubscription.unsubscribe();
    }
    window.removeEventListener('resize', () => this.actualizarProductosVisibles());
  }
  ngAfterViewInit() {
    setInterval(() => this.nextImage(), 2000);
  }

async cargarProductos() {
    try {
      this.producto = await this.productosService.obtenerProductos();
      // Filtramos los productos con id_categoria=3
      this.filtrarProductosPorCategoria();
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  }
  
  // Nueva función para filtrar productos por id_categoria=3
  filtrarProductosPorCategoria() {
    this.productosDestacados = this.producto.filter(prod => 
      prod.id_categoria === 3 // Filtro estricto por id_categoria=3
    );
    
    // Si no hay suficientes productos (menos de 3), podemos:
    // 1. Mostrar menos productos
    // 2. Completar con productos aleatorios (si lo prefieres, dime y lo implemento)
    console.log(`Productos con id_categoria=3:`, this.productosDestacados);
  }
    irAlCarrito() {
    this.router.navigate(['/carrito']);
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
    if (this.productosDestacados.length === 0) return [];
    
    const visibles = [];
    for (let i = 0; i < Math.min(this.productosVisibles, this.productosDestacados.length); i++) {
      const index = (this.productoIndex + i) % this.productosDestacados.length;
      const item = this.productosDestacados[index];
      const priceUSD = this.convertirAPrecioUSD(item.precio).toFixed(2);
      
      visibles.push({
        producto: item,
        priceDisplay: `${item.precio.toLocaleString('es-CL')} CLP (USD $${priceUSD})`,
        isCentral: i === Math.floor(this.productosVisibles / 2)
      });
    }
    return visibles;
  }

  moveSlider(direction: number) {
    if (this.productosDestacados.length === 0) return;
    
    const totalProductos = this.productosDestacados.length;
    this.productoIndex = (this.productoIndex + direction + totalProductos) % totalProductos;
  }

  nextImage() {
    this.imagenIndex = (this.imagenIndex + 1) % this.imagenes.length;
  }

  actualizarProductosVisibles() {
    const anchoPantalla = window.innerWidth;
    this.productosVisibles = anchoPantalla < 768 ? 1 : 3;
  }

agregarAlCarrito(prod: any) {
  console.log('DEBUG - Producto completo:', prod); // Verifica toda la estructura
  console.log('DEBUG - Stock value:', prod.stock); // Verifica específicamente el stock
  console.log('DEBUG - Tipo de stock:', typeof prod.stock); // Verifica si es number, string, etc.

  const id_producto = prod?.id_producto;
  const nombre = prod?.nombre || 'Producto';

  if (!id_producto) {
    console.error('ID de producto inválido:', prod);
    return;
  }

  // Conversión explícita a número por si acaso
  const stockActual = Number(prod.stock);
  
  if (stockActual > 0) {
    this.carritoService.agregarAlCarrito(prod.id_producto, 1, stockActual);
    this.presentToast(`${nombre} agregado al carrito`, 'success');
  } else {
    console.log('DEBUG - No hay stock, valor:', stockActual);
    this.presentToast(`Lo sentimos, ${nombre} no tiene stock disponible`, 'danger');
  }
}


async presentToast(mensaje: string, color: 'success' | 'danger' | 'warning') {
  console.log(`Intentando mostrar toast: ${mensaje}`); // Verifica que se llame esta función
  try {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000, // Aumenté la duración
      position: 'top', // Cambié a 'top' para mayor visibilidad
      color: color,
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  } catch (error) {
    console.error('Error mostrando toast:', error);
  }
}

}
