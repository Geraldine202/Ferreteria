import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { catchError, finalize, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { UsuariosService } from 'src/app/service/usuarios.service';
import { CarritoService } from 'src/app/service/carrito.service';
import { ProductosService } from 'src/app/service/productos.service';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.page.html',
  styleUrls: ['./categoria.page.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true
})
export class CategoriaPage implements OnInit {
  categoria: string | null = null;
  productosFiltrados: any[] = [];
  isLoading = true;
  errorMessage = '';

  // Mapeo de nombres de categoría a id_categoria
  private categoriaMap: {[key: string]: string} = {
    'herramientas manuales': 'Herramientas Manuales',
    'equipos de seguridad': 'Equipos de seguridad',
    'materiales basicos': 'Materiales Basicos',
    'tornillos y anclajes': 'Tornillos y Anclajes',
    'fijaciones y adhesivos': 'Fijaciones y Adhesivos',
    'equipos de medicion': 'Equipos de Medicion'
  };

  constructor(
    private route: ActivatedRoute,
    private usuariosService: UsuariosService,
    private carritoService: CarritoService,
    private toastController: ToastController,
    private productosService: ProductosService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.categoria = params.get('nombre')?.replace(/-/g, ' ') ?? '';
      this.cargarProductosReales();
    });
  }

  cargarProductosReales() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.usuariosService.obtenerTodosLosProductos().pipe(
      map(productos => {
        return productos.map(p => ({
          ...p,
          categoriaNormalizada: p.id_categoria?.toLowerCase().trim()
        }));
      }),
      catchError(error => {
        console.error('Error al obtener productos:', error);
        this.errorMessage = 'Error al cargar los productos.';
        return throwError(() => error);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe((productos: any[]) => {
      this.filtrarProductosReales(productos);
    });
  }

  filtrarProductosReales(productos: any[]) {
    if (!this.categoria) {
      this.productosFiltrados = [];
      return;
    }

    const categoriaBuscada = this.categoria.toLowerCase().trim();
    const idCategoriaBuscada = this.categoriaMap[categoriaBuscada];

    this.productosFiltrados = productos.filter(producto => {
      return producto.id_categoria === idCategoriaBuscada || 
             producto.categoriaNormalizada === categoriaBuscada;
    });

    if (this.productosFiltrados.length === 0) {
      this.errorMessage = `No se encontraron productos en la categoría "${this.categoria}".`;
    }
  }

  async agregarAlCarrito(idProducto: number) {
    // Obtener el producto completo para mostrar en el toast
    const producto = this.productosFiltrados.find(p => p.id_producto === idProducto);
    
    if (producto) {
      // Agregar solo el ID al carrito
      this.carritoService.agregarAlCarrito(idProducto);
      
      const toast = await this.toastController.create({
        message: `${producto.nombre} agregado al carrito`,
        duration: 1500,
        position: 'bottom',
        color: 'success'
      });
      toast.present();
    } else {
      console.error('Producto no encontrado para ID:', idProducto);
    }
  }

  // Método para obtener los detalles del producto cuando se necesiten (para el carrito)
  obtenerDetallesProducto(idProducto: number): any | undefined {
    return this.productosFiltrados.find(p => p.id_producto === idProducto) || 
           this.productosService.obtenerProductoPorId(idProducto);
  }
}