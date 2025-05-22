import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, IonList, ToastController } from '@ionic/angular';
import { ProductosService } from 'src/app/service/productos.service';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  standalone: true
})
export class InventarioPage implements OnInit {
  @ViewChild(IonList) ionList: IonList | undefined;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  
  productoForm: FormGroup;
  selectedFile: File | null = null;
  productos: any[] = [];
  marcas: any[] = [];
  categorias: any[] = [];
  inventario: any[] = [];
  botonModificar = false;
  MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

  constructor(
    private fb: FormBuilder,
    private productosService: ProductosService,
    private toastController: ToastController
  ) { 
    this.productoForm = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', Validators.maxLength(500)],
      imagen: [''],
      precio: [0, [Validators.required, Validators.min(0), Validators.max(100000)]],
      stock: [0, [Validators.required, Validators.min(0), Validators.max(10000)]],
      marca: ['', Validators.required], // Usado para marca
      inventario: [''],
      categoria: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.cargarProductos();
    await this.cargarMarcas();
    await this.cargarCategorias();
    await this.cargarInventario();
  }

  async cargarProductos() {
    try {
      this.productos = await this.productosService.obtenerProductos();
    } catch (error) {
      console.error('Error cargando productos:', error);
      // Mostrar mensaje de error al usuario
    }
  }
async cargarMarcas() {
  try {
    this.marcas = await this.productosService.obtenerMarcas();
  } catch (error) {
    console.error('Error al cargar marcas:', error);
    // Opcional: Mostrar toast o alerta al usuario
    const toast = await this.toastController.create({
      message: 'Error al cargar las marcas',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
}
async cargarCategorias() {
  try {
    this.categorias = await this.productosService.obtenerCategorias();
  } catch (error) {
    console.error('Error al cargar marcas:', error);
    // Opcional: Mostrar toast o alerta al usuario
    const toast = await this.toastController.create({
      message: 'Error al cargar las marcas',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
}
async cargarInventario() {
  try {
    this.inventario = await this.productosService.obtenerInventario();
  } catch (error) {
    console.error('Error al cargar marcas:', error);
    // Opcional: Mostrar toast o alerta al usuario
    const toast = await this.toastController.create({
      message: 'Error al cargar las marcas',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
}
private getNextId(): number {
  if (this.productos.length === 0) return 1;
  
  const maxId = Math.max(...this.productos.map(p => p.id_producto));
  return maxId + 1;
}
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validar archivo
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        alert('Solo se permiten imágenes JPEG, PNG o GIF');
        return;
      }
      
      if (file.size > this.MAX_FILE_SIZE) {
        alert('El archivo es demasiado grande (máx 5MB)');
        return;
      }
      
      this.selectedFile = file;
      this.uploadImage();
    }
  }

  async uploadImage() {
    if (!this.selectedFile) return;

    try {
      const imagePath = await this.productosService.uploadImage(this.selectedFile);
      this.productoForm.patchValue({ imagen: imagePath });
    } catch (error) {
      console.error('Error al subir imagen:', error);
    }
  }
  handleImageError(event: any, producto: any) {
    event.target.src = 'assets/images/relleno1.png';
  }
  async buscar(producto: any) {
  this.botonModificar = true;
  this.productoForm.patchValue({
    id: producto.id_producto,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    imagen: producto.imagen,
    precio: producto.precio,
    stock: producto.stock,
    marca: producto.id_marca,
    inventario: producto.id_inventario,
    categoria: producto.id_categoria
  });
  this.ionList?.closeSlidingItems();
}

async modificar() {
  if (this.productoForm.invalid) return;

  const formData = this.productoForm.value;
  const id = Number(formData.id);
  
  const updateData = {
    nombre: formData.nombre,
    descripcion: formData.descripcion,
    imagen: formData.imagen || null,
    precio: Number(formData.precio),
    stock: Number(formData.stock),
    id_marca: Number(formData.marca),
    id_categoria: Number(formData.categoria)
    // id_inventario puede omitirse o manejarse según tu lógica
  };

  try {
    await this.productosService.actualizarProducto(id, updateData);
    await this.cargarProductos();
    this.limpiarFormulario();
    // Manejo de éxito...
  } catch (error) {
    // Manejo de errores...
  }
}
// Añade este método para mostrar errores
private async mostrarError(mensaje: string) {
  const toast = await this.toastController.create({
    message: mensaje,
    duration: 3000,
    color: 'danger'
  });
  await toast.present();
}

 async onSubmit() {
  if (this.productoForm.invalid) {
    Object.values(this.productoForm.controls).forEach(control => {
      control.markAsTouched();
    });
    return;
  }

  try {
    const productoData = this.productoForm.value;
    
    // Solo asignar ID si es un nuevo producto (no tiene ID)
    if (!productoData.id) {
      productoData.id = this.getNextId();
    }

    await this.productosService.guardarProducto(productoData);

    await this.cargarProductos();
    this.limpiarFormulario();
    this.selectedFile = null;

    const toast = await this.toastController.create({
      message: 'Producto guardado correctamente',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

  } catch (error) {
    console.error('Error al guardar producto:', error);
    await this.handleError(error, 'Error al guardar el producto');
  }
}

private async handleError(error: unknown, defaultMessage: string) {
  console.error(error);
  
  let message = defaultMessage;
  
  if (error instanceof Error) {
    message += `: ${error.message}`;
  } else if (typeof error === 'string') {
    message += `: ${error}`;
  }

  const toast = await this.toastController.create({
    message,
    duration: 3000,
    color: 'danger'
  });
  
  await toast.present();
}
limpiarFormulario(): void {
    // Reinicia el formulario
    this.productoForm.reset({
      id: '',
      nombre: '',
      descripcion: '',
      imagen: '',
      precio: 0,
      stock: 0,
      marca: '',
      inventario: '',
      categoria: ''
    });

    // Limpia el input de archivo
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }

    // Limpia las variables relacionadas
    this.selectedFile = null;
    this.botonModificar = false;

    // Restablece el estado del formulario
    this.productoForm.markAsPristine();
    this.productoForm.markAsUntouched();

    // Cierra los elementos deslizables si están abiertos
    this.ionList?.closeSlidingItems();
  }

async eliminar(id: number) {
  if (!confirm('¿Estás seguro de eliminar este producto?')) {
    this.ionList?.closeSlidingItems();
    return;
  }

  try {
    const producto = this.productos.find(p => p.id_producto === id);
    if (!producto) throw new Error('Producto no encontrado');

    // 1. Eliminar el producto
    const resultado = await this.productosService.eliminarProducto(id);
    this.limpiarFormulario();


    // 3. Recargar lista y mostrar mensaje
    await this.cargarProductos();
    const toast = await this.toastController.create({
      message: 'Producto eliminado correctamente',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

  } catch (error) {
    console.error('Error eliminando producto:', error);
    await this.handleError(error, 'Error al eliminar el producto');
  }

  this.ionList?.closeSlidingItems();
}
}