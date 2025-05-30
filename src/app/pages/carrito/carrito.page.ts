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

declare const paypal: any;

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
  private carritoSubscription!: Subscription;
  usuarioActual: any;
  errorUsuario: string = '';
  constructor(
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
      imagen:[null]
    });
  }

  async ngOnInit() {
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
        const producto = await this.productosService.obtenerProductoPorId(item.id_producto);
        return {
          ...producto,
          cantidad: item.cantidad,
          subtotal: producto.precio * item.cantidad
        };
      })
    );
  }

  async cambiarCantidad(index: number, event: any) {
    const nuevaCantidad = parseInt(event.detail.value, 10);
    if (nuevaCantidad > 0) {
      this.carritoDetalles[index].cantidad = nuevaCantidad;
      this.carritoDetalles[index].subtotal = this.carritoDetalles[index].precio * nuevaCantidad;
      const carritoActual = this.carritoService.obtenerCarrito();
      carritoActual[index].cantidad = nuevaCantidad;
      this.carritoService.actualizarCarrito(carritoActual);
    } else {
      this.eliminarProducto(index);
    }
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

  calcularTotal() {
    return this.carritoDetalles.reduce((acc, item) => acc + item.subtotal, 0);
  }

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

  if (this.carritoDetalles.length === 0) {
    await this.mostrarError('No hay productos en el carrito.');
    return;
  }

  const tipoPagoSeleccionado = this.pagoForm.value.id_tipo_pago;

  // 1 y 2: Tarjeta débito/crédito vía PayPal
  const esPayPal = tipoPagoSeleccionado === 1 || tipoPagoSeleccionado === 2;
  const esTransferencia = tipoPagoSeleccionado === 3;

  if (esTransferencia && !this.imagenSeleccionadaBase64) {
    const alert = await this.alertCtrl.create({
      header: 'Comprobante faltante',
      message: 'Por favor, sube una imagen del comprobante de transferencia.',
      buttons: ['Aceptar']
    });
    await alert.present();
    return;
  }

  const pedidoParaGuardar = this.generarPedidoCompleto();

  if (esPayPal) {
    // Mostrar botón PayPal dinámicamente en contenedor
    const paypalContainer = document.getElementById('paypal-button-container');
    if (paypalContainer) {
      paypalContainer.innerHTML = ''; // Limpiar si ya hay un botón renderizado

      paypal.Buttons({
        createOrder: (data:any, actions:any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: (pedidoParaGuardar.total_a_pagar / 1000).toFixed(2) // ajusta según tu moneda
              }
            }]
          });
        },
        onApprove: async (data:any, actions:any) => {
          const details = await actions.order.capture();
          console.log('Pago aprobado por PayPal:', details);

          // Cambiar estado a pagado
          pedidoParaGuardar.id_estado_pago = 1;

          this.usuarioService.registrarPedidoCompleto(pedidoParaGuardar).subscribe({
            next: async () => {
              await this.mostrarExito('Pedido pagado y guardado con éxito');
              this.carritoService.limpiarCarrito();
              this.router.navigate(['/home']);
            },
            error: async (err) => {
              console.error('Error al guardar el pedido:', err);
              await this.mostrarError('El pago fue exitoso, pero no se pudo guardar el pedido. Contáctanos.');
            }
          });
        },
        onError: async (err:any) => {
          console.error('Error en PayPal:', err);
          await this.mostrarError('Error al procesar el pago con PayPal.');
        }
      }).render('#paypal-button-container');
    } else {
      console.error('No se encontró el contenedor PayPal.');
      await this.mostrarError('No se pudo inicializar el pago con PayPal.');
    }

    return; // salir del flujo para esperar PayPal
  }

  // Transferencia u otro método
  this.usuarioService.registrarPedidoCompleto(pedidoParaGuardar).subscribe({
    next: async () => {
      await this.mostrarExito('Pedido guardado con éxito');
      this.carritoService.limpiarCarrito();
      this.router.navigate(['/home']);
    },
    error: async (err) => {
      console.error('Error al guardar el pedido:', err);
      await this.mostrarError('No se pudo guardar el pedido. Intenta nuevamente.');
    }
  });
}async confirmarPago1() {
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

  // Generar un id único para pedido y pago (timestamp por simplicidad)
  const idPedido = Date.now();  // Puedes usar otro método para generar ID único
  const idPago = Date.now() + 1; // Solo para que no coincida con idPedido

  const pedidoParaGuardar = {
    id_pedido: idPedido,
    descripcion: "Pedido realizado en la APP",
    total_a_pagar: total,
    cantidad: cantidadProductos,
    tiene_descuento: "N",
    fecha_pedido: new Date().toISOString().split('T')[0],
    id_sucursal: this.sucursalSeleccionada?.id_sucursal || 1,
    id_estado_pago: 2,
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

generarIdUnico(): number {
  return Date.now(); // O cualquier lógica que quieras para generar IDs únicos
}


private generarPedidoCompleto() {
  const fechaActual = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const idPedido = this.generarIdUnico(); // puedes usar Date.now() o lógica personalizada
  const idPago = this.generarIdUnico();

  const tipoPagoSeleccionado = this.pagoForm.value.id_tipo_pago;
  const tipoEntregaSeleccionado = this.pagoForm.value.id_entrega;
  const esTransferencia = tipoPagoSeleccionado === 2; // supongamos que 3 = transferencia
  const esDebitoCredito = tipoPagoSeleccionado === 1 || tipoPagoSeleccionado === 3;

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

esPayPal = false; // inicial

mostrarCampoImagen1 = false;

onCambioTipoPago(event: any) {
  const tipoPago = event.detail.value;
   this.mostrarCampoImagen1 = tipoPago === 2;

  // Controlar si se debe usar PayPal
  this.esPayPal = (tipoPago === 1 || tipoPago === 3);

  if (this.esPayPal) {
    this.renderizarBotonPayPal();
  }
}

renderizarBotonPayPal() {
  paypal.Buttons({
    createOrder: (data: any, actions: any) => {
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: this.calcularTotal().toString()
          }
        }]
      });
    },
    onApprove: async (data: any, actions: any) => {
      const details = await actions.order.capture();
      console.log('Pago aprobado:', details);
      // Tu lógica después del pago exitoso
    },
    onError: async (err: any) => {
      console.error('Error PayPal:', err);
    }
  }).render('#paypal-button-container');
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
  generarBoletaPDF() {
    const doc = new jsPDF();
    const fecha = new Date();
    const datos = this.datosBoleta;

    if (this.logoBase64) {
      doc.addImage(this.logoBase64, 'PNG', 15, 10, 30, 30);
    }

    doc.setFontSize(18);
    doc.text('Boleta Electrónica', 60, 20);

    doc.setFontSize(12);
    doc.text(`Fecha: ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}`, 60, 30);
    doc.text(`Cliente: ${datos.nombre}`, 20, 50);
    doc.text(`RUT: ${datos.rut}`, 20, 60);
    doc.text(`Tipo de Pago: ${datos.tipoPago}`, 20, 70);
    doc.text(`Tipo de Entrega: ${datos.tipoEntrega}`, 20, 80);
    doc.text(`Total: $${datos.total.toLocaleString()}`, 20, 90);

    let y = 110;
    doc.text('Detalle de Productos:', 20, y);
    y += 10;

    this.carritoDetalles.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.nombre} x${item.cantidad} - $${item.subtotal.toLocaleString()}`,
        20,
        y
      );
      y += 10;
    });

    doc.save('boleta.pdf');
  }
}
