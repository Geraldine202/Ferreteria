import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { CarritoService } from 'src/app/service/carrito.service';
import { ProductosService } from 'src/app/service/productos.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import { UsuariosService } from 'src/app/service/usuarios.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { loadScript } from '@paypal/paypal-js';
import { TasaCambioService } from 'src/app/service/tasa-cambio.service';
@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  standalone: true
})
export class CarritoPage implements OnInit {
  carritoDetalles: any[] = [];
  pagoForm: FormGroup;
  boletaGenerada = false;
  datosBoleta: any;
  logoBase64: string = ''; // base64 del logo
  estado_pagos: any[] = [];
  estado_pedidos: any[] = [];
  entregas: any[] = [];
  tipo_pagos: any[] = [];
  sucursales: any[] = []; 
  direccionTemporal = '';
  sucursalSeleccionada: any = null;
  mostrarCampoImagen: boolean = false;
  mostrarSeleccionSucursal: boolean = false;
  imagenSeleccionadaBase64: string | null = null;
  comunas: any[] = []; 
  contadorCarrito: number = 0;
  mostrarPaypal: boolean = false;
  // Cambia estas propiedades en tu clase CarritoPage
  public tasaCambioUSD: number = 800; // Ahora es pública
  public tasaCambioCargada: boolean = false; // Ahora es pública
// PayPal
  paypalButtonId = 'paypal-button-container';
  paypalLoaded = false;
  paypal: any;

  // Tipos de pago (ajustados según tu BD)
  readonly TIPO_PAGO = {
    CREDITO: 1,      // Tarjeta de crédito (usará PayPal)
    TRANSFERENCIA: 2, // Transferencia bancaria
    DEBITO: 3        // Tarjeta de débito (usará PayPal)
  };

  private carritoSubscription!: Subscription;
  usuarioActual: any;
  errorUsuario: string = '';
  constructor(
    private alertController: AlertController,
    private tasaCambioService: TasaCambioService,
    private carritoService: CarritoService,
    private toastController: ToastController,
    private productosService: ProductosService,
    private router: Router,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private usuarioService: UsuariosService,
    private loadingController: LoadingController,
    private http: HttpClient
  ) {
    this.pagoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      rut: ['', [Validators.required, Validators.minLength(8)]],
      id_tipo_pago: [null, Validators.required],
      id_entrega: [null, Validators.required],
      direccion: [''],
      sucursal:[''],
      imagen: [null, this.validarImagen.bind(this)]
    });
  }

  async ngOnInit() {
    await this.cargarTasaCambio();

    await this.cargar_estado_pago();
    await this.cargar_estado_pedidos();
    await this.cargar_entregas();
    await this.cargarCarrito();
    await this.cargar_tipo_pago()
    await this.cargarSucursales();
    await this.cargarComuna();
     this.cargarUsuarioActual();
    this.convertirImagenABase64('assets/images/logo.png').then((base64) => {
      this.logoBase64 = base64;
    });
  this.carritoSubscription = this.carritoService.carrito$.subscribe(async (carrito) => {
    this.carritoDetalles = await Promise.all(
      carrito.map(async (item) => {
        if (!item.id_producto) {
          console.warn('Producto con ID inválido en carrito:', item);
          return null;
        }
        const producto = await this.productosService.obtenerProductoPorId(item.id_producto);
        return {
          ...producto,
          cantidad: item.cantidad,
          subtotal: producto.precio * item.cantidad
        };
      })
    );

  // Filtrar productos nulos
  this.carritoDetalles = this.carritoDetalles.filter(p => p !== null);
});
}
private async cargarTasaCambio(): Promise<void> {
  try {
    const tasa = await this.tasaCambioService.obtenerTasaCambio().toPromise();
    if (tasa && tasa > 0) {
      this.tasaCambioUSD = tasa;
      this.tasaCambioCargada = true;
      console.log('Tasa de cambio actualizada:', this.tasaCambioUSD);
    } else {
      console.warn('Tasa de cambio no válida, usando valor por defecto');
    }
  } catch (error: any) {
    console.error('Error al obtener tasa de cambio:', error);
    this.mostrarError('No se pudo obtener tasa de cambio actual. Usando valor por defecto.');
  }
}
async loadPaypalScript() {
  try {
    // Verificar cálculos antes de cargar PayPal
    if (!this.verificarCalculosPayPal()) {
      return;
    }

    await this.mostrarConversionCLPaUSD();
    
    this.paypal = await loadScript({ 
      clientId: 'AXmy5WnNg31KOQXQtSinN5ykZ5keW1KBArfltzWdf1XZNUbthfY6TuocsBXD7spmlWRYNV59QLQsgCCX',
      currency: 'USD',
      intent: 'capture' // Asegura el cobro inmediato
    });

    this.paypalLoaded = true;
    this.renderPaypalButton();
  } catch (error) {
    console.error('Error al cargar PayPal:', error);
    this.mostrarError(`Error PayPal: ${(error as Error).message || 'No se pudo cargar'}`);
  }
}

// Método de conversión mejorado
private convertirCLPaUSD(montoCLP: number): number {
  if (!this.tasaCambioCargada || this.tasaCambioUSD <= 0) {
    console.warn('Usando tasa de cambio por defecto (800)');
    return montoCLP / 800;
  }
  return montoCLP / this.tasaCambioUSD;
}


// Redondeo preciso a 2 decimales
private redondearADosDecimales(valor: number): number {
  return parseFloat(valor.toFixed(2));
}

private verificarCalculosPayPal(): boolean {
  // 1. Calcular valores en CLP
  const subtotalCLP = this.calcularSubtotal();
  const descuentoCLP = this.getDescuentoAplicado();
  const totalCLP = this.calcularTotal();

  // 2. Convertir a USD
  const subtotalUSD = this.redondearADosDecimales(this.convertirCLPaUSD(subtotalCLP));
  const descuentoUSD = this.redondearADosDecimales(this.convertirCLPaUSD(descuentoCLP));
  const totalUSD = this.redondearADosDecimales(this.convertirCLPaUSD(totalCLP));

  // 3. Calcular suma de items individualmente
  const itemsCalculados = this.carritoDetalles.map(item => {
    const precioUnitarioUSD = this.redondearADosDecimales(this.convertirCLPaUSD(item.precio));
    const subtotalItemUSD = this.redondearADosDecimales(precioUnitarioUSD * item.cantidad);
    return {
      nombre: item.nombre,
      unitAmount: precioUnitarioUSD,
      quantity: item.cantidad,
      subtotal: subtotalItemUSD
    };
  });

  const sumaItemsUSD = this.redondearADosDecimales(
    itemsCalculados.reduce((sum, item) => sum + item.subtotal, 0)
  );

  // 4. Validar diferencias
  const diferenciaSubtotal = Math.abs(sumaItemsUSD - subtotalUSD);
  const diferenciaTotal = Math.abs((subtotalUSD - descuentoUSD) - totalUSD);

  const esValido = diferenciaSubtotal < 0.01 && diferenciaTotal < 0.01;

  // 5. Log de depuración
  console.log('Validación PayPal:', {
    tasaCambio: this.tasaCambioUSD,
    subtotalCLP, subtotalUSD,
    descuentoCLP, descuentoUSD,
    totalCLP, totalUSD,
    itemsCalculados,
    sumaItemsUSD,
    diferenciaSubtotal,
    diferenciaTotal,
    esValido
  });

  if (!esValido) {
    const mensaje = `Error en cálculos:
      - Diferencia subtotal: $${diferenciaSubtotal.toFixed(2)}
      - Diferencia total: $${diferenciaTotal.toFixed(2)}
      Tasa de cambio: $1 = $${this.tasaCambioUSD} CLP`;
    console.error(mensaje);
    this.mostrarError('Error en cálculos. Por favor recargue la página.');
    return false;
  }

  return true;
}
renderPaypalButton() {
  if (!this.paypal || !this.verificarCalculosPayPal()) return;

  // Paso 1: Generar ítems con conversión y subtotal interno
  const itemsUSD = this.carritoDetalles.map(item => {
    const unitUSD = this.redondearADosDecimales(this.convertirCLPaUSD(item.precio));
    const quantity = item.cantidad;
    return {
      name: item.nombre.substring(0, 127),
      unit_amount: {
        value: unitUSD.toFixed(2),
        currency_code: 'USD'
      },
      quantity: quantity.toString(),
      sku: item.id_producto?.toString() || 'prod_' + Math.random().toString(36).substring(2, 9),
      _subtotal: this.redondearADosDecimales(unitUSD * quantity) // Redondeado también aquí
    };
  });

  // Paso 2: Calcular subtotal exacto basado en ítems
  const subtotalUSD = this.redondearADosDecimales(
    itemsUSD.reduce((acc, item) => acc + item._subtotal, 0)
  );

  // Paso 3: Calcular descuento y total, basados en USD ahora
  const cantidadTotal = this.obtenerCantidadTotal();
  const descuentoUSD = cantidadTotal > 4
    ? this.redondearADosDecimales(subtotalUSD * 0.1)
    : 0;

  const totalUSD = this.redondearADosDecimales(subtotalUSD - descuentoUSD);

  // Paso 4: Limpiar ítems (quitar _subtotal)
  const cleanItems = itemsUSD.map(({ _subtotal, ...item }) => item);

  // Paso 5: Renderizar botón de PayPal
  this.paypal.Buttons({
    createOrder: (data: any, actions: any) => {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: totalUSD.toFixed(2),
            currency_code: 'USD',
            breakdown: {
              item_total: {
                value: subtotalUSD.toFixed(2),
                currency_code: 'USD'
              },
              ...(descuentoUSD > 0 && {
                discount: {
                  value: descuentoUSD.toFixed(2),
                  currency_code: 'USD'
                }
              })
            }
          },
          items: cleanItems
        }]
      });
    },
    onApprove: async (data: any, actions: any) => {
      const loading = await this.mostrarLoading('Procesando pago...');
      try {
        const details = await actions.order.capture();
        await this.confirmarPago();
        await this.generarBoletaPDF();
        await this.mostrarExito('Pago completado con éxito');
        this.router.navigate(['/home']);
      } catch (error) {
        console.error('Error en pago PayPal:', error);
        this.mostrarError('Error al procesar el pago: ' + (error as Error).message);
      } finally {
        loading.dismiss();
      }
    },
    onError: (err: any) => {
      console.error('Error PayPal:', err);
      this.mostrarError('Error en PayPal: ' + (err.message || 'Intente nuevamente más tarde'));
    }
  }).render(`#${this.paypalButtonId}`);
}


// Método unificado de confirmarPago
async confirmarPago() {
  if (this.pagoForm.invalid) {
    const alert = await this.alertCtrl.create({
      header: 'Formulario Incompleto',
      message: 'Por favor, completa todos los campos correctamente.',
      buttons: ['Aceptar']
    });
    await alert.present();
    return;
  }

  const datosFormulario = this.pagoForm.value;
  const total = this.calcularTotal();
  const cantidadProductos = this.carritoDetalles.reduce((acc, item) => acc + item.cantidad, 0);
  const productosIds = this.carritoDetalles.map(item => item.id_producto);

  const esTransferencia = datosFormulario.id_tipo_pago === 2; 
  const id_estado_pago = esTransferencia ? 1 : 2;
  const idPedido = Date.now();  // Puedes usar otro método para generar ID único
  const idPago = Date.now() + 1; // Solo para que no coincida con idPedido

  const pedidoParaGuardar = {
    id_pedido: idPedido,
    descripcion: "Pedido realizado en la APP",
    total_a_pagar: total,
    cantidad: cantidadProductos,
    tiene_descuento: this.getDescuentoAplicado() > 0 ? 'S' : 'N',
    fecha_pedido: new Date().toISOString().split('T')[0],
    id_sucursal: this.sucursalSeleccionada?.id_sucursal || 1,
    id_estado_pago: id_estado_pago,
    id_estado_pedido: 1,
    id_entrega: datosFormulario.id_entrega,
    rut_usuario: datosFormulario.rut,
    id_pago: idPago,
    monto_total: total,
    fecha_pago: new Date().toISOString().split('T')[0],
    id_tipo_pago: datosFormulario.id_tipo_pago,
    imagen: datosFormulario.imagen || null,
    productos: productosIds
  };

  console.log("Guardando en BD:", pedidoParaGuardar);

  this.usuarioService.registrarPedidoCompleto(pedidoParaGuardar).subscribe({
    next: async (response) => {
      this.resetearFormulario();
      this.carritoService.limpiarCarrito();
      await this.mostrarExito('Pedido guardado con éxito');
      this.carritoService.limpiarCarrito();
      this.router.navigate(['/home']);
    },
    error: async (err) => {
      console.error('Error al guardar el pedido:', err);
      await this.mostrarError('No se pudo guardar el pedido. Intenta nuevamente.');
    }
  });
}
private async mostrarConversionCLPaUSD() {
  try {
    const subtotalCLP = this.calcularSubtotal();
    const descuentoCLP = this.getDescuentoAplicado();
    const totalCLP = this.calcularTotal();

    const subtotalUSD = this.redondearADosDecimales(this.convertirCLPaUSD(subtotalCLP));
    const descuentoUSD = this.redondearADosDecimales(this.convertirCLPaUSD(descuentoCLP));
    const totalUSD = this.redondearADosDecimales(this.convertirCLPaUSD(totalCLP));

    const mensaje = `Tasa de cambio actual: 1 USD = $${this.tasaCambioUSD.toLocaleString('es-CL')}CLP
        Subtotal:$${subtotalCLP.toLocaleString('es-CL')} CLP$${subtotalUSD.toFixed(2)} USD
        ${descuentoCLP > 0 ? `<p>Descuento: <strong>-$${descuentoCLP.toLocaleString('es-CL')} CLP</strong> ≈ <strong>-$${descuentoUSD.toFixed(2)} USD</strong></p>` : ''}
       Total a pagar: $${totalCLP.toLocaleString('es-CL')} CLP ≈ $${totalUSD.toFixed(2)} USD
          El pago se procesará en dólares estadounidenses (USD) a través de PayPal.
    `;

    const alert = await this.alertCtrl.create({
      header: 'Conversión a USD',
      message: mensaje,
      buttons: [
        {
          text: 'Entendido',
          role: 'cancel',
          cssClass: 'alert-button-confirm'
        }
      ]
    });

    await alert.present();
  } catch (error) {
    console.error('Error al mostrar conversión:', error);
  }
}

resetearFormulario() {
  // Resetear el formulario reactivo
  this.pagoForm.reset();
  
  // Resetear estados adicionales
  this.imagenSeleccionadaBase64 = null;
  this.selectedFile = null;
  this.mostrarPaypal = false;
  this.mostrarCampoImagen = false;
  this.mostrarSeleccionSucursal = false;
  this.mostrarCampoDireccion = false;
  this.paypalLoaded = false;
  
  // Limpiar el contenedor de PayPal
  const paypalContainer = document.getElementById(this.paypalButtonId);
  if (paypalContainer) {
    paypalContainer.innerHTML = '';
  }
  
  // Volver a cargar los datos del usuario (opcional)
  this.cargarUsuarioActual();
}
validarImagen(control: any) {
  if (this.pagoForm?.get('id_tipo_pago')?.value === 2 && !control.value) {
    return { required: true };
  }
  return null;
}
    ngOnDestroy() {
    // Evitar memory leaks
    this.carritoSubscription.unsubscribe();
  }
  irAComprar() {
  this.router.navigate(['/home']); // Ajusta la ruta según tu app
}

selectedFile: File | null = null;
onFileSelected(event: any) {
  const file: File = event.target.files[0];
  
  // Validaciones
  if (!file) return;
  
  // Validar tipo de archivo
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif'];
  if (!tiposPermitidos.includes(file.type)) {
    this.mostrarError('Solo se permiten imágenes JPEG, PNG o GIF');
    return;
  }
  
  // Validar tamaño (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    this.mostrarError('La imagen no debe exceder los 5MB');
    return;
  }
  
  this.selectedFile = file;
  
  // Convertir a base64 para previsualización
  const reader = new FileReader();
  reader.onload = () => {
    this.imagenSeleccionadaBase64 = reader.result as string;
    // Actualizar el formulario con el nombre del archivo
    this.pagoForm.patchValue({ imagen: file.name });
  };
  reader.readAsDataURL(file);
  
  console.log('Archivo seleccionado:', file.name);
}
async subirImagenYConfirmar(event: Event) {
  event.preventDefault(); // Prevenir el comportamiento por defecto del formulario
  this.pagoForm.markAllAsTouched();
    if (this.pagoForm.value.id_tipo_pago === 2 && !this.imagenSeleccionadaBase64) {
    await this.mostrarError('Debes subir el comprobante de transferencia');
    return;
  }
  // Validación adicional para imagen si es requerida
  if (this.mostrarCampoImagen && !this.selectedFile) {
    await this.mostrarError('Debes seleccionar un comprobante de transferencia');
    return;
  }


  try {
    // Si es transferencia, subir la imagen primero
    if (this.mostrarCampoImagen && this.selectedFile) {
      const uploadResponse = await this.usuarioService.subirImagen(this.selectedFile).toPromise();
      
      if (!uploadResponse || !uploadResponse.imagen) {
        throw new Error('No se recibió respuesta válida del servidor al subir la imagen');
      }
      
      this.pagoForm.patchValue({ imagen: uploadResponse.imagen });
    }


    // Proceder con el pago
    await this.confirmarPago();
    
  } catch (error) {
  console.error('Error en el proceso de pago:', error);
  let errorMessage = 'Ocurrió un error al procesar el pago';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  await this.mostrarError(errorMessage);
}
}
 cargarUsuarioActual() {
    this.usuarioService.getUsuarioActual().subscribe({
      next: usuario => {
        // Aquí llenas los campos del formulario con la info del usuario
        this.pagoForm.patchValue({
          nombre: usuario.nombre || '',  // Ajusta según la propiedad que tenga el nombre completo
          rut: usuario.rut || ''         // Ajusta según la propiedad que tenga el RUT
        });
      },
      error: err => {
        console.error('Error al obtener usuario:', err);
      }
    });
  }
async cargarSucursales() {
  const loading = await this.mostrarLoading('Cargando sucursales...');
  try {
    this.usuarioService.obtenerSucursal().subscribe({
      next: (data: any) => {
        this.sucursales = Array.isArray(data) ? data : []; // Asigna a this.comunas
        console.log('Sucursales cargadas:', this.sucursales); // Para depuración
        loading.dismiss();
      },
      error: async err => {
        console.error('Error al obtener Sucursales', err);
        loading.dismiss();
        await this.mostrarError('Error al cargar Sucursales');
      }
    });
  } catch (error) {
    loading.dismiss();
    await this.mostrarError('Error al cargar Sucursales');
  }
}
async cargarComuna() {
  const loading = await this.mostrarLoading('Cargando comunas...');
  try {
    this.usuarioService.obtenerComuna().subscribe({
      next: (data: any) => {
        this.comunas = Array.isArray(data) ? data : []; // Asigna a this.comunas
        console.log('Comunas cargadas:', this.comunas); // Para depuración
        loading.dismiss();
      },
      error: async err => {
        console.error('Error al obtener comunas', err);
        loading.dismiss();
        await this.mostrarError('Error al cargar comunas');
      }
    });
  } catch (error) {
    loading.dismiss();
    await this.mostrarError('Error al cargar comunas');
  }
}
private async mostrarError(mensaje: string): Promise<void> {
  const toast = await this.toastController.create({
    message: mensaje,
    duration: 3000,
    color: 'danger',
    position: 'top'
  });
  await toast.present();
}
private async mostrarLoading(mensaje: string): Promise<HTMLIonLoadingElement> {
  const loading = await this.loadingController.create({
    message: mensaje,
    spinner: 'crescent'
  });
  await loading.present();
  return loading;
}
private async mostrarExito(mensaje: string): Promise<void> {
  const toast = await this.toastController.create({
    message: mensaje,
    duration: 3000,
    color: 'success',
    position: 'top'
  });
  await toast.present();
}

private async cargarCarrito() {
  const carrito = this.carritoService.obtenerCarrito();

  this.carritoDetalles = await Promise.all(
    carrito.map(async (item) => {
      if (!item.id_producto) {
        console.warn('Producto con ID inválido en carrito:', item);
        return null;
      }
      const producto = await this.productosService.obtenerProductoPorId(item.id_producto);
      return {
        ...producto,
        cantidad: item.cantidad,
        subtotal: producto.precio * item.cantidad
      };
    })
  );

  // Filtrar productos nulos
  this.carritoDetalles = this.carritoDetalles.filter(p => p !== null);
}


async cambiarCantidad(index: number, event: any) {
  const nuevaCantidad = parseInt(event.detail.value, 10);
  const producto = this.carritoDetalles[index];
  
  if (nuevaCantidad > 0) {
    if (nuevaCantidad <= producto.stock) {
      // Si hay stock suficiente, actualiza cantidad y subtotal
      producto.cantidad = nuevaCantidad;
      producto.subtotal = producto.precio * nuevaCantidad;

      const carritoActual = this.carritoService.obtenerCarrito();
      carritoActual[index].cantidad = nuevaCantidad;
      this.carritoService.actualizarCarrito(carritoActual);
    } else {
      // Si no hay suficiente stock, mostrar un mensaje o ajustar cantidad al stock disponible
      // Aquí te dejo un ejemplo mostrando un alert:
     await this.presentarAlerta(`No hay suficiente stock. Solo quedan ${producto.stock} unidades disponibles.`);
      
      // Opcional: ajustar cantidad al stock máximo
      producto.cantidad = producto.stock;
      producto.subtotal = producto.precio * producto.stock;

      const carritoActual = this.carritoService.obtenerCarrito();
      carritoActual[index].cantidad = producto.stock;
      this.carritoService.actualizarCarrito(carritoActual);

      // También puedes actualizar el valor en el input para que refleje la cantidad máxima permitida,
      // pero para eso necesitaría ver el template HTML.
    }
  } else {
    this.eliminarProducto(index);
  }
}
async presentarAlerta(mensaje: string) {
  const alert = await this.alertController.create({
    header: '¡Atención!',
    message: mensaje,
    buttons: ['OK']
  });

  await alert.present();
}
  getNombreComuna(idComuna: number): string {
    if (!this.comunas || !idComuna) return 'Sin comuna';
    const comuna = this.comunas.find(c => c.id_comuna === idComuna);
    return comuna ? comuna.nombre_comuna : 'Comuna no encontrada';
  }
  eliminarProducto(index: number) {
    this.carritoDetalles.splice(index, 1);
    const carritoActual = this.carritoService.obtenerCarrito();
    carritoActual.splice(index, 1);
    this.carritoService.actualizarCarrito(carritoActual);
  }

  // Agrega este método para calcular el subtotal sin descuento
  calcularSubtotal(): number {
    return this.carritoDetalles.reduce((acc, item) => acc + item.subtotal, 0);
  }

  // Modifica el método calcularTotal
  calcularTotal() {
    const subtotal = this.calcularSubtotal();
    const cantidadTotal = this.obtenerCantidadTotal();
    
    // Aplicar descuento del 10% si hay más de 4 productos
    if (cantidadTotal > 4) {
      return subtotal * 0.9; // Aplica 10% de descuento
    }
    
    return subtotal;
  }

  // Método auxiliar para obtener cantidad total
  obtenerCantidadTotal(): number {
    return this.carritoDetalles.reduce((acc, item) => acc + item.cantidad, 0);
  }

  // Método para obtener el monto del descuento
  getDescuentoAplicado(): number {
    const cantidadTotal = this.obtenerCantidadTotal();
    if (cantidadTotal > 4) {
      return this.calcularSubtotal() * 0.1;
    }
    return 0;
  }
// Método para confirmar pago (usado para transferencias)


generarIdUnico(): number {
  return Date.now(); // O cualquier lógica que quieras para generar IDs únicos
}

private generarPedidoCompleto() {
  const fechaActual = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const idPedido = this.generarIdUnico(); // puedes usar Date.now() o lógica personalizada
  const idPago = this.generarIdUnico();

  const tipoPagoSeleccionado = this.pagoForm.value.id_tipo_pago;
  const tipoEntregaSeleccionado = this.pagoForm.value.id_entrega;
  const esTransferencia = tipoPagoSeleccionado === 3; // supongamos que 3 = transferencia
  const esDebitoCredito = tipoPagoSeleccionado === 1 || tipoPagoSeleccionado === 2;

  const pedido = {
    id_pedido: idPedido,
    descripcion: 'Pedido Realizado en la App',
    total_a_pagar: this.calcularTotal(),
    cantidad: this.carritoDetalles.length,
    tiene_descuento: 'N',
    fecha_pedido: fechaActual,
    id_sucursal: this.mostrarSeleccionSucursal ? this.pagoForm.value.id_sucursal : 1,
    id_estado_pago: esDebitoCredito ? 1 : 2, // 1 = Pagado, 2 = Pendiente
    id_estado_pedido: 1, // Pendiente por defecto
    id_entrega: tipoEntregaSeleccionado,
    rut_usuario: this.pagoForm.value.rut,

    id_pago: idPago,
    monto_total: this.calcularTotal(),
    fecha_pago: fechaActual,
    id_tipo_pago: tipoPagoSeleccionado,
    imagen: esTransferencia ? this.imagenSeleccionadaBase64 : '',

    productos: this.carritoDetalles.map(p => p.id_producto)
  };
  console.log('PEDIDO:', pedido);
  return pedido;
}
onCambioTipoEntrega(event: any) {
  const tipoEntrega = event.detail.value;

  if (tipoEntrega === 2) { // despacho a domicilio
    this.mostrarCampoDireccion = true;
    this.mostrarSeleccionSucursal = false;
    this.pagoForm.get('direccion')?.setValidators([Validators.required]);
    this.pagoForm.get('sucursal')?.clearValidators();
  } else {
    this.mostrarCampoDireccion = false;
    this.mostrarSeleccionSucursal = true;
    this.pagoForm.get('direccion')?.clearValidators();
    this.pagoForm.get('sucursal')?.setValidators([Validators.required]);
  }

  this.pagoForm.get('direccion')?.updateValueAndValidity();
  this.pagoForm.get('sucursal')?.updateValueAndValidity();
}


onSucursalSeleccionada(event: any) {
  const id = event.detail.value;
  this.sucursalSeleccionada = this.sucursales.find(s => s.id_sucursal === id);
}
onDireccionEscrita(event: any) {
  this.direccionTemporal = event.detail.value;
}

// Método modificado para cambio de tipo de pago
onCambioTipoPago(event: any) {
  const tipoPago = Number(event.detail.value);
  
  // Limpiar el contenedor de PayPal si ya estaba cargado
  if (this.paypalLoaded) {
    const paypalContainer = document.getElementById(this.paypalButtonId);
    if (paypalContainer) {
      paypalContainer.innerHTML = ''; // Limpiar el contenedor
    }
    this.paypalLoaded = false;
    this.paypal = null;
  }

  // Mostrar PayPal solo para débito (3) o crédito (1)
  this.mostrarPaypal = tipoPago === this.TIPO_PAGO.DEBITO || tipoPago === this.TIPO_PAGO.CREDITO;
  
  // Mostrar campo de imagen solo para transferencia (2)
  this.mostrarCampoImagen = tipoPago === this.TIPO_PAGO.TRANSFERENCIA;
  
  // Cargar PayPal solo cuando se seleccione y no esté ya cargado
  if (this.mostrarPaypal) {
    this.loadPaypalScript();
  }

  // Mensaje para transferencia
  if (tipoPago === this.TIPO_PAGO.TRANSFERENCIA) {
    this.mostrarAdvertencia('Con transferencia, el pedido quedará como PENDIENTE hasta confirmar el pago');
  }

  // Actualizar validadores
  const imagenControl = this.pagoForm.get('imagen');
  if (tipoPago === this.TIPO_PAGO.TRANSFERENCIA) {
    imagenControl?.setValidators([Validators.required]);
  } else {
    imagenControl?.clearValidators();
    this.imagenSeleccionadaBase64 = null;
    this.selectedFile = null;
    imagenControl?.setValue(null);
  }
  imagenControl?.updateValueAndValidity();
}


async mostrarAdvertencia(mensaje: string) {
  const toast = await this.toastController.create({
    message: mensaje,
    duration: 4000,
    color: 'warning',
    position: 'top'
  });
  await toast.present();
}

mostrarCampoDireccion = false;

 onImagenSeleccionada(event: any) {
    const archivo = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenSeleccionadaBase64 = reader.result as string;
    };
    if (archivo) {
      reader.readAsDataURL(archivo);
    }
  }
  private convertirImagenABase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

async cargar_estado_pago() {
  try {
    this.estado_pagos = await this.productosService.obtener_estados_pagos();
  } catch (error) {
    console.error('Error al cargar Estado Pagos:', error);
    const toast = await this.toastController.create({
      message: 'Error al cargar Estado Pagos',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
}
async cargar_estado_pedidos() {
  try {
    this.estado_pedidos = await this.productosService.obtener_estados_pedidos();
  } catch (error) {
    console.error('Error al cargar Estado Pedidos:', error);
    const toast = await this.toastController.create({
      message: 'Error al cargar Estado Pedidos',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
}
async cargar_entregas() {
  try {
    this.entregas = await this.productosService.obtener_tipo_entregas();
  } catch (error) {
    console.error('Error al cargar Entregas:', error);
    const toast = await this.toastController.create({
      message: 'Error al cargar Entregas',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
}
async cargar_tipo_pago() {
  try {
    this.tipo_pagos = await this.productosService.obtener_tipo_pagos();
  } catch (error) {
    console.error('Error al cargar Tipo Pagos:', error);
    const toast = await this.toastController.create({
      message: 'Error al cargar Tipo Pagos',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
}
async generarBoletaPDF() {
  // Verificar si hay productos en el carrito
  if (this.carritoDetalles.length === 0) {
    await this.mostrarError('No hay productos en el carrito para generar la boleta');
    return;
  }

  // Verificar si el formulario es válido
  if (this.pagoForm.invalid) {
    await this.mostrarError('Complete todos los campos requeridos antes de generar la boleta');
    return;
  }

  try {
    const doc = new jsPDF();
    const fecha = new Date();
    const formValue = this.pagoForm.value;

    // Configuración inicial
    doc.setFont('helvetica');
    doc.setFontSize(12);
    let yPos = 20;

    // Logo (si está disponible)
    if (this.logoBase64) {
      doc.addImage(this.logoBase64, 'PNG', 15, 10, 30, 30);
    }

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('BOLETA ELECTRÓNICA', 105, yPos, { align: 'center' });
    yPos += 10;

    // Información de la empresa
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Tienda Online', 105, yPos, { align: 'center' });
    yPos += 5;
    doc.text('RUT: 76.123.456-7', 105, yPos, { align: 'center' });
    yPos += 5;
    doc.text('Dirección: Av. Principal 123, Santiago', 105, yPos, { align: 'center' });
    yPos += 15;

    // Línea divisoria
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos, 195, yPos);
    yPos += 10;

    // Información del cliente
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Datos del Cliente:', 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text(`Nombre: ${formValue.nombre}`, 20, yPos);
    doc.text(`RUT: ${formValue.rut}`, 120, yPos);
    yPos += 7;

    // Información del pedido
    doc.text(`Fecha: ${fecha.toLocaleDateString('es-CL')} ${fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`, 20, yPos);
    yPos += 7;

    // Obtener nombres de tipo de pago y entrega
    const tipoPago = this.tipo_pagos.find(tp => tp.id_tipo_pago === formValue.id_tipo_pago)?.descripcion || 'No especificado';
    const tipoEntrega = this.entregas.find(e => e.id_entrega === formValue.id_entrega)?.descripcion|| 'No especificado';

    doc.text(`Tipo de Pago: ${tipoPago}`, 20, yPos);
    doc.text(`Tipo de Entrega: ${tipoEntrega}`, 120, yPos);
    yPos += 7;

    if (formValue.id_entrega === 1 && this.sucursalSeleccionada) { // Retiro en sucursal
      doc.text(`Sucursal: ${this.sucursalSeleccionada.nombre_sucursal}`, 20, yPos);
      yPos += 7;
      doc.text(`Dirección Sucursal: ${this.sucursalSeleccionada.direccion_sucursal}`, 20, yPos);
      yPos += 7;
    } else if (formValue.id_entrega === 2 && formValue.direccion) { // Despacho a domicilio
      doc.text(`Dirección de Entrega: ${formValue.direccion}`, 20, yPos);
      yPos += 7;
    }

    // Línea divisoria
    yPos += 5;
    doc.line(15, yPos, 195, yPos);
    yPos += 10;

    // Detalle de productos
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Detalle del Pedido:', 20, yPos);
    yPos += 10;

    // Encabezados de la tabla
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(70, 130, 180);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.text('Producto', 20, yPos);
    doc.text('Cant.', 120, yPos);
    doc.text('P. Unitario', 140, yPos);
    doc.text('Subtotal', 170, yPos);
    yPos += 10;

    // Detalle de productos
    doc.setTextColor(40, 40, 40);
    this.carritoDetalles.forEach(item => {
      // Asegurarse de que el texto no se salga de la página
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Nombre del producto (puede ser multilínea si es muy largo)
      const nombreLines = doc.splitTextToSize(item.nombre, 80);
      doc.text(nombreLines, 20, yPos);
      
      // Si el nombre ocupa más de una línea, ajustamos la posición Y
      const nombreHeight = nombreLines.length * 5;
      
      // Resto de los datos
      doc.text(item.cantidad.toString(), 120, yPos);
      doc.text(`$${item.precio.toLocaleString('es-CL')}`, 140, yPos);
      doc.text(`$${(item.precio * item.cantidad).toLocaleString('es-CL')}`, 170, yPos);
      
      yPos += Math.max(nombreHeight, 10);
    });

    // Línea divisoria antes de totales
    yPos += 5;
    doc.line(15, yPos, 195, yPos);
    yPos += 10;

    // Totales
    const subtotal = this.calcularSubtotal();
    const descuento = this.getDescuentoAplicado();
    const total = this.calcularTotal();

    doc.setFontSize(11);
    doc.text(`Subtotal:`, 140, yPos);
    doc.text(`$${subtotal.toLocaleString('es-CL')}`, 170, yPos);
    yPos += 7;

    if (descuento > 0) {
      doc.text(`Descuento (10%):`, 140, yPos);
      doc.text(`-$${descuento.toLocaleString('es-CL')}`, 170, yPos);
      yPos += 7;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total:`, 140, yPos);
    doc.text(`$${total.toLocaleString('es-CL')}`, 170, yPos);
    yPos += 10;

    // Notas
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('* Este documento es una boleta electrónica y no requiere firma.', 20, yPos);
    yPos += 5;
    doc.text('* Para consultas o reclamos, contacte a nuestro servicio al cliente.', 20, yPos);
    yPos += 5;
    doc.text('* Gracias por su compra!', 20, yPos);

    // Guardar el PDF
    doc.save(`boleta_${fecha.getTime()}.pdf`);

    // Mostrar mensaje de éxito
    await this.mostrarExito('Boleta generada con éxito');
    
    // Guardar datos de la boleta para posible reutilización
    this.datosBoleta = {
      fecha,
      nombre: formValue.nombre,
      rut: formValue.rut,
      tipoPago,
      tipoEntrega,
      total,
      productos: this.carritoDetalles
    };

  } catch (error) {
    console.error('Error al generar boleta:', error);
    await this.mostrarError('Ocurrió un error al generar la boleta');
  }
}
}
