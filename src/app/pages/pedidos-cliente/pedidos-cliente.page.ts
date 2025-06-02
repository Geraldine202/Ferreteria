import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UsuariosService } from 'src/app/service/usuarios.service';
import { Subject, takeUntil } from 'rxjs';
import { CarritoService } from 'src/app/service/carrito.service';

@Component({
  selector: 'app-pedidos-cliente',
  templateUrl: './pedidos-cliente.page.html',
  styleUrls: ['./pedidos-cliente.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class PedidosClientePage implements OnInit, OnDestroy {

  pedidosUsuario: any[] = [];
  rutUsuario: string = '';
  loading = false;
  errorMessage = '';

  pedidoDetalle: any = null;  // <--- declarar la propiedad para el detalle

  private destroy$ = new Subject<void>();

  constructor(
    private carritoService: CarritoService,
    private usuarioService: UsuariosService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.usuarioService.getUsuarioActual()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (usuario) => {
          if (usuario && usuario.rut) {
            this.rutUsuario = usuario.rut;
            this.cargarPedidos(this.rutUsuario);
          } else {
            this.loading = false;
            this.errorMessage = 'No se encontró usuario válido.';
          }
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = 'Error al obtener el usuario actual.';
          console.error(err);
        }
      });
  }

  getCantidadProducto(idProducto: number): number {
    return this.carritoService.getCantidadPorProducto(idProducto);
  }

  // Función para mostrar el detalle agrupado
verDetallePedido(data: any) {
  if (!data || !data.detalles) {
    console.error('Datos de pedido inválidos:', data);
    return;
  }

  // Obtener la cantidad total del pedido
  const cantidadTotal = data.pedido?.CANTIDAD || 1;

  // Calcular cantidad por producto (distribución equitativa)
  const cantidadPorProducto = Math.round(cantidadTotal / data.detalles.length);

  // Preparar los detalles con las cantidades
  const detallesConCantidad = data.detalles.map((producto: any) => ({
    ...producto,
    CANTIDAD: cantidadPorProducto,
    PRECIO_UNITARIO: data.pago?.MONTO_TOTAL / cantidadTotal / data.detalles.length,
    SUBTOTAL: (data.pago?.MONTO_TOTAL / data.detalles.length)
  }));

  this.pedidoDetalle = {
    descripcion: data.pedido?.DESCRIPCION || 'Sin descripción',
    detalles: detallesConCantidad,
    pago: data.pago ? {
      ID_PAGO: data.pago.ID_PAGO,
      MONTO_TOTAL: data.pago.MONTO_TOTAL,
      FECHA_PAGO: data.pago.FECHA_PAGO,
      TIPO_PAGO: this.getTipoPagoTexto(data.pago.ID_TIPO_PAGO)
    } : undefined,
    pedido: data.pedido
  };

  console.log('Detalle procesado:', this.pedidoDetalle);
}

  getEstadoPedidoTexto(idEstado: number): string {
    const estados: { [key: number]: string } = {
      1: 'Pendiente',
      2: 'En Preparacion',
      3: 'Despachado',
      4: 'Entregado',
      5: 'Listo para Entrega',
    };
    return estados[idEstado] || 'Estado desconocido';
  }

  cargarPedidos(rut: string) {
    this.usuarioService.obtenerPedidoUsuario(rut)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pedidos) => {
          console.log('Pedidos recibidos:', pedidos); 
          this.pedidosUsuario = pedidos;
          this.loading = false;
          this.errorMessage = '';
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Error al cargar los pedidos.';
          console.error(error);
        }
      });
  }

  getTipoPagoTexto(idTipoPago: number): string {
    const tipos: { [key: number]: string } = {
      1: 'Tarjeta de Crédito',
      2: 'Transferencia Bancaria',
      3: 'Tarjeta de Débito'
    };
    return tipos[idTipoPago] || 'Otro método';
  }

  verComprobante(urlImagen: string) {
    window.open(urlImagen, '_blank');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
