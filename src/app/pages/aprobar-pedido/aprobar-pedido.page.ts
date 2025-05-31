import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UsuariosService } from 'src/app/service/usuarios.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { CarritoService } from 'src/app/service/carrito.service';

interface BackendError {
  error?: string;
  message?: string;
  success?: boolean;
}

interface Pago {
  ID_PAGO: number;
  MONTO_TOTAL: number;
  FECHA_PAGO: string;
  ID_TIPO_PAGO: number;  // 1: Crédito, 2: Transferencia, 3: Débito
  RUT_USUARIO?: string;
  IMAGEN?: string;
}

interface DetalleProducto {
  ID_PRODUCTO: number;
  NOMBRE: string;
  CANTIDAD?: number;
  PRECIO_UNITARIO?: number;
  imagen?: string;
  SUBTOTAL?: number; // Añade esta línea
}
interface PedidoCompleto {
  pedido: {
    ID_PEDIDO: number;
    DESCRIPCION: string;
    TOTAL_A_PAGAR: number;
    CANTIDAD: number;
    FECHA_PEDIDO: string;
    [key: string]: any;
  };
  detalles: DetalleProducto[];
  pago?: Pago;
}

interface Pedido {
  id_pedido: number;
  id_estado_pedido: number;
  total_pedido: number;
  fecha_pedido: string | Date;
  nombre_cliente?: string;
  CANTIDAD?: number;
  [key: string]: any;
}

interface PedidoDetalle {
  descripcion: string;
  detalles: DetalleProducto[];
  pago?: {
    ID_PAGO: number;
    MONTO_TOTAL: number;
    FECHA_PAGO: string;
    TIPO_PAGO: string;
  };
  pedido: any;
}

@Component({
  selector: 'app-aprobar-pedido',
  templateUrl: './aprobar-pedido.page.html',
  styleUrls: ['./aprobar-pedido.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  standalone: true
})
export class AprobarPedidoPage implements OnInit {
  pedidosPagados: Pedido[] = [];
  pedidosEnPreparacion: Pedido[] = [];
  cargando = false;
  pedidoDetalle: PedidoDetalle | null = null;
  detalleVisible: number | null = null;
  pedidoSeleccionado: any = null;

  constructor(
    private usuariosService: UsuariosService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private carritoService: CarritoService
  ) {}

  getCantidadProducto(idProducto: number): number {
    if (!this.pedidoDetalle || !this.pedidoDetalle.detalles) return 1;
    
    const itemCarrito = this.carritoService.obtenerCarrito()
      .find(item => item.id_producto === idProducto);
    
    if (!itemCarrito) {
      const detallePedido = this.pedidoDetalle.detalles
        .find(d => d.ID_PRODUCTO === idProducto);
      return detallePedido?.CANTIDAD || 1;
    }
    
    return itemCarrito.cantidad;
  }
getTipoPago(idTipoPago: number): string {
  switch(idTipoPago) {
    case 1: return 'Crédito';
    case 2: return 'Transferencia';
    case 3: return 'Débito';
    default: return 'Desconocido';
  }
}
verDetallePedido(id: number) {
  this.usuariosService.obtenerPedidoCompleto(id).subscribe({
    next: (data: any) => {
      const cantidadTotal = data.pedido?.CANTIDAD || 1;
      const numProductos = data.detalles?.length || 1;
      const cantidadPorProducto = Math.floor(cantidadTotal / numProductos);
      const precioUnitario = data.pedido?.TOTAL_A_PAGAR / cantidadTotal || 0;
      
      const detallesConCantidad = data.detalles?.map((detalle: any) => ({
        ...detalle,
        CANTIDAD: cantidadPorProducto,
        PRECIO_UNITARIO: detalle.PRECIO_UNITARIO || precioUnitario,
        SUBTOTAL: cantidadPorProducto * (detalle.PRECIO_UNITARIO || precioUnitario)
      })) || [];
      
      this.pedidoDetalle = {
        descripcion: data.pedido?.DESCRIPCION || 'Sin descripción',
        detalles: detallesConCantidad,
        pago: data.pago ? {
          ID_PAGO: data.pago.ID_PAGO,
          MONTO_TOTAL: data.pago.MONTO_TOTAL,
          FECHA_PAGO: data.pago.FECHA_PAGO,
          TIPO_PAGO: this.getTipoPago(data.pago.ID_TIPO_PAGO)
        } : undefined,
        pedido: data.pedido
      };
    },
    error: (err: HttpErrorResponse) => {
      console.error('Error al obtener detalle pedido:', err);
      this.mostrarToast('Error al cargar detalles del pedido', 'danger');
    }
  });
}
getColorTipoPago(tipoPago: string): string {
  switch(tipoPago) {
    case 'Crédito': return 'tertiary';
    case 'Débito': return 'secondary';
    case 'Transferencia': return 'primary';
    default: return 'medium';
  }
}
marcarListoParaEntrega(idPedido: number) {
  this.usuariosService.actualizarPedidoAListoParaEntrega(idPedido).subscribe({
    next: () => {
      console.log(`Pedido ${idPedido} actualizado a listo para entrega.`);
      // Aquí puedes actualizar la lista si lo deseas:
     this.cargarPedidos();
       // o el método que uses para recargar
    },
    error: (err) => {
      console.error('Error al cambiar estado del pedido:', err);
    }
  });
}

  // Resto de métodos permanecen igual...
  toggleDetalle(idPedido: number) {
    if (this.detalleVisible === idPedido) {
      this.detalleVisible = null;
      this.pedidoDetalle = null;
    } else {
      this.detalleVisible = idPedido;
      this.verDetallePedido(idPedido);
    }
  }

  handleImageError(event: Event, producto: DetalleProducto) {
    const imgElement = event.target as HTMLImageElement;
    
    if (producto.imagen && producto.ID_PRODUCTO) {
      imgElement.src = 'http://localhost:8080/images/products/' + producto.ID_PRODUCTO + '.jpg';
      return;
    }
    
    imgElement.src = 'assets/images/default-product.jpg';
    imgElement.classList.add('image-error');
  }

  async ngOnInit() {
    await this.cargarPedidos();
  }

  async cargarPedidos() {
    this.cargando = true;
    const loading = await this.loadingCtrl.create({
      message: 'Cargando pedidos...'
    });
    await loading.present();

    try {
      const pagados = await this.usuariosService.obtenerPedidosPagados().toPromise() || [];
      this.pedidosPagados = pagados.filter(p => p.id_estado_pedido !== 2);
      this.pedidosEnPreparacion = await this.usuariosService.obtenerPedidosEstado2().toPromise() || [];
    } catch (error: unknown) {
      console.error('Error al cargar pedidos:', error);
      this.mostrarToast(this.getErrorMessage(error), 'danger');
    } finally {
      loading.dismiss();
      this.cargando = false;
    }
  }

  async iniciarPreparacion(pedido: Pedido) {
    const loading = await this.loadingCtrl.create({
      message: 'Actualizando estado del pedido...'
    });
    await loading.present();

    try {
      if (!pedido?.id_pedido) {
        throw new Error('ID de pedido no válido');
      }

      const resultado = await this.usuariosService
        .actualizarPedidoAEstadoPreparacion(pedido.id_pedido)
        .toPromise();

      if (resultado && resultado.success) {
        await this.mostrarToast('Pedido ahora está en preparación', 'success');
        this.pedidosPagados = this.pedidosPagados.filter(p => p.id_pedido !== pedido.id_pedido);
        pedido.id_estado_pedido = 2;
        this.pedidosEnPreparacion = [pedido, ...this.pedidosEnPreparacion];
      } else {
        throw new Error(resultado?.error || resultado?.message || 'Error al actualizar el estado');
      }
    } catch (error: unknown) {
      console.error('Error completo:', error);
      await this.mostrarToast(this.getErrorMessage(error), 'danger');
      await this.cargarPedidos();
    } finally {
      loading.dismiss();
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      if (error instanceof HttpErrorResponse) {
        const backendError = error.error as BackendError;
        return backendError.error || backendError.message || error.message;
      }
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (typeof error === 'object' && error !== null) {
      const err = error as BackendError;
      return err.error || err.message || 'Error desconocido';
    }
    return 'Error desconocido al procesar la solicitud';
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    toast.present();
  }
}